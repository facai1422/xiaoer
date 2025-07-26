import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Phone, Mail, Clock, User, HelpCircle, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { InstantAuthCheck } from '../components/auth/InstantAuthCheck';
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
  attachments?: any;
  metadata?: any;
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

const CustomerService = () => {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 聊天状态管理
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'waiting' | 'active' | 'closed'>('connecting');

  // 模拟用户信息 - 实际应用中应该从认证系统获取
  const customerInfo = {
    name: '用户' + Math.floor(Math.random() * 1000),
    email: `user${Math.floor(Math.random() * 1000)}@example.com`,
    phone: '13800138000'
  };

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

    // 订阅新消息
    const messageChannel = supabase
      .channel(`messages-${session.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `session_id=eq.${session.id}`
      }, (payload) => {
        const newMessage = payload.new as ChatMessage;
        setMessages(prev => [...prev, newMessage]);
        setTimeout(scrollToBottom, 100);
        
        // 如果是客服消息，显示通知
        if (newMessage.sender_type === 'agent') {
          toast({
            title: '新消息',
            description: '客服回复了您的消息'
          });
        }
      })
      .subscribe();

    // 订阅会话状态变更
    const sessionChannel = supabase
      .channel(`session-${session.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_sessions',
        filter: `id=eq.${session.id}`
      }, (payload) => {
        const updatedSession = payload.new as ChatSession;
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
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(sessionChannel);
    };
  }, [session, toast]);

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

  // 开始聊天
  const handleStartChat = () => {
    setIsChatOpen(true);
    setIsMinimized(false);
    if (!session) {
      initializeChat();
    }
  };

  // 关闭聊天
  const handleCloseChat = () => {
    setIsChatOpen(false);
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

  const contactMethods = [
    {
      icon: MessageCircle,
      title: '在线客服',
      description: '7×24小时在线服务',
      action: '立即咨询',
      color: 'bg-blue-500',
      onClick: handleStartChat
    },
    {
      icon: Phone,
      title: '客服热线',
      description: '400-888-8888',
      action: '拨打电话',
      color: 'bg-green-500',
      onClick: () => window.open('tel:400-888-8888')
    },
    {
      icon: Mail,
      title: '邮件支持',
      description: 'support@lifepay.com',
      action: '发送邮件',
      color: 'bg-purple-500',
      onClick: () => window.open('mailto:support@lifepay.com')
    },
  ];

  const faqItems = [
    {
      question: '如何进行充值？',
      answer: '点击钱包页面的充值按钮，选择充值金额和支付方式即可完成充值。',
    },
    {
      question: '订单支付失败怎么办？',
      answer: '请检查账户余额是否充足，或联系客服协助处理。',
    },
    {
      question: '如何查看交易记录？',
      answer: '在钱包页面可以查看所有的交易记录和账单详情。',
    },
    {
      question: '忘记密码怎么办？',
      answer: '点击登录页面的"忘记密码"，通过手机验证码重置密码。',
    },
  ];

  return (
    <InstantAuthCheck>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* 头部 */}
        <div className="bg-white shadow-sm">
          <div className="px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900 text-center">客服中心</h1>
            <p className="text-gray-600 text-center mt-2">我们随时为您提供帮助</p>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* 联系方式 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-500" />
              联系我们
            </h2>
            <div className="grid gap-4">
              {contactMethods.map((method, index) => (
                <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center mr-4`}>
                    <method.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{method.title}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                  <button 
                    onClick={method.onClick}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                  >
                    {method.action}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 服务时间 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-green-500" />
              服务时间
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">在线客服</span>
                <span className="font-medium text-gray-900">7×24小时</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">电话客服</span>
                <span className="font-medium text-gray-900">9:00 - 21:00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">邮件回复</span>
                <span className="font-medium text-gray-900">24小时内</span>
              </div>
            </div>
          </div>

          {/* 常见问题 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-orange-500" />
              常见问题
            </h2>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <details key={index} className="border border-gray-200 rounded-lg">
                  <summary className="p-4 cursor-pointer hover:bg-gray-50 font-medium text-gray-900">
                    {item.question}
                  </summary>
                  <div className="px-4 pb-4 text-gray-600 text-sm">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* 反馈建议 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">意见反馈</h2>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={4}
              placeholder="请输入您的意见或建议..."
            />
            <button className="mt-3 w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors">
              提交反馈
            </button>
          </div>
        </div>

        {/* 聊天窗口 */}
        {isChatOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md h-96 flex flex-col">
              {/* 聊天头部 */}
              <div className="flex items-center justify-between p-4 bg-blue-500 text-white rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
                  <h3 className="font-medium">在线客服</h3>
                  <Badge variant="secondary" className="text-xs">
                    {getStatusText()}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseChat}
                  className="text-white hover:bg-blue-600 p-1"
                >
                  <X size={16} />
                </Button>
              </div>

              {/* 消息区域 */}
              <ScrollArea className="flex-1 p-4">
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
            </div>
          </div>
        )}
      </div>
    </InstantAuthCheck>
  );
};

export default CustomerService;
