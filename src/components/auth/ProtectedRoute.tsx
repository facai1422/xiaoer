import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  showToast?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  redirectTo = '/login',
  showToast = false  // 默认不显示toast
}: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isInitialized = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    if (isInitialized.current) return;
    
    const checkAuth = async () => {
      if (!isMounted.current) return;
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('认证检查错误:', error);
          if (isMounted.current) {
            setIsAuthenticated(false);
            navigate(redirectTo, { replace: true });
          }
        } else if (session) {
          if (isMounted.current) {
            setIsAuthenticated(true);
          }
        } else {
          if (isMounted.current) {
            setIsAuthenticated(false);
            navigate(redirectTo, { replace: true });
          }
        }
      } catch (error) {
        console.error('认证检查异常:', error);
        if (isMounted.current) {
          setIsAuthenticated(false);
          navigate(redirectTo, { replace: true });
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          isInitialized.current = true;
        }
      }
    };

    checkAuth();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted.current) return;
      
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        navigate(redirectTo, { replace: true });
      } else if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
      }
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, [navigate, redirectTo, showToast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">正在跳转...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // 已经在导航到登录页面
  }

  return <>{children}</>;
}; 