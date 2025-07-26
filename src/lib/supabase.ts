// This file is being deprecated. Please use the file in src/integrations/supabase/client.ts instead.
import { createClient } from '@supabase/supabase-js'

// 使用新的数据库连接信息
const supabaseUrl = "https://wjvuuckoasdukmnbrzxk.supabase.co"
const supabaseAnonKey = "sb_publishable_hjn8uDvuadUNMrM1jg5HHQ_37sGt-pr"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// 客服系统专用的实时订阅管理
export class CustomerServiceRealtime {
  private channels: Array<ReturnType<typeof supabase.channel>> = []
  private isAgent: boolean = false
  private connectionState: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected'
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectTimeout: NodeJS.Timeout | null = null
  private messageQueue: Array<{ callback: (payload: Record<string, unknown>) => void, payload: Record<string, unknown> }> = []
  private heartbeatInterval: NodeJS.Timeout | null = null
  private lastMessageTime: number = 0

  constructor(isAgent: boolean = false) {
    this.isAgent = isAgent
    this.connectionState = 'connecting'
    console.log(`[CustomerServiceRealtime] 初始化${isAgent ? '客服端' : '用户端'}实时连接`)
    
    // 启动心跳检测
    this.startHeartbeat()
  }

  // 启动心跳检测
  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastMessage = now - this.lastMessageTime
      
      // 如果超过30秒没有收到任何消息，检查连接状态
      if (timeSinceLastMessage > 30000 && this.connectionState === 'connected') {
        console.log('[CustomerServiceRealtime] 心跳检测：可能存在连接问题，尝试重连')
        this.handleReconnect()
      }
    }, 15000) // 每15秒检查一次
  }

  // 订阅消息 - 使用独特的频道名称避免冲突
  subscribeToMessages(callback: (payload: Record<string, unknown>) => void, sessionId?: string) {
    // 使用时间戳确保频道名称的唯一性
    const timestamp = Date.now()
    const channelName = this.isAgent 
      ? `agent-messages-${timestamp}` // 管理后台使用唯一频道名
      : sessionId 
        ? `customer-${sessionId}-${timestamp}` // 用户端使用会话特定频道
        : `customer-global-${timestamp}`
    
    console.log(`[CustomerServiceRealtime] 创建消息订阅频道: ${channelName}`)
    
    const channel = supabase
      .channel(channelName, {
        config: {
          presence: {
            key: this.isAgent ? 'agent' : 'customer'
          }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          try {
            console.log(`[${channelName}] 收到新消息:`, payload)
            this.lastMessageTime = Date.now()
            
            // 检查连接状态
            if (this.connectionState !== 'connected') {
              console.log(`[${channelName}] 连接状态异常 (${this.connectionState})，消息加入队列`)
              this.messageQueue.push({ callback, payload })
              return
            }

            // 消息去重处理
            const message = payload.new as Record<string, unknown>
            if (this.isDuplicateMessage(message)) {
              console.log(`[${channelName}] 忽略重复消息:`, message.id)
              return
            }

            // 智能消息过滤
            if (this.shouldProcessMessage(message, sessionId)) {
              console.log(`[${channelName}] 处理消息:`, message)
              callback(payload)
            } else {
              console.log(`[${channelName}] 跳过消息 (不符合过滤条件):`, message)
            }
          } catch (error) {
            console.error(`[${channelName}] 处理消息时出错:`, error)
            this.handleError(error)
          }
        }
      )
      .subscribe((status) => {
        console.log(`[${channelName}] 订阅状态变更:`, status)
        this.updateConnectionState(status)
        
        if (status === 'SUBSCRIBED') {
          console.log(`[${channelName}] 消息订阅成功`)
          this.processMessageQueue()
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`[${channelName}] 订阅失败`)
          this.handleReconnect()
        } else if (status === 'CLOSED') {
          console.warn(`[${channelName}] 订阅已关闭`)
        }
      })

    this.channels.push(channel)
    return channel
  }

  // 智能消息过滤逻辑
  private shouldProcessMessage(message: Record<string, unknown>, sessionId?: string): boolean {
    const senderType = message.sender_type as string
    const messageSessionId = message.session_id as string
    
    if (this.isAgent) {
      // 管理后台：只处理客户消息
      if (senderType === 'customer') {
        return true
      }
    } else {
      // 用户端：处理所有消息（客服回复和自己的消息确认）
      if (sessionId) {
        // 如果指定了会话ID，只处理该会话的消息
        return messageSessionId === sessionId
      } else {
        // 如果没有指定会话ID，处理所有消息
        return true
      }
    }
    
    return false
  }

  // 订阅会话状态变更 - 改进版本
  subscribeToSessions(callback: (payload: Record<string, unknown>) => void, customerId?: string) {
    const timestamp = Date.now()
    const channelName = this.isAgent 
      ? `agent-sessions-${timestamp}`
      : customerId 
        ? `customer-${customerId}-sessions-${timestamp}`
        : `customer-sessions-${timestamp}`
    
    console.log(`[CustomerServiceRealtime] 创建会话订阅频道: ${channelName}`)
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // 监听所有变更
          schema: 'public',
          table: 'chat_sessions',
          ...(customerId && !this.isAgent 
            ? { filter: `customer_id=eq.${customerId}` }
            : {}
          )
        },
        (payload) => {
          try {
            console.log(`[${channelName}] 会话状态变更:`, payload)
            this.lastMessageTime = Date.now()
            
            if (this.connectionState !== 'connected') {
              this.messageQueue.push({ callback, payload })
              return
            }

            callback(payload)
          } catch (error) {
            console.error(`[${channelName}] 处理会话变更时出错:`, error)
            this.handleError(error)
          }
        }
      )
      .subscribe((status) => {
        console.log(`[${channelName}] 会话订阅状态:`, status)
        this.updateConnectionState(status)
      })

    this.channels.push(channel)
    return channel
  }

  // 订阅客服状态变更 - 增强版本
  subscribeToAgentStatus(callback: (payload: Record<string, unknown>) => void) {
    if (!this.isAgent) {
      console.warn('[CustomerServiceRealtime] 非客服端无法订阅客服状态')
      return null
    }

    const timestamp = Date.now()
    const channelName = `agent-status-${timestamp}`
    console.log(`[CustomerServiceRealtime] 创建客服状态订阅频道: ${channelName}`)
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'customer_service_agents'
        },
        (payload) => {
          try {
            console.log(`[${channelName}] 客服状态变更:`, payload)
            this.lastMessageTime = Date.now()
            
            if (this.connectionState !== 'connected') {
              this.messageQueue.push({ callback, payload })
              return
            }

            callback(payload)
          } catch (error) {
            console.error(`[${channelName}] 处理客服状态变更时出错:`, error)
            this.handleError(error)
          }
        }
      )
      .subscribe((status) => {
        console.log(`[${channelName}] 客服状态订阅状态:`, status)
        this.updateConnectionState(status)
      })

    this.channels.push(channel)
    return channel
  }

  // 更新连接状态
  private updateConnectionState(status: string) {
    const previousState = this.connectionState
    
    switch (status) {
      case 'SUBSCRIBED':
        this.connectionState = 'connected'
        this.reconnectAttempts = 0
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout)
          this.reconnectTimeout = null
        }
        break
      case 'CHANNEL_ERROR':
      case 'TIMED_OUT':
        this.connectionState = 'error'
        break
      case 'CLOSED':
        this.connectionState = 'disconnected'
        break
      default:
        this.connectionState = 'connecting'
    }
    
    if (previousState !== this.connectionState) {
      console.log(`[CustomerServiceRealtime] 连接状态变更: ${previousState} -> ${this.connectionState}`)
    }
  }

  // 处理错误
  private handleError(error: unknown) {
    console.error('[CustomerServiceRealtime] 错误:', error)
    this.connectionState = 'error'
  }

  // 重连机制
  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[CustomerServiceRealtime] 达到最大重连次数，停止重连')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000) // 指数退避

    console.log(`[CustomerServiceRealtime] 第${this.reconnectAttempts}次重连，${delay}ms后执行`)
    
    this.reconnectTimeout = setTimeout(() => {
      console.log('[CustomerServiceRealtime] 执行重连...')
      this.cleanup()
      // 重连逻辑由调用方处理
    }, delay)
  }

  // 消息去重
  private messageProcessedIds = new Set<string>()
  private isDuplicateMessage(message: Record<string, unknown>): boolean {
    const messageId = message.id as string
    if (!messageId) return false
    
    if (this.messageProcessedIds.has(messageId)) {
      return true
    }
    
    this.messageProcessedIds.add(messageId)
    
    // 清理旧的ID，避免内存泄漏（保留最近1000条记录）
    if (this.messageProcessedIds.size > 1000) {
      const oldIds = Array.from(this.messageProcessedIds).slice(0, 500)
      oldIds.forEach(id => this.messageProcessedIds.delete(id))
    }
    
    return false
  }

  // 处理排队的消息
  private processMessageQueue() {
    if (this.messageQueue.length === 0) return
    
    console.log(`[CustomerServiceRealtime] 处理${this.messageQueue.length}条排队消息`)
    
    const queue = [...this.messageQueue]
    this.messageQueue = []
    
    queue.forEach(({ callback, payload }) => {
      try {
        callback(payload)
      } catch (error) {
        console.error('[CustomerServiceRealtime] 处理排队消息时出错:', error)
      }
    })
  }

  // 获取详细的连接状态
  getConnectionStatus() {
    return {
      isAgent: this.isAgent,
      connectionState: this.connectionState,
      channelCount: this.channels.length,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      lastMessageTime: this.lastMessageTime,
      timeSinceLastMessage: Date.now() - this.lastMessageTime,
      channels: this.channels.map(ch => ({
        topic: ch.topic,
        state: ch.state
      }))
    }
  }

  // 检查连接健康状态
  isHealthy(): boolean {
    const isConnected = this.connectionState === 'connected'
    const hasChannels = this.channels.length > 0
    const recentActivity = (Date.now() - this.lastMessageTime) < 60000 // 1分钟内有活动
    
    return isConnected && hasChannels
  }

  // 强制重连
  forceReconnect() {
    console.log('[CustomerServiceRealtime] 强制重连')
    this.cleanup()
    this.connectionState = 'connecting'
    this.reconnectAttempts = 0
    this.lastMessageTime = Date.now()
  }

  // 发送测试消息来检测连接
  async testConnection(): Promise<boolean> {
    try {
      console.log('[CustomerServiceRealtime] 发送测试消息检测连接')
      
      const testMessage = {
        session_id: `test-${Date.now()}`,
        sender_type: this.isAgent ? 'agent' : 'customer',
        message_type: 'system',
        content: '连接测试消息'
      }
      
      const { error } = await supabase
        .from('chat_messages')
        .insert(testMessage)
      
      if (error) {
        console.error('[CustomerServiceRealtime] 测试消息发送失败:', error)
        return false
      }
      
      console.log('[CustomerServiceRealtime] 测试消息发送成功')
      return true
    } catch (error) {
      console.error('[CustomerServiceRealtime] 连接测试异常:', error)
      return false
    }
  }

  // 清理所有订阅 - 改进版本
  cleanup() {
    console.log(`[CustomerServiceRealtime] 清理${this.channels.length}个订阅频道`)
    
    // 清理心跳检测
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    
    // 清理重连定时器
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    
    // 清理所有频道
    this.channels.forEach((channel, index) => {
      try {
        supabase.removeChannel(channel)
        console.log(`[CustomerServiceRealtime] 已清理频道 ${index + 1}/${this.channels.length}`)
      } catch (error) {
        console.error(`[CustomerServiceRealtime] 清理频道时出错:`, error)
      }
    })
    
    this.channels = []
    this.messageQueue = []
    this.messageProcessedIds.clear()
    this.connectionState = 'disconnected'
    this.reconnectAttempts = 0
    this.lastMessageTime = 0
    
    console.log('[CustomerServiceRealtime] 所有订阅频道已清理')
  }
}

// 客服系统API函数
export const customerServiceAPI = {
  // 获取客服信息
  async getCurrentAgent() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('customer_service_agents')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) throw error
    return data
  },

  // 获取会话列表
  async getSessions(agentId?: string) {
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

    if (agentId) {
      query = query.or(`agent_id.eq.${agentId},agent_id.is.null`)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // 获取会话消息
  async getMessages(sessionId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  // 发送消息
  async sendMessage(sessionId: string, content: string, agentId?: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        sender_type: 'agent',
        sender_id: agentId,
        message_type: 'text',
        content
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 接管会话
  async assignSession(sessionId: string, agentId: string) {
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
  },

  // 结束会话
  async closeSession(sessionId: string) {
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
  },

  // 更新客服状态
  async updateAgentStatus(agentId: string, status: 'online' | 'busy' | 'away' | 'offline') {
    const { data, error } = await supabase
      .from('customer_service_agents')
      .update({
        status,
        last_active_at: new Date().toISOString()
      })
      .eq('id', agentId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 创建测试会话和消息
  async createTestData() {
    try {
      // 创建测试客户
      const { data: customer } = await supabase
        .from('customers')
        .insert({
          name: '测试客户' + Date.now(),
          email: `test${Date.now()}@example.com`,
          phone: '13800138000',
          source: 'website'
        })
        .select()
        .single()

      if (!customer) throw new Error('创建客户失败')

      // 创建测试会话
      const { data: session } = await supabase
        .from('chat_sessions')
        .insert({
          customer_id: customer.id,
          status: 'waiting',
          source: 'website',
          subject: '咨询产品信息'
        })
        .select()
        .single()

      if (!session) throw new Error('创建会话失败')

      // 创建测试消息
      await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: session.id,
            sender_type: 'customer',
            content: '你好，我想了解一下你们的产品',
            message_type: 'text'
          },
          {
            session_id: session.id,
            sender_type: 'customer',
            content: '请问有什么优惠活动吗？',
            message_type: 'text'
          }
        ])

      return { customer, session }
    } catch (error) {
      console.error('创建测试数据失败:', error)
      throw error
    }
  }
}
