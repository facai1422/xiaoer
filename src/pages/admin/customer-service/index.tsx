import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { supabase, CustomerServiceRealtime, customerServiceAPI } from '@/lib/supabase'
import { runCompleteRealtimeTest, runDiagnostics, startRealtimeMonitor, stopRealtimeMonitor, getMonitorStats } from '@/lib/simple-realtime-test'
import { 
  MessageCircle, 
  User,
  Send,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Users,
  MessageSquare,
  RefreshCw,
  ArrowDown,
  Volume2
} from 'lucide-react'

interface Agent {
  id: string
  agent_name: string
  agent_code: string
  status: 'online' | 'busy' | 'away' | 'offline'
  user_id: string
  created_at: string
  last_active_at: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  vip_level?: number
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
  customers?: Customer
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

// 消息组件
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
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          message.sender_type === 'system'
            ? 'bg-gray-100 text-gray-600 text-center text-sm'
            : isOwn
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${
          message.sender_type === 'system' 
            ? 'text-gray-500' 
            : isOwn 
            ? 'text-blue-100' 
            : 'text-gray-500'
        }`}>
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  )
}

export default function CustomerServicePage() {
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState('连接中...')
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [newMessageCount, setNewMessageCount] = useState(0)
  
  const realtimeRef = useRef<CustomerServiceRealtime | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const lastScrollTop = useRef(0)

  // 初始化音频
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
    audioRef.current.volume = 0.3
  }, [])

  // 播放提示音
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error)
    }
  }

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
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    setIsAtBottom(isNearBottom)

    if (isNearBottom) {
      setNewMessageCount(0)
    }

    // 检查是否滚动到顶部（加载历史消息）
    if (scrollTop === 0 && !isLoadingHistory && hasMoreMessages) {
      loadHistoryMessages()
    }

    lastScrollTop.current = scrollTop
  }

  // 加载历史消息
  const loadHistoryMessages = async () => {
    if (!selectedSessionId || isLoadingHistory || !hasMoreMessages) return

    setIsLoadingHistory(true)
    try {
      const { data: historyMessages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', selectedSessionId)
        .lt('created_at', messages[0]?.created_at || new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20)

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
      toast.error('加载历史消息失败')
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // 初始化客服信息
  useEffect(() => {
    loadAgentInfo()
  }, [])

  const loadAgentInfo = async () => {
      try {
        const agent = await customerServiceAPI.getCurrentAgent()
        if (agent) {
          setCurrentAgent(agent)
          setConnectionStatus('已连接')
          await loadSessions(agent.id)
        } else {
        setConnectionStatus('未登录')
        toast.error('请先登录客服系统')
        }
      } catch (error) {
      console.error('获取客服信息失败:', error)
        setConnectionStatus('连接失败')
      toast.error('获取客服信息失败')
      } finally {
        setLoading(false)
      }
    }

  // 加载会话列表
  const loadSessions = async (agentId: string) => {
    try {
      const data = await customerServiceAPI.getSessions(agentId)
      setSessions(data || [])
    } catch (error) {
      console.error('加载会话列表失败:', error)
      toast.error('加载会话列表失败')
    }
  }

  // 加载消息
  const loadMessages = async (sessionId: string) => {
    try {
      setMessages([])
      setHasMoreMessages(true)
      setIsAtBottom(true)
      setNewMessageCount(0)
      
      const data = await customerServiceAPI.getMessages(sessionId)
      setMessages(data || [])
      setTimeout(() => scrollToBottom(true), 100)
    } catch (error) {
      console.error('加载消息失败:', error)
      toast.error('加载消息失败')
    }
  }

  // 设置实时订阅 - 使用最简单的方式
  useEffect(() => {
    if (!currentAgent) return

    console.log('🚀 正在设置管理后台实时订阅（简化版）...')
    
    // 直接创建Supabase channel，监听所有chat_messages变更
    const messageChannel = supabase
      .channel('admin-simple-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
        // 不添加任何过滤条件，接收所有消息
      }, (payload) => {
      const newMessage = payload.new as ChatMessage
        console.log('🔥 管理后台收到新消息（简化版）:', newMessage)
      
        // 如果是客户消息，播放提示音并显示通知
      if (newMessage.sender_type === 'customer') {
          console.log('👤 这是客户消息，播放提示音')
        playNotificationSound()
          toast.info(`收到客户新消息`)
          
          // 增加未读计数
          if (newMessage.session_id !== selectedSessionId) {
            setUnreadCount(prev => {
              console.log('📊 增加未读计数')
              return prev + 1
            })
          }
      }
      
      // 如果是当前会话的消息，更新消息列表
      if (newMessage.session_id === selectedSessionId) {
          console.log('💬 更新当前会话消息列表')
          setMessages(prev => {
            // 检查消息是否已存在，避免重复
            if (prev.some(msg => msg.id === newMessage.id)) {
              console.log('⚠️ 消息已存在，忽略')
              return prev
            }
            
            const newMessages = [...prev, newMessage]
            
            // 如果用户不在底部且是他人消息，增加新消息计数
            if (!isAtBottom && newMessage.sender_type !== 'agent') {
              setNewMessageCount(count => count + 1)
            }
            
            return newMessages
          })
          
          // 如果在底部或是自己发送的消息，自动滚动
          if (isAtBottom || newMessage.sender_type === 'agent') {
            setTimeout(() => scrollToBottom(true), 100)
          }
      }
      
        // 刷新会话列表以更新最后消息时间
        console.log('🔄 刷新会话列表')
        if (currentAgent) {
      loadSessions(currentAgent.id)
        }
      })
      .subscribe((status) => {
        console.log('📡 管理后台消息订阅状态:', status)
        setConnectionStatus(status === 'SUBSCRIBED' ? '已连接' : '连接中...')
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ 管理后台消息订阅成功')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ 管理后台消息订阅失败')
        }
    })

    // 订阅会话变更
    const sessionChannel = supabase
      .channel('admin-simple-sessions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_sessions'
      }, (payload) => {
        console.log('🔄 管理后台会话状态变更:', payload)
        
        // 当有新会话或会话状态变更时，刷新会话列表
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          if (currentAgent) {
      loadSessions(currentAgent.id)
          }
        }
      })
      .subscribe((status) => {
        console.log('📡 管理后台会话订阅状态:', status)
    })

    return () => {
      console.log('🧹 清理管理后台实时订阅（简化版）')
      supabase.removeChannel(messageChannel)
      supabase.removeChannel(sessionChannel)
    }
  }, [currentAgent, selectedSessionId, isAtBottom])

  // 发送消息
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedSessionId || !currentAgent) return

    try {
      await customerServiceAPI.sendMessage(selectedSessionId, messageInput.trim(), currentAgent.id)
      setMessageInput('')
      
      // 自动滚动到底部
      setTimeout(() => scrollToBottom(true), 100)
    } catch (error) {
      console.error('发送消息失败:', error)
      toast.error('发送消息失败')
    }
  }

  // 接管会话
  const handleAssignSession = async (sessionId: string) => {
    if (!currentAgent) return

    try {
      await customerServiceAPI.assignSession(sessionId, currentAgent.id)
      toast.success('已接管会话')
      await loadSessions(currentAgent.id)
      
      if (sessionId === selectedSessionId) {
        await loadMessages(sessionId)
      }
    } catch (error) {
      console.error('接管会话失败:', error)
      toast.error('接管会话失败')
    }
  }

  // 结束会话
  const handleCloseSession = async (sessionId: string) => {
    try {
      await customerServiceAPI.closeSession(sessionId)
      toast.success('会话已结束')
      await loadSessions(currentAgent?.id || '')
      
      if (sessionId === selectedSessionId) {
        setSelectedSessionId(null)
        setMessages([])
      }
    } catch (error) {
      console.error('结束会话失败:', error)
      toast.error('结束会话失败')
    }
  }

  // 选择会话
  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId)
    setUnreadCount(0)
    loadMessages(sessionId)
  }

  // 刷新会话列表
  const handleRefreshSessions = () => {
    if (currentAgent) {
      loadSessions(currentAgent.id)
      toast.success('会话列表已刷新')
    }
  }

  // 强制重连
  const handleReconnect = () => {
    if (realtimeRef.current) {
      realtimeRef.current.forceReconnect()
      toast.info('正在重新连接...')
    }
  }

  // 测试实时连接
  const handleTestRealtime = async () => {
    console.log('🧪 开始测试实时连接...')
    toast.info('正在测试实时连接，请查看控制台')
    
    // 运行完整的实时通信测试
    runCompleteRealtimeTest()
  }

  // 一键诊断
  const handleDiagnostics = async () => {
    console.log('🔧 开始一键诊断...')
    toast.info('正在执行完整诊断，请查看控制台')
    
    await runDiagnostics()
  }

  // 启动实时监控
  const handleStartMonitor = () => {
    const monitor = startRealtimeMonitor()
    toast.success('实时监控器已启动，查看控制台了解详情')
    
    // 10秒后显示统计信息
    setTimeout(() => {
      const stats = getMonitorStats()
      if (stats) {
        console.log('📊 监控器统计:', stats)
        toast.info(`监控器运行中，已收到 ${stats.messageCount} 条消息`)
      }
    }, 10000)
  }

  // 停止实时监控
  const handleStopMonitor = () => {
    stopRealtimeMonitor()
    toast.info('实时监控器已停止')
  }

  // 格式化时间
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      return date.toLocaleDateString('zh-CN')
  }

  // 获取会话状态图标
  const getSessionStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <AlertCircle className="w-4 h-4 text-orange-500" />
      case 'active':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'closed':
        return <Clock className="w-4 h-4 text-gray-400" />
      default:
        return <MessageCircle className="w-4 h-4 text-blue-500" />
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!currentAgent) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">客服系统</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">请先登录客服系统</p>
            <Button onClick={loadAgentInfo}>重新加载</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* 左侧会话列表 */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {currentAgent.agent_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-gray-900">{currentAgent.agent_name}</h3>
                <div className="flex items-center space-x-2">
                  {connectionStatus === '已连接' ? (
                    <Wifi className="w-3 h-3 text-green-500" />
                  ) : (
                    <WifiOff className="w-3 h-3 text-red-500" />
                  )}
                  <span className="text-xs text-gray-500">{connectionStatus}</span>
                </div>
              </div>
          </div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" onClick={handleRefreshSessions} title="刷新会话列表">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReconnect} title="重新连接">
                <Wifi className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleTestRealtime} title="测试实时连接">
                🧪
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDiagnostics} title="一键诊断">
                🔧
              </Button>
              <Button variant="ghost" size="sm" onClick={handleStartMonitor} title="启动监控">
                📊
              </Button>
              <Button variant="ghost" size="sm" onClick={handleStopMonitor} title="停止监控">
                ⏹️
              </Button>
        </div>
      </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-lg font-bold text-blue-600">{sessions.filter(s => s.status === 'waiting').length}</div>
              <div className="text-xs text-gray-600">等待中</div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="text-lg font-bold text-green-600">{sessions.filter(s => s.status === 'active').length}</div>
              <div className="text-xs text-gray-600">进行中</div>
                </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-lg font-bold text-gray-600">{unreadCount}</div>
              <div className="text-xs text-gray-600">未读</div>
              </div>
            </div>
          </div>

        {/* 会话列表 */}
          <ScrollArea className="flex-1">
          <div className="p-2">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>暂无会话</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                    selectedSessionId === session.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectSession(session.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {getSessionStatusIcon(session.status)}
                        <span className="font-medium text-gray-900 truncate">
                        {session.customers?.name || '匿名客户'}
                      </span>
                        {session.customers?.vip_level && (
                        <Badge variant="secondary" className="text-xs">
                          VIP{session.customers.vip_level}
                        </Badge>
                      )}
                    </div>
                      <p className="text-sm text-gray-600 truncate">{session.subject || '在线咨询'}</p>
                      <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                          {formatTime(session.last_message_at || session.created_at)}
                    </span>
                        {session.status === 'waiting' && !session.agent_id && (
                      <Button 
                        size="sm" 
                        variant="outline"
                            className="h-6 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAssignSession(session.id)
                        }}
                      >
                            接管
                      </Button>
                    )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          </ScrollArea>
        </div>

        {/* 右侧聊天区域 */}
        <div className="flex-1 flex flex-col">
          {selectedSessionId ? (
            <>
              {/* 聊天头部 */}
              <div className="bg-white border-b p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {sessions.find(s => s.id === selectedSessionId)?.customers?.name || '匿名客户'}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {sessions.find(s => s.id === selectedSessionId)?.customers?.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{sessions.find(s => s.id === selectedSessionId)?.customers?.email}</span>
                          </div>
                        )}
                        {sessions.find(s => s.id === selectedSessionId)?.customers?.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{sessions.find(s => s.id === selectedSessionId)?.customers?.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                <div className="flex items-center space-x-2">
                  {sessions.find(s => s.id === selectedSessionId)?.status === 'active' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCloseSession(selectedSessionId)}
                    >
                      结束会话
                    </Button>
                  )}
                  </div>
                </div>
              </div>

              {/* 消息区域 */}
            <div className="flex-1 relative">
              <ScrollArea 
                className="h-full"
                ref={messagesContainerRef}
                onScrollCapture={handleScroll}
              >
                <div className="p-4">
                  {isLoadingHistory && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">加载历史消息...</p>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.sender_type === 'agent'}
                    />
                  ))}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* 新消息提示 */}
              {newMessageCount > 0 && !isAtBottom && (
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
                  <Button
                    variant="default"
                    size="sm"
                    className="shadow-lg"
                    onClick={() => scrollToBottom(true)}
                  >
                    <ArrowDown className="w-4 h-4 mr-1" />
                    {newMessageCount} 条新消息
                  </Button>
                </div>
              )}
            </div>

            {/* 输入区域 */}
            <div className="bg-white border-t p-4">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="输入消息..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="resize-none"
                  />
                </div>
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!messageInput.trim()}
                  className="px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
          // 未选择会话时的状态
          <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">选择一个会话开始聊天</h3>
              <p className="text-gray-500">从左侧选择客户会话，开始提供客服支持</p>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}
