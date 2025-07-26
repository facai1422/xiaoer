import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { supabase, CustomerServiceRealtime } from '@/lib/supabase'
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  Wifi,
  WifiOff,
  ArrowDown,
  Loader2
} from 'lucide-react'

interface CustomerInfo {
  name: string
  email: string
  phone?: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
}

interface ChatSession {
  id: string
  customer_id: string
  agent_id?: string
  status: 'waiting' | 'active' | 'closed'
  source: string
  subject?: string
  created_at: string
  assigned_at?: string
  closed_at?: string
  last_message_at?: string
  customer_service_agents?: {
    agent_name: string
    agent_code: string
  }
}

interface ChatMessage {
  id: string
  session_id: string
  sender_type: 'customer' | 'agent' | 'system'
  sender_id?: string
  message_type: 'text' | 'image' | 'file' | 'system'
  content: string
  created_at: string
}

interface CustomerChatProps {
  customerInfo: CustomerInfo
  onClose?: () => void
  className?: string
}

// 消息气泡组件
const MessageBubble: React.FC<{
  message: ChatMessage
  isOwn: boolean
}> = ({ message, isOwn }) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
          message.sender_type === 'system'
            ? 'bg-gray-100 text-gray-600 text-center text-xs'
            : isOwn
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        <p>{message.content}</p>
        <p className={`text-xs mt-1 opacity-70 ${
          message.sender_type === 'system' ? 'text-gray-500' : ''
        }`}>
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  )
}

export default function CustomerChat({ customerInfo, onClose, className = '' }: CustomerChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [session, setSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'waiting' | 'active' | 'closed'>('connecting')
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [newMessageCount, setNewMessageCount] = useState(0)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  
  const realtimeRef = useRef<CustomerServiceRealtime | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const lastScrollTop = useRef(0)

  // 智能滚动到底部
  const scrollToBottom = (force = false) => {
    if (force || isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setNewMessageCount(0)
    }
  }

  // 监听滚动位置
  const handleScroll = () => {
    if (!messagesContainerRef.current) return

    const container = messagesContainerRef.current
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight

    // 检查是否在底部
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50
    setIsAtBottom(isNearBottom)

    if (isNearBottom) {
      setNewMessageCount(0)
    }

    // 检查是否滚动到顶部（加载历史消息）
    if (scrollTop === 0 && !isLoadingHistory && hasMoreMessages && messages.length > 0) {
      loadHistoryMessages()
    }

    lastScrollTop.current = scrollTop
  }

  // 加载历史消息
  const loadHistoryMessages = async () => {
    if (!session || isLoadingHistory || !hasMoreMessages) return

    setIsLoadingHistory(true)
    try {
      const { data: historyMessages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', session.id)
        .lt('created_at', messages[0]?.created_at || new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(15)

      if (error) throw error

      if (historyMessages && historyMessages.length > 0) {
        // 保存当前滚动位置
        const currentScrollHeight = messagesContainerRef.current?.scrollHeight || 0
        
        // 倒序排列并添加到消息开头
        const sortedHistory = historyMessages.reverse()
        setMessages(prev => [...sortedHistory, ...prev])
        
        // 恢复滚动位置
        setTimeout(() => {
          if (messagesContainerRef.current) {
            const newScrollHeight = messagesContainerRef.current.scrollHeight
            messagesContainerRef.current.scrollTop = newScrollHeight - currentScrollHeight
          }
        }, 50)
      } else {
        setHasMoreMessages(false)
      }
    } catch (error) {
      console.error('加载历史消息失败:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // 初始化客户和会话
  const initializeChat = async () => {
    try {
      setLoading(true)
      setConnectionStatus('connecting')

      // 创建或获取客户
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', customerInfo.email)
        .single()

      let customer
      if (existingCustomer) {
        customer = existingCustomer
      } else {
        const { data: newCustomer, error } = await supabase
          .from('customers')
          .insert({
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
            source: 'website'
          })
          .select()
          .single()

        if (error) throw error
        customer = newCustomer
      }

      setCustomerId(customer.id)

      // 检查是否有活跃会话
      const { data: activeSession } = await supabase
        .from('chat_sessions')
        .select(`
          *,
          customer_service_agents(
            agent_name,
            agent_code
          )
        `)
        .eq('customer_id', customer.id)
        .in('status', ['waiting', 'active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (activeSession) {
        setSession(activeSession)
        setConnectionStatus(activeSession.status as 'waiting' | 'active' | 'closed')
        await loadMessages(activeSession.id)
      } else {
        // 创建新会话
        await createNewSession(customer.id)
      }

    } catch (error) {
      console.error('初始化聊天失败:', error)
      toast.error('连接客服失败，请稍后重试')
      setConnectionStatus('closed')
    } finally {
      setLoading(false)
    }
  }

  // 创建新会话
  const createNewSession = async (customerId: string) => {
    try {
      const { data: newSession, error } = await supabase
        .from('chat_sessions')
        .insert({
          customer_id: customerId,
          status: 'waiting',
          source: 'website',
          subject: '在线咨询'
        })
        .select()
        .single()

      if (error) throw error

      setSession(newSession)
      setConnectionStatus('waiting')

      // 发送欢迎消息
      await supabase
        .from('chat_messages')
        .insert({
          session_id: newSession.id,
          sender_type: 'system',
          message_type: 'system',
          content: '欢迎咨询！客服正在为您接入，请稍候...'
        })

      await loadMessages(newSession.id)
      toast.success('已连接客服，请稍候...')

    } catch (error) {
      console.error('创建会话失败:', error)
      toast.error('创建会话失败')
    }
  }

  // 加载消息
  const loadMessages = async (sessionId: string) => {
    try {
      setMessages([])
      setHasMoreMessages(true)
      setIsAtBottom(true)
      setNewMessageCount(0)

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(30) // 初始加载最近30条消息

      if (error) throw error
      setMessages(data || [])
      setTimeout(() => scrollToBottom(true), 100)
    } catch (error) {
      console.error('加载消息失败:', error)
    }
  }

  // 设置实时订阅
  useEffect(() => {
    if (!session || !customerId) return

    console.log('正在设置用户端实时订阅...')
    const realtime = new CustomerServiceRealtime(false) // 标识为用户端
    realtimeRef.current = realtime

    // 订阅当前会话的消息
    realtime.subscribeToMessages((payload) => {
      const newMessage = payload.new as ChatMessage
      console.log('用户端收到新消息:', newMessage)
      
      // 用户端只处理自己会话的消息
      if (newMessage.session_id === session.id) {
        setMessages(prev => {
          // 检查消息是否已存在，避免重复
          if (prev.some(msg => msg.id === newMessage.id)) {
            return prev
          }
          
          const newMessages = [...prev, newMessage]
          
          // 如果用户不在底部且是他人消息，增加新消息计数
          if (!isAtBottom && newMessage.sender_type === 'agent') {
            setNewMessageCount(count => count + 1)
          }
          
          return newMessages
        })
        
        // 如果在底部或是自己发送的消息，自动滚动
        if (isAtBottom || newMessage.sender_type === 'customer') {
          setTimeout(() => scrollToBottom(true), 100)
        }
        
        // 如果是客服消息，显示通知
        if (newMessage.sender_type === 'agent') {
          toast.success('客服回复了您的消息')
        }
      }
    }, session.id)

    // 订阅当前客户的会话状态变更
    realtime.subscribeToSessions((payload) => {
      const updatedSession = payload.new as ChatSession
      console.log('用户端会话状态变更:', updatedSession)
      
      if (updatedSession.id === session.id) {
        setSession(updatedSession)
        setConnectionStatus(updatedSession.status as 'waiting' | 'active' | 'closed')
        
        if (updatedSession.status === 'active') {
          toast.success('客服已接入')
        } else if (updatedSession.status === 'closed') {
          toast.info('会话已结束')
        }
      }
    }, customerId)

    // 监控连接状态
    const statusInterval = setInterval(() => {
      if (realtimeRef.current) {
        const status = realtimeRef.current.getConnectionStatus()
        console.log('用户端连接状态:', status)
        
        if (!realtimeRef.current.isHealthy() && reconnectAttempts < 3) {
          console.log('检测到连接异常，尝试重连...')
          setReconnectAttempts(prev => prev + 1)
          realtimeRef.current.forceReconnect()
        }
      }
    }, 10000) // 每10秒检查一次

    return () => {
      console.log('清理用户端实时订阅')
      clearInterval(statusInterval)
      realtime.cleanup()
    }
  }, [session, customerId, isAtBottom, reconnectAttempts])

  // 发送消息
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !session) return

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: session.id,
          sender_type: 'customer',
          message_type: 'text',
          content: messageInput.trim()
        })

      if (error) throw error
      setMessageInput('')
      
      // 自动滚动到底部
      setTimeout(() => scrollToBottom(true), 100)
    } catch (error) {
      console.error('发送消息失败:', error)
      toast.error('发送消息失败')
    }
  }

  // 打开聊天
  const handleOpenChat = () => {
    setIsOpen(true)
    setIsMinimized(false)
    setNewMessageCount(0)
    if (!session) {
      initializeChat()
    }
  }

  // 关闭聊天
  const handleCloseChat = () => {
    setIsOpen(false)
    setNewMessageCount(0)
    if (realtimeRef.current) {
      realtimeRef.current.cleanup()
    }
    onClose?.()
  }

  // 最小化/最大化
  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized)
    if (isMinimized) {
      setNewMessageCount(0)
    }
  }

  // 获取状态文本
  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connecting': return '连接中...'
      case 'waiting': return '等待客服接入...'
      case 'active': return '客服在线'
      case 'closed': return '会话已结束'
      default: return '未连接'
    }
  }

  // 获取状态颜色
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connecting': return 'bg-yellow-500'
      case 'waiting': return 'bg-orange-500'
      case 'active': return 'bg-green-500'
      case 'closed': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  // 获取连接图标
  const getConnectionIcon = () => {
    const isConnected = realtimeRef.current?.isHealthy() ?? false
    return isConnected ? 
      <Wifi className="w-3 h-3 text-green-500" /> : 
      <WifiOff className="w-3 h-3 text-red-500" />
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {!isOpen ? (
        // 聊天按钮
        <div className="relative">
          <Button
            onClick={handleOpenChat}
            className="w-14 h-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 text-white"
            size="lg"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
          {newMessageCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              {newMessageCount > 9 ? '9+' : newMessageCount}
            </div>
          )}
        </div>
      ) : (
        // 聊天窗口
        <Card className={`w-80 shadow-xl transition-all duration-300 ${
          isMinimized ? 'h-14' : 'h-96'
        }`}>
          {/* 聊天头部 */}
          <CardHeader className="p-3 bg-blue-500 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
                <CardTitle className="text-sm font-medium">
                  在线客服
                </CardTitle>
                {getConnectionIcon()}
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white hover:bg-blue-600"
                  onClick={handleToggleMinimize}
                >
                  {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white hover:bg-blue-600"
                  onClick={handleCloseChat}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {!isMinimized && (
              <div className="text-xs opacity-90 mt-1 flex items-center justify-between">
                <span>{getStatusText()}</span>
                {session?.customer_service_agents?.agent_name && (
                  <span>客服: {session.customer_service_agents.agent_name}</span>
                )}
              </div>
            )}
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0 flex flex-col h-80">
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">连接中...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* 消息区域 */}
                  <div className="flex-1 relative">
                    <ScrollArea 
                      className="h-60"
                      ref={messagesContainerRef}
                      onScrollCapture={handleScroll}
                    >
                      <div className="p-3">
                        {isLoadingHistory && (
                          <div className="text-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500 mx-auto" />
                            <p className="text-xs text-gray-500 mt-1">加载历史消息...</p>
                          </div>
                        )}
                        
                        {messages.map((message) => (
                          <MessageBubble
                            key={message.id}
                            message={message}
                            isOwn={message.sender_type === 'customer'}
                          />
                        ))}
                        
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* 新消息提示 */}
                    {newMessageCount > 0 && !isAtBottom && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
                        <Button
                          variant="default"
                          size="sm"
                          className="text-xs h-6 shadow-lg"
                          onClick={() => scrollToBottom(true)}
                        >
                          <ArrowDown className="w-3 h-3 mr-1" />
                          {newMessageCount} 条新消息
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* 输入区域 */}
                  <div className="p-3 border-t bg-gray-50">
                    <div className="flex space-x-2">
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="输入消息..."
                        className="flex-1 text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        disabled={connectionStatus === 'closed' || loading}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || connectionStatus === 'closed' || loading}
                        size="sm"
                        className="px-3"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {connectionStatus === 'closed' && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        会话已结束，点击重新开始新的对话
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
} 