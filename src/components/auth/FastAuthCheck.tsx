import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface FastAuthCheckProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const FastAuthCheck = ({ 
  children, 
  redirectTo = '/login' 
}: FastAuthCheckProps) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (error || !session) {
          setIsAuthenticated(false);
          navigate(redirectTo, { replace: true });
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('认证检查失败:', error);
        if (isMounted) {
          setIsAuthenticated(false);
          navigate(redirectTo, { replace: true });
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate, redirectTo]);

  // 显示加载状态
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">验证登录状态...</p>
        </div>
      </div>
    );
  }

  // 如果未认证，不渲染任何内容（已经跳转到登录页）
  if (!isAuthenticated) {
    return null;
  }

  // 认证成功，渲染子组件
  return <>{children}</>;
}; 