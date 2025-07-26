import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface QuickAuthCheckProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const QuickAuthCheck = ({ 
  children, 
  redirectTo = '/login' 
}: QuickAuthCheckProps) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setIsAuthenticated(true);
        } else {
          navigate(redirectTo, { replace: true });
          return;
        }
      } catch (error) {
        console.error('认证检查失败:', error);
        navigate(redirectTo, { replace: true });
        return;
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [navigate, redirectTo]);

  if (isChecking) {
    return null; // 不显示任何加载状态，直接空白
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}; 