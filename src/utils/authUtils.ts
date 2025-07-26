import { supabase } from "@/integrations/supabase/client";

/**
 * 快速检查用户登录状态
 * 如果未登录，直接跳转到登录页面，不显示加载状态
 */
export const quickAuthCheck = async (navigate: (path: string, options?: { replace?: boolean }) => void): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // 直接跳转，不显示任何提示
      navigate("/login", { replace: true });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('认证检查失败:', error);
    navigate("/login", { replace: true });
    return false;
  }
};

/**
 * 获取当前用户信息（如果已登录）
 */
export const getCurrentUser = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
};

/**
 * 检查是否已登录（不跳转）
 */
export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('检查登录状态失败:', error);
    return false;
  }
}; 