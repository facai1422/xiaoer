import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthContext } from "@/contexts/AuthContext";

interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  username?: string;
  balance: number;
  online_status?: boolean;
  status?: string; // 添加状态字段
}

export const SimpleAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false); // 始终为false，不显示加载状态
  const isMounted = useRef(true);

  useEffect(() => {
    // 不在初始化时检查认证状态，避免加载延迟
    // 只有在用户主动登录时才设置用户状态

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted.current) return;
        
        if (event === 'SIGNED_IN' && session) {
          // 检查用户状态
          const userStatus = await checkUserStatus(session.user.id);
          if (userStatus.canLogin) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              username: session.user.email?.split('@')[0],
              balance: 0,
              online_status: true,
              status: userStatus.status
            });
          } else {
            // 用户被冻结，强制登出
            await supabase.auth.signOut();
            setUser(null);
            toast.error(`账户已被${userStatus.status === 'frozen' ? '冻结' : '暂停'}，请联系客服`);
          }
        } else if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
        }
      }
    );

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  // 定期检查已登录用户的状态
  useEffect(() => {
    if (!user) return;

    const checkInterval = setInterval(async () => {
      if (!isMounted.current || !user) return;

      try {
        console.log('🔍 定期检查用户状态:', user.id);
        const userStatus = await checkUserStatus(user.id);
        
        if (!userStatus.canLogin) {
          console.log('❌ 用户状态异常，强制登出:', userStatus.status);
          // 用户被冻结或暂停，强制登出
          await supabase.auth.signOut();
          setUser(null);
          const statusText = userStatus.status === 'frozen' ? '冻结' : '暂停';
          toast.error(`您的账户已被${statusText}，已自动登出。请联系客服处理。`);
        }
      } catch (error) {
        console.error('定期检查用户状态失败:', error);
      }
    }, 120000); // 每2分钟检查一次，减少频率

    return () => {
      clearInterval(checkInterval);
    };
  }, [user]);

  // 检查用户状态的函数
  const checkUserStatus = async (userId: string): Promise<{ canLogin: boolean; status: string }> => {
    try {
      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('status')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('检查用户状态失败:', error);
        // 如果查询失败，默认允许登录（避免因数据库问题导致无法登录）
        return { canLogin: true, status: 'active' };
      }

      const status = userProfile?.status || 'active';
      const canLogin = status === 'active';
      
      console.log('🔍 用户状态检查:', { userId, status, canLogin });
      
      return { canLogin, status };
    } catch (error) {
      console.error('检查用户状态异常:', error);
      return { canLogin: true, status: 'active' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // 先进行身份验证
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // 验证成功后，检查用户状态
      if (data.user) {
        const userStatus = await checkUserStatus(data.user.id);
        
        if (!userStatus.canLogin) {
          // 用户被冻结或暂停，立即登出
          await supabase.auth.signOut();
          const statusText = userStatus.status === 'frozen' ? '冻结' : '暂停';
          throw new Error(`账户已被${statusText}，无法登录。请联系客服处理。`);
        }
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "登录失败";
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "登出失败";
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        throw error;
      }
      toast.success("重置密码链接已发送到您的邮箱");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "发送重置邮件失败";
      toast.error(errorMessage);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: { [key: string]: unknown }) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "注册失败";
      toast.error(errorMessage);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signOut, 
      sendPasswordResetEmail,
      signUp
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 