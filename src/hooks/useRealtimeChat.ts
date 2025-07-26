import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface ChatMessage {
  id: string
  session_id: string
  sender_type: 'customer' | 'agent' | 'system'
  sender_id?: string
  message_type: 'text' | 'image' | 'file' | 'system' | 'quick_reply'
  content: string
  attachments?: Record<string, unknown>
  metadata?: Record<string, unknown>
  is_read: boolean
  read_at?: string
  created_at: string
}

export interface ChatSession {
  id: string
  session_code: string
  customer_id: string
  agent_id?: string
  status: 'waiting' | 'active' | 'closed' | 'transferred'
  priority: number
  source?: string
  subject?: string
  tags?: string[]
  satisfaction_rating?: number
  satisfaction_comment?: string
  started_at: string
  assigned_at?: string
  closed_at?: string
  last_message_at?: string
  created_at: string
  updated_at: string
  // 关联数据
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  agent_name?: string
  message_count?: number
  last_message?: string
}

interface UseRealtimeChatOptions {
  agentId?: string
  onNewMessage?: (message: ChatMessage) => void
  onSessionUpdate?: (session: ChatSession) => void
  onAgentStatusChange?: (data: Record<string, unknown>) => void
}

export const useRealtimeChat = (options: UseRealtimeChatOptions = {}) => {
  const { agentId, onNewMessage, onSessionUpdate, onAgentStatusChange } = options
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const channelsRef = useRef<RealtimeChannel[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 初始化提示音
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3') // 需要添加提示音文件
    audioRef.current.volume = 0.5
  }, [])

  // 播放提示音
  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error)
    }
  }, [])

  // 获取会话列表
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('chat_sessions')
        .select(`
          *,
          customers!inner(
            name,
            email,
            phone,
            vip_level
          ),
          customer_service_agents(
            agent_name,
            agent_code
          )
        `)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

      // 如果指定了客服ID，只获取分配给该客服的会话
      if (agentId) {
        query = query.or(`agent_id.eq.${agentId},agent_id.is.null`)
      }

      const { data, error } = await query

      if (error) throw error

      const formattedSessions: ChatSession[] = data?.map(session => ({
        ...session,
        customer_name: session.customers?.name,
        customer_email: session.customers?.email,
        customer_phone: session.customers?.phone,
        agent_name: session.customer_service_agents?.agent_name
      })) || []

      setSessions(formattedSessions)
    } catch (err) {
      console.error('获取会话列表失败:', err)
      setError(err instanceof Error ? err.message : '获取会话列表失败')
    } finally {
      setLoading(false)
    }
  }, [agentId])

  // 获取指定会话的消息
  const fetchMessages = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data || [])
      return data || []
    } catch (err) {
      console.error('获取消息失败:', err)
      setError(err instanceof Error ? err.message : '获取消息失败')
      return []
    }
  }, [])

  // 发送消息
  const sendMessage = useCallback(async (
    sessionId: string,
    content: string,
    messageType: 'text' | 'image' | 'file' | 'quick_reply' = 'text',
    attachments?: Record<string, unknown>
  ) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          sender_type: 'agent',
          sender_id: agentId,
          message_type: messageType,
          content,
          attachments
        })
        .select()
        .single()

      if (error) throw error

      return data
    } catch (err) {
      console.error('发送消息失败:', err)
      throw err
    }
  }, [agentId])

  // 接管会话
  const assignSession = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .update({
          agent_id: agentId,
          status: 'active',
          assigned_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single()

      if (error) throw error

      // 发送系统消息
      await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          sender_type: 'system',
          message_type: 'system',
          content: '客服已接入，为您服务'
        })

      return data
    } catch (err) {
      console.error('接管会话失败:', err)
      throw err
    }
  }, [agentId])

  // 结束会话
  const closeSession = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single()

      if (error) throw error

      // 发送系统消息
      await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          sender_type: 'system',
          message_type: 'system',
          content: '会话已结束'
        })

      return data
    } catch (err) {
      console.error('结束会话失败:', err)
      throw err
    }
  }, [])

  // 标记消息为已读
  const markAsRead = useCallback(async (messageIds: string[]) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .in('id', messageIds)

      if (error) throw error
    } catch (err) {
      console.error('标记已读失败:', err)
    }
  }, [])

  // 设置实时订阅
  useEffect(() => {
    const setupRealtimeSubscriptions = async () => {
      try {
        // 清理现有订阅
        channelsRef.current.forEach(channel => {
          supabase.removeChannel(channel)
        })
        channelsRef.current = []

        // 1. 订阅新消息通知
        const messageChannel = supabase
          .channel('new_customer_messages')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages'
          }, (payload) => {
            const newMessage = payload.new as ChatMessage
            console.log('收到新消息:', newMessage)
            
            // 播放提示音
            if (newMessage.sender_type === 'customer') {
              playNotificationSound()
            }
            
            // 更新消息列表
            setMessages(prev => [...prev, newMessage])
            
            // 调用回调
            onNewMessage?.(newMessage)
            
            // 刷新会话列表
            fetchSessions()
          })
          .subscribe()

        channelsRef.current.push(messageChannel)

        // 2. 订阅会话状态变更
        const sessionChannel = supabase
          .channel('chat_sessions_changes')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'chat_sessions'
          }, (payload) => {
            console.log('会话状态变更:', payload)
            
            if (payload.eventType === 'UPDATE') {
              const updatedSession = payload.new as ChatSession
              setSessions(prev => 
                prev.map(session => 
                  session.id === updatedSession.id ? { ...session, ...updatedSession } : session
                )
              )
              onSessionUpdate?.(updatedSession)
            } else if (payload.eventType === 'INSERT') {
              fetchSessions() // 有新会话时重新获取列表
            }
          })
          .subscribe()

        channelsRef.current.push(sessionChannel)

        // 3. 订阅客服状态变更
        const agentChannel = supabase
          .channel('agent_status_changes')
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'customer_service_agents'
          }, (payload) => {
            console.log('客服状态变更:', payload)
            onAgentStatusChange?.(payload.new)
          })
          .subscribe()

        channelsRef.current.push(agentChannel)

        console.log('实时订阅设置完成')
      } catch (err) {
        console.error('设置实时订阅失败:', err)
        setError('实时通信连接失败')
      }
    }

    setupRealtimeSubscriptions()

    // 清理函数
    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel)
      })
      channelsRef.current = []
    }
  }, [agentId, onNewMessage, onSessionUpdate, onAgentStatusChange, playNotificationSound, fetchSessions])

  // 初始加载数据
  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return {
    messages,
    sessions,
    loading,
    error,
    fetchSessions,
    fetchMessages,
    sendMessage,
    assignSession,
    closeSession,
    markAsRead,
    setMessages,
    setSessions
  }
} 