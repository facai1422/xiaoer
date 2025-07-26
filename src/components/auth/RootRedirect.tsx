import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Dashboard from "@/pages/Dashboard";

export const RootRedirect = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 超时保护：最多2秒后强制结束检查
    const timeoutId = setTimeout(() => {
      console.log('⚠️ 根路由认证检查超时，默认跳转到登录页');
      setIsAuthenticated(false);
      setIsLoading(false);
    }, 2000);
    
    const checkAuth = async () => {
      try {
        console.log('🔍 根路由：检查用户登录状态...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // 清除超时计时器
        clearTimeout(timeoutId);
        
        if (error) {
          console.error('❌ 认证检查失败:', error);
          setIsAuthenticated(false);
        } else if (session) {
          console.log('✅ 用户已登录，显示首页');
          setIsAuthenticated(true);
        } else {
          console.log('❌ 用户未登录，将重定向到登录页');
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('❌ 认证检查异常:', error);
        clearTimeout(timeoutId);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return <Navigate to="/login" replace />;
}; 