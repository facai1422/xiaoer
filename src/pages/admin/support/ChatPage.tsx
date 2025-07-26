import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getAdminSession } from "@/utils/adminAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  RefreshCw, 
  Send,
  MessageCircle,
  User,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// 消息类型定义 - 基于现有的customer_service_messages表
interface CustomerServiceMessage {
  id: string;
  user_id: string | null;
  content: string;
  sent_by_user: boolean;
  is_read: boolean;
  telegram_message_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// 用户会话简化类型
interface UserSession {
  user_id: string;
  last_message: string;
  unread_count: number;
  last_message_at: string;
}

const ChatPage = () => {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<CustomerServiceMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);

  // 当前客服信息
  const [currentAgent, setCurrentAgent] = useState<{ id: string; name: string } | null>(null);

  // 统计数据
  const [stats, setStats] = useState({
    total_messages: 0,
    unread_count: 0,
    active_users: 0
  });

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化客服信息
  useEffect(() => {
    const initAgent = async () => {
      try {
        const adminSession = getAdminSession();
        if (!adminSession || !adminSession.admin?.email) {
          console.warn('管理员会话无效或缺少邮箱信息');
          return;
        }

        const adminEmail = adminSession.admin.email;
        setCurrentAgent({ 
          id: adminSession.admin.id || 'admin', 
          name: adminEmail.split('@')[0] || '管理员'
        });
        
      } catch (error) {
        console.error('初始化客服信息失败:', error);
        toast({
          variant: "destructive",
          title: "初始化失败",
          description: "客服信息初始化失败，请刷新页面重试"
        });
      }
    };

    initAgent();
  }, [toast]);

  // 获取用户会话列表
  const fetchUserSessions = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('customer_service_messages')
        .select('user_id, content, created_at, is_read, sent_by_user')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取消息列表失败:', error);
        toast({
          variant: "destructive",
          title: "错误",
          description: `获取消息列表失败: ${error.message}`
        });
        return;
      }

      // 按用户分组统计
      const userMap = new Map<string, UserSession>();
      
      data?.forEach(msg => {
        if (!msg.user_id) return;
        
        if (!userMap.has(msg.user_id)) {
          userMap.set(msg.user_id, {
            user_id: msg.user_id,
            last_message: msg.content,
            unread_count: (!msg.is_read && msg.sent_by_user) ? 1 : 0,
            last_message_at: msg.created_at || ''
          });
        } else {
          const existing = userMap.get(msg.user_id)!;
          if (!msg.is_read && msg.sent_by_user) {
            existing.unread_count++;
          }
        }
      });

      const sessions = Array.from(userMap.values()).sort((a, b) => 
        new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );

      setUserSessions(sessions);
      
      // 更新统计数据
      const totalUnread = sessions.reduce((sum, s) => sum + s.unread_count, 0);
      
      setStats({
        total_messages: data?.length || 0,
        unread_count: totalUnread,
        active_users: sessions.length
      });

    } catch (error) {
      console.error('获取会话列表异常:', error);
      toast({
        variant: "destructive",
        title: "系统错误",
        description: "获取会话列表时发生异常，请刷新页面重试"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 获取特定用户的消息
  const fetchUserMessages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('customer_service_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('获取用户消息失败:', error);
        toast({
          variant: "destructive",
          title: "错误",
          description: `获取消息失败: ${error.message}`
        });
        return;
      }
      
      setMessages(data || []);
      setTimeout(scrollToBottom, 100);

      // 标记用户消息为已读
      if (data && data.length > 0) {
        const unreadMessages = data.filter(msg => msg.sent_by_user && !msg.is_read);
        if (unreadMessages.length > 0) {
          await supabase
            .from('customer_service_messages')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('sent_by_user', true)
            .eq('is_read', false);
        }
      }
      
    } catch (error) {
      console.error('获取消息异常:', error);
      toast({
        variant: "destructive",
        title: "系统错误",
        description: "获取消息时发生异常"
      });
    }
  };

  // 设置实时订阅
  useEffect(() => {
    const messageChannel = supabase
      .channel('admin-customer-service-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'customer_service_messages'
      }, (payload) => {
        const newMessage = payload.new as CustomerServiceMessage;
        console.log('新消息:', newMessage);
        
        // 如果是当前选中用户的消息，添加到消息列表
        if (selectedUserId && newMessage.user_id === selectedUserId) {
          setMessages(prev => {
            // 检查消息是否已存在，避免重复
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
          setTimeout(scrollToBottom, 100);
        }
        
        // 如果是客户消息，显示通知
        if (newMessage.sent_by_user) {
          toast({
            title: "新消息",
            description: "收到客户新消息",
            duration: 3000
          });
        }
        
        // 刷新用户会话列表
        fetchUserSessions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [selectedUserId, toast]);

  // 初始加载
  useEffect(() => {
    fetchUserSessions();
  }, []);

  // 选择用户
  useEffect(() => {
    if (selectedUserId) {
      fetchUserMessages(selectedUserId);
    }
  }, [selectedUserId]);

  // 发送消息
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId || !currentAgent) return;

    const messageContent = newMessage.trim();
    const tempId = 'temp_admin_' + Date.now();

    try {
      // 先在本地显示消息，提供即时反馈
      const optimisticMessage: CustomerServiceMessage = {
        id: tempId,
        user_id: selectedUserId,
        content: messageContent,
        sent_by_user: false,
        is_read: true,
        telegram_message_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');
      setTimeout(scrollToBottom, 100);

      // 存储到数据库
      const { data, error } = await supabase
        .from('customer_service_messages')
        .insert({
          user_id: selectedUserId,
          content: messageContent,
          sent_by_user: false,
          is_read: true
        })
        .select()
        .single();

      if (error) throw error;

      // 用真实数据替换临时消息
      if (data) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? data : msg
        ));
      }

      toast({
        title: "发送成功",
        description: "消息已发送给客户"
      });

    } catch (error) {
      console.error('发送消息失败:', error);
      // 移除失败的临时消息
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      toast({
        variant: "destructive",
        title: "发送失败",
        description: "发送消息失败"
      });
    }
  };

  // 过滤用户会话
  const filteredSessions = userSessions.filter(session => {
    if (!searchTerm) return true;
    return session.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
           session.last_message.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧用户列表 */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* 头部统计 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">客服中心</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUserSessions}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="font-semibold text-blue-600">{stats.unread_count}</div>
              <div className="text-gray-600">未读</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-semibold text-green-600">{stats.active_users}</div>
              <div className="text-gray-600">用户</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-semibold text-gray-600">{stats.total_messages}</div>
              <div className="text-gray-600">消息</div>
            </div>
          </div>
        </div>

        {/* 搜索 */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 用户列表 */}
        <ScrollArea className="flex-1">
          <div className="divide-y divide-gray-100">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2">加载中...</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>暂无消息</p>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <div
                  key={session.user_id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedUserId === session.user_id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedUserId(session.user_id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          用户 {session.user_id.slice(-8)}
                        </h3>
                        {session.unread_count > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {session.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-gray-500">
                        {new Date(session.last_message_at).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate">
                    {session.last_message}
                    </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 右侧聊天区域 */}
      <div className="flex-1 flex flex-col">
        {selectedUserId ? (
          <>
            {/* 聊天头部 */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      用户 {selectedUserId.slice(-8)}
                    </h2>
                    <p className="text-sm text-gray-600">
                      用户ID: {selectedUserId}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="default">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    在线咨询
                  </Badge>
                </div>
              </div>
            </div>

            {/* 消息区域 */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      !message.sent_by_user ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        !message.sent_by_user
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.created_at ? new Date(message.created_at).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : ''}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* 输入区域 */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="输入回复..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">选择一个用户开始聊天</h3>
              <p className="text-gray-600">从左侧列表中选择一个用户来查看消息</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage; 