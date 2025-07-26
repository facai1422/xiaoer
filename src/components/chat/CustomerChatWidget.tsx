import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  session_id: string;
  sender_type: 'customer' | 'agent' | 'system';
  sender_id?: string;
  message_type: 'text' | 'image' | 'file' | 'system' | 'quick_reply';
  content: string;
  attachments?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  session_code: string;
  customer_id: string;
  agent_id?: string;
  status: 'waiting' | 'active' | 'closed' | 'transferred';
  priority: number;
  source?: string;
  subject?: string;
  started_at: string;
  assigned_at?: string;
  closed_at?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

interface CustomerInfo {
  id?: string;
  name: string;
  email: string;
  phone?: string;
}

interface CustomerChatWidgetProps {
  customerInfo: CustomerInfo;
  className?: string;
}

const CustomerChatWidget: React.FC<CustomerChatWidgetProps> = ({ 
  customerInfo, 
  className = '' 
}) => {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 状态管理
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'waiting' | 'active' | 'closed'>('connecting');
  const [unreadCount, setUnreadCount] = useState(0);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化客户和会话
  const initializeChat = async () => {
    try {
      setIsLoading(true);
      setConnectionStatus('connecting');

      // 创建或获取客户
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', customerInfo.email)
        .single();

      let customer;
      if (existingCustomer) {
        customer = existingCustomer;
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
          .single();

        if (error) throw error;
        customer = newCustomer;
      }

      setCustomerId(customer.id);

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
        .single();

      if (activeSession) {
        setSession(activeSession);
        setConnectionStatus(activeSession.status as 'waiting' | 'active' | 'closed');
        await loadMessages(activeSession.id);
      } else {
        // 创建新会话
        await createNewSession(customer.id);
      }

    } catch (error) {
      console.error('初始化聊天失败:', error);
      toast({
        variant: 'destructive',
        title: '连接失败',
        description: '连接客服失败，请稍后重试'
      });
      setConnectionStatus('closed');
    } finally {
      setIsLoading(false);
    }
  };

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
        .single();

      if (error) throw error;

      setSession(newSession);
      setConnectionStatus('waiting');

      // 发送欢迎消息
      await supabase
        .from('chat_messages')
        .insert({
          session_id: newSession.id,
          sender_type: 'system',
          message_type: 'system',
          content: '欢迎咨询！客服正在为您接入，请稍候...'
        });

      await loadMessages(newSession.id);
      toast({
        title: '连接成功',
        description: '已连接客服，请稍候...'
      });

    } catch (error) {
      console.error('创建会话失败:', error);
      toast({
        variant: 'destructive',
        title: '创建失败',
        description: '创建会话失败'
      });
    }
  };

  // 加载消息
  const loadMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('加载消息失败:', error);
    }
  };

  // 设置实时订阅
  useEffect(() => {
    if (!session) return;

    console.log('正在设置CustomerChatWidget实时订阅...');
    // 订阅新消息
    const messageChannel = supabase
      .channel(`customer-messages-${session.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `session_id=eq.${session.id}`
      }, (payload) => {
        const newMessage = payload.new as ChatMessage;
        console.log('CustomerChatWidget收到新消息:', newMessage);
        
        setMessages(prev => {
          // 检查消息是否已存在，避免重复
          if (prev.some(msg => msg.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
        setTimeout(scrollToBottom, 100);
        
        // 如果是客服消息，显示通知并增加未读数
        if (newMessage.sender_type === 'agent' && !isOpen) {
          setUnreadCount(prev => prev + 1);
          toast({
            title: '新消息',
            description: '客服回复了您的消息'
          });
        }
      })
      .subscribe((status) => {
        console.log('CustomerChatWidget消息订阅状态:', status);
      });

    // 订阅会话状态变更
    const sessionChannel = supabase
      .channel(`customer-session-${session.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_sessions',
        filter: `id=eq.${session.id}`
      }, (payload) => {
        const updatedSession = payload.new as ChatSession;
        console.log('CustomerChatWidget会话状态变更:', updatedSession);
        setSession(updatedSession);
        setConnectionStatus(updatedSession.status as 'waiting' | 'active' | 'closed');
        
        if (updatedSession.status === 'active') {
          toast({
            title: '客服已接入',
            description: '客服正在为您服务'
          });
        } else if (updatedSession.status === 'closed') {
          toast({
            title: '会话已结束',
            description: '感谢您的咨询'
          });
        }
      })
      .subscribe((status) => {
        console.log('CustomerChatWidget会话订阅状态:', status);
      });

    return () => {
      console.log('清理CustomerChatWidget实时订阅');
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(sessionChannel);
    };
  }, [session, isOpen, toast]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !session) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: session.id,
          sender_type: 'customer',
          message_type: 'text',
          content: messageInput.trim()
        });

      if (error) throw error;
      setMessageInput('');
    } catch (error) {
      console.error('发送消息失败:', error);
      toast({
        variant: 'destructive',
        title: '发送失败',
        description: '发送消息失败'
      });
    }
  };

  // 打开聊天
  const handleOpenChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
    if (!session) {
      initializeChat();
    }
  };

  // 关闭聊天
  const handleCloseChat = () => {
    setIsOpen(false);
    setUnreadCount(0);
  };

  // 最小化/最大化
  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMinimized) {
      setUnreadCount(0);
    }
  };

  // 获取状态显示文本
  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connecting':
        return '连接中...';
      case 'waiting':
        return '排队中...';
      case 'active':
        return '客服在线';
      case 'closed':
        return '会话已结束';
      default:
        return '离线';
    }
  };

  // 获取状态颜色
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'bg-yellow-500';
      case 'waiting':
        return 'bg-orange-500';
      case 'active':
        return 'bg-green-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  // 格式化时间
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* 聊天窗口 */}
      {isOpen && (
        <div className={`bg-white rounded-lg shadow-2xl border transition-all duration-300 ${
          isMinimized ? 'w-80 h-12' : 'w-80 h-96'
        } mb-4`}>
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 bg-blue-500 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
              <h3 className="font-medium">在线客服</h3>
              <Badge variant="secondary" className="text-xs">
                {getStatusText()}
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleMinimize}
                className="text-white hover:bg-blue-600 p-1"
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseChat}
                className="text-white hover:bg-blue-600 p-1"
              >
                <X size={16} />
              </Button>
            </div>
          </div>

          {/* 消息区域 */}
          {!isMinimized && (
            <>
              <ScrollArea className="h-64 p-4">
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-sm">连接中...</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_type === 'customer' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            message.sender_type === 'customer'
                              ? 'bg-blue-500 text-white'
                              : message.sender_type === 'system'
                              ? 'bg-gray-100 text-gray-600 text-center'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* 输入区域 */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="输入消息..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                    disabled={connectionStatus === 'closed' || isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || connectionStatus === 'closed' || isLoading}
                    size="sm"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 浮动按钮 */}
      <Button
        onClick={handleOpenChat}
        className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg relative"
      >
        <MessageCircle size={24} />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[20px] h-5 flex items-center justify-center text-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};

export default CustomerChatWidget; 