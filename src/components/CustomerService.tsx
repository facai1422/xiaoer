import { MessageSquare, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  sent_by_user: boolean;
  timestamp: Date;
  user_id?: string;
}

export const CustomerService = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 初始化用户ID并加载消息
    initializeUser();
  }, []);

  // 当用户ID设置后，设置实时订阅
  useEffect(() => {
    if (currentUserId) {
      const cleanup = setupRealtimeSubscription();
      return cleanup;
    }
  }, [currentUserId]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [messages]);

  const initializeUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
        await loadMessages(session.user.id);
      } else {
        // 如果没有登录，创建一个固定的临时UUID
        // 使用本地存储保持同一浏览器的用户ID一致
        let tempUserId = localStorage.getItem('temp_user_id');
        if (!tempUserId) {
          // 生成一个固定的UUID格式的临时ID
          tempUserId = '00000000-0000-4000-8000-' + Math.random().toString(16).substr(2, 12);
          localStorage.setItem('temp_user_id', tempUserId);
        }
        setCurrentUserId(tempUserId);
        await loadMessages(tempUserId);
      }
    } catch (error) {
      console.error('初始化用户失败:', error);
      // 创建临时用户ID作为后备
      let tempUserId = localStorage.getItem('temp_user_id');
      if (!tempUserId) {
        tempUserId = '00000000-0000-4000-8000-' + Math.random().toString(16).substr(2, 12);
        localStorage.setItem('temp_user_id', tempUserId);
      }
      setCurrentUserId(tempUserId);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('customer_service_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        sent_by_user: msg.sent_by_user,
        timestamp: new Date(msg.created_at || ''),
        user_id: msg.user_id || undefined
      }));

      setMessages(formattedMessages);

      // 如果没有消息，发送欢迎消息
      if (formattedMessages.length === 0) {
        await sendWelcomeMessage(userId);
      }
    } catch (error) {
      console.error('加载消息失败:', error);
      // 发送欢迎消息作为后备
      if (currentUserId) {
        await sendWelcomeMessage(currentUserId);
      }
    }
  };

  const sendWelcomeMessage = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('customer_service_messages')
        .insert({
          user_id: userId,
          content: "欢迎使用在线客服，请问有什么可以帮助您的吗？",
          sent_by_user: false,
          is_read: true
        });

      if (error) throw error;
    } catch (error) {
      console.error('发送欢迎消息失败:', error);
      // 在本地显示欢迎消息作为后备
      const welcomeMessage: Message = {
        id: "welcome",
        content: "欢迎使用在线客服，请问有什么可以帮助您的吗？",
        sent_by_user: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  const setupRealtimeSubscription = () => {
    // 订阅客服消息表的变更
    const channel = supabase
      .channel('customer-service-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'customer_service_messages'
      }, (payload) => {
        const newMsg = payload.new as {
          id: string;
          user_id: string;
          content: string;
          sent_by_user: boolean;
          created_at: string;
        };
        
        // 只处理当前用户的消息
        if (newMsg.user_id === currentUserId) {
          const formattedMessage: Message = {
            id: newMsg.id,
            content: newMsg.content,
            sent_by_user: newMsg.sent_by_user,
            timestamp: new Date(newMsg.created_at || ''),
            user_id: newMsg.user_id
          };

          setMessages(prev => {
            // 检查消息是否已存在，避免重复
            if (prev.some(msg => msg.id === formattedMessage.id || msg.id.startsWith('temp_'))) {
              // 如果是临时消息，用真实消息替换
              return prev.map(msg => 
                msg.id.startsWith('temp_') && msg.content === formattedMessage.content && msg.sent_by_user === formattedMessage.sent_by_user
                  ? formattedMessage 
                  : msg
              );
            }
            return [...prev, formattedMessage];
          });

          // 如果是客服回复，显示通知
          if (!newMsg.sent_by_user) {
            toast.success("客服回复了您的消息");
          }
        }
      })
      .subscribe();

    // 组件卸载时清理订阅
    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return;

    const messageContent = newMessage.trim();
    const tempId = 'temp_' + Date.now();

    try {
      setIsLoading(true);

      // 先在本地显示消息，提供即时反馈
      const optimisticMessage: Message = {
        id: tempId,
        content: messageContent,
        sent_by_user: true,
        timestamp: new Date(),
        user_id: currentUserId
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage("");

      // 存储到数据库
      const { data, error } = await supabase
        .from('customer_service_messages')
        .insert({
          user_id: currentUserId,
          content: messageContent,
          sent_by_user: true,
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;

      // 用真实数据替换临时消息
      if (data) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? {
                id: data.id,
                content: data.content,
                sent_by_user: data.sent_by_user,
                timestamp: new Date(data.created_at || ''),
                user_id: data.user_id || undefined
              }
            : msg
        ));
      }

      toast.success("消息发送成功");

    } catch (error) {
      console.error('发送消息失败:', error);
      // 移除失败的临时消息
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      toast.error("发送消息失败");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-[500px] max-h-[80vh] bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <MessageSquare className="w-5 h-5 text-blue-500 mr-2" />
        <h2 className="font-medium">在线客服</h2>
        {currentUserId && (
          <span className="ml-auto text-xs text-gray-500">
            ID: {currentUserId.slice(-8)}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
            <p>正在连接客服...</p>
            <p className="text-sm">请稍等片刻</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.sent_by_user ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start max-w-[80%] ${message.sent_by_user ? 'flex-row-reverse' : 'flex-row'}`}>
                <Avatar className={`w-8 h-8 ${message.sent_by_user ? 'ml-2' : 'mr-2'}`}>
                  {message.sent_by_user ? (
                    <AvatarImage src="/lovable-uploads/fed27bfa-2d72-4a2e-a004-8b21c76ad241.png" />
                  ) : (
                    <AvatarImage src="/lovable-uploads/15201ab3-e961-4298-8525-ebd51fcbefc5.png" />
                  )}
                  <AvatarFallback>{message.sent_by_user ? '用户' : '客服'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className={`px-3 py-2 rounded-lg ${
                    message.sent_by_user 
                      ? 'bg-blue-500 text-white rounded-tr-none' 
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                    {message.content}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${message.sent_by_user ? 'text-right' : 'text-left'}`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t flex items-center">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="输入消息..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          disabled={isLoading || !currentUserId}
        />
        <Button 
          onClick={handleSendMessage} 
          className="ml-2 bg-blue-500 hover:bg-blue-600"
          size="icon"
          disabled={isLoading || !newMessage.trim() || !currentUserId}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
