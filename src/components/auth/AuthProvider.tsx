import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthContext } from "@/contexts/AuthContext";

interface UserProfile {
  id: string;
  user_id: string;
  email?: string;
  phone?: string;
  username?: string;
  full_name?: string;
  balance: number;
  status?: string;
  invite_code?: string;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const userProfile: UserProfile = {
            id: session.user.id,
            user_id: session.user.id,
            email: session.user.email,
            balance: 0,
            status: 'active'
          };
          setUser(userProfile);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const userProfile: UserProfile = {
            id: session.user.id,
            user_id: session.user.id,
            email: session.user.email,
            balance: 0,
            status: 'active'
          };
          setUser(userProfile);
        } else if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "登录失败";
      toast.error(errorMessage);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "登出失败";
      toast.error(errorMessage);
      throw error;
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
      const { data, error } = await supabase.auth.signUp({
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
