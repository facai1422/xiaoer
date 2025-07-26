import { supabase } from './supabase'

// 实时连接状态监控器
class RealtimeConnectionMonitor {
  private globalChannel: ReturnType<typeof supabase.channel> | null = null
  private connectionCheckInterval: NodeJS.Timeout | null = null
  private messageCount = 0
  private lastMessageTime = 0
  private startTime = Date.now()

  start() {
    console.log('🔍 启动实时连接监控器...')
    
    // 创建全局监听器
    this.globalChannel = supabase
      .channel('global-debug-monitor')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        this.messageCount++
        this.lastMessageTime = Date.now()
        
        const message = payload.new as Record<string, unknown>
        console.log(`📨 [${this.messageCount}] 监控器收到消息:`, {
          id: message.id,
          session_id: message.session_id,
          sender_type: message.sender_type,
          content: (message.content as string)?.substring(0, 50) + '...',
          created_at: message.created_at,
          delay: this.lastMessageTime - this.startTime
        })
        
        // 分析消息类型
        if (message.sender_type === 'customer') {
          console.log('👤 客户消息 - 管理后台应该收到此消息')
        } else if (message.sender_type === 'agent') {
          console.log('👨‍💼 客服消息 - 用户端应该收到此消息')
        } else {
          console.log('🤖 系统消息 - 可能是测试消息')
        }
      })
      .subscribe((status) => {
        console.log('🌐 全局监控器订阅状态:', status)
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ 全局监控器订阅成功，开始监控消息')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ 全局监控器订阅失败')
        }
      })

    // 定期检查连接状态
    this.connectionCheckInterval = setInterval(() => {
      const timeSinceLastMessage = Date.now() - this.lastMessageTime
      const uptime = Date.now() - this.startTime
      
      console.log('📊 连接状态报告:', {
        运行时间: `${Math.floor(uptime / 1000)}秒`,
        消息总数: this.messageCount,
        最后消息时间: this.lastMessageTime ? `${Math.floor(timeSinceLastMessage / 1000)}秒前` : '无',
        订阅状态: this.globalChannel?.state || '未知',
        频道主题: this.globalChannel?.topic || '未知'
      })
      
      // 如果超过60秒没有收到消息，发送测试消息
      if (timeSinceLastMessage > 60000 && this.messageCount > 0) {
        console.log('⚠️ 长时间无消息，发送测试消息...')
        this.sendTestMessage()
      }
    }, 30000) // 每30秒检查一次
  }

  stop() {
    console.log('🛑 停止实时连接监控器')
    
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval)
      this.connectionCheckInterval = null
    }
    
    if (this.globalChannel) {
      supabase.removeChannel(this.globalChannel)
      this.globalChannel = null
    }
    
    console.log(`📈 监控结果汇总:`, {
      运行时长: `${Math.floor((Date.now() - this.startTime) / 1000)}秒`,
      总消息数: this.messageCount,
      平均消息间隔: this.messageCount > 1 ? `${Math.floor((Date.now() - this.startTime) / this.messageCount / 1000)}秒` : '无'
    })
  }

  async sendTestMessage() {
    try {
      const testMessage = {
        session_id: `monitor-test-${Date.now()}`,
        sender_type: 'system',
        message_type: 'test',
        content: `监控器测试消息 - ${new Date().toLocaleString()}`
      }
      
      const { error } = await supabase
        .from('chat_messages')
        .insert(testMessage)
      
      if (error) {
        console.error('❌ 监控器测试消息发送失败:', error)
      } else {
        console.log('✅ 监控器测试消息发送成功')
      }
    } catch (error) {
      console.error('❌ 监控器测试消息异常:', error)
    }
  }

  getStats() {
    return {
      messageCount: this.messageCount,
      lastMessageTime: this.lastMessageTime,
      uptime: Date.now() - this.startTime,
      channelState: this.globalChannel?.state,
      isActive: this.connectionCheckInterval !== null
    }
  }
}

// 全局监控器实例
let globalMonitor: RealtimeConnectionMonitor | null = null

// 最简单的实时通信测试
export function createSimpleRealtimeTest() {
  console.log('🚀 启动简单实时通信测试...')
  
  // 创建一个全局监听器，接收所有chat_messages变更
  const globalChannel = supabase
    .channel('global-chat-monitor')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages'
    }, (payload) => {
      const message = payload.new as Record<string, unknown>
      console.log('🔥 全局监听器收到新消息:', {
        id: message.id,
        session_id: message.session_id,
        sender_type: message.sender_type,
        content: message.content,
        created_at: message.created_at
      })
      
      // 如果是客户消息，显示特殊标记
      if (message.sender_type === 'customer') {
        console.log('👤 这是客户消息，管理后台应该收到通知！')
      } else if (message.sender_type === 'agent') {
        console.log('👨‍💼 这是客服回复消息')
      }
    })
    .subscribe((status) => {
      console.log('🌐 全局监听器状态:', status)
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ 全局监听器已成功订阅')
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ 全局监听器订阅失败')
      }
    })

  // 返回清理函数
  return () => {
    console.log('🧹 清理全局监听器')
    supabase.removeChannel(globalChannel)
  }
}

// 发送测试消息
export async function sendTestMessage(isCustomer = true, sessionId?: string) {
  const testSessionId = sessionId || 'test-session-' + Date.now()
  const senderType = isCustomer ? 'customer' : 'agent'
  const content = `测试消息 - ${senderType} - ${new Date().toLocaleString()}`
  
  console.log(`📤 发送${senderType}测试消息到会话 ${testSessionId}...`)
  
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: testSessionId,
        sender_type: senderType,
        message_type: 'text',
        content
      })
      .select()
      .single()

    if (error) {
      console.error('❌ 发送测试消息失败:', error)
      return null
    } else {
      console.log('✅ 测试消息发送成功:', data)
      return data
    }
  } catch (err) {
    console.error('❌ 发送测试消息异常:', err)
    return null
  }
}

// 创建一个完整的测试套件
export function runCompleteRealtimeTest() {
  console.log('🎯 开始完整的实时通信测试...')
  
  // 启动全局监听
  const cleanup = createSimpleRealtimeTest()
  
  // 测试序列
  setTimeout(() => {
    console.log('📝 测试1: 发送客户消息...')
    sendTestMessage(true) // 客户消息
  }, 2000)
  
  setTimeout(() => {
    console.log('📝 测试2: 发送客服消息...')
    sendTestMessage(false) // 客服消息
  }, 4000)
  
  setTimeout(() => {
    console.log('📝 测试3: 连续发送多条客户消息...')
    const testSessionId = 'batch-test-' + Date.now()
    sendTestMessage(true, testSessionId)
    setTimeout(() => sendTestMessage(true, testSessionId), 500)
    setTimeout(() => sendTestMessage(true, testSessionId), 1000)
  }, 6000)
  
  // 10秒后清理
  setTimeout(() => {
    cleanup()
    console.log('✅ 完整实时通信测试结束')
  }, 12000)
}

// 启动监控器
export function startRealtimeMonitor() {
  if (globalMonitor) {
    console.log('⚠️ 监控器已在运行')
    return globalMonitor
  }
  
  globalMonitor = new RealtimeConnectionMonitor()
  globalMonitor.start()
  return globalMonitor
}

// 停止监控器
export function stopRealtimeMonitor() {
  if (globalMonitor) {
    globalMonitor.stop()
    globalMonitor = null
    console.log('✅ 监控器已停止')
  } else {
    console.log('⚠️ 监控器未运行')
  }
}

// 获取监控器状态
export function getMonitorStats() {
  return globalMonitor?.getStats() || null
}

// 检查Supabase连接状态
export async function checkSupabaseConnection() {
  console.log('🔍 检查Supabase连接状态...')
  
  try {
    // 测试数据库连接
    const { data, error } = await supabase
      .from('chat_messages')
      .select('count(*)')
      .limit(1)
    
    if (error) {
      console.error('❌ 数据库连接失败:', error)
      return false
    }
    
    console.log('✅ 数据库连接正常')
    
    // 测试实时连接
    const testChannel = supabase
      .channel('connection-test')
      .subscribe((status) => {
        console.log('📡 实时连接状态:', status)
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ 实时连接正常')
          supabase.removeChannel(testChannel)
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ 实时连接失败')
        }
      })
    
    return true
  } catch (error) {
    console.error('❌ 连接检查异常:', error)
    return false
  }
}

// 一键诊断工具
export async function runDiagnostics() {
  console.log('🔧 开始一键诊断...')
  
  // 1. 检查基础连接
  await checkSupabaseConnection()
  
  // 2. 启动监控器
  const monitor = startRealtimeMonitor()
  
  // 3. 发送测试消息
  setTimeout(() => {
    console.log('🧪 发送诊断测试消息...')
    sendTestMessage(true)
    sendTestMessage(false)
  }, 3000)
  
  // 4. 检查结果
  setTimeout(() => {
    const stats = monitor.getStats()
    console.log('📊 诊断结果:', stats)
    
    if (stats.messageCount > 0) {
      console.log('✅ 实时消息接收正常')
    } else {
      console.log('❌ 实时消息接收异常')
    }
    
    stopRealtimeMonitor()
  }, 8000)
} 