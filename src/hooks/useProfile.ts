import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ProfileData {
  username: string | null;
  id: string;
  email?: string;
  balance?: number;
  frozen_balance?: number;
}

export const useProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  const loadProfileData = async () => {
    if (!mountedRef.current || loadingRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);

    try {
      console.log('🔍 开始加载用户资料...');
      
      // 获取会话
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log('⚠️ 用户未登录，InstantAuthCheck会处理跳转');
        if (mountedRef.current) {
          setProfile({
            id: 'guest',
            username: '游客',
            email: '',
            balance: 0,
            frozen_balance: 0
          });
        }
        return;
      }

      console.log('✅ 用户已登录，用户ID:', session.user.id);

      // 获取用户资料（包括余额信息）
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('username, balance, frozen_balance')
        .eq('user_id', session.user.id)
        .maybeSingle();

      // 更新状态
      if (mountedRef.current) {
        setProfile({
          id: session.user.id,
          username: profileData?.username || session.user.email?.split('@')[0] || '用户',
          email: session.user.email,
          balance: profileData?.balance || 0,
          frozen_balance: profileData?.frozen_balance || 0
        });
        console.log('✅ 用户资料加载完成');
      }
    } catch (error) {
      console.error("❌ 加载用户资料失败:", error);
      if (mountedRef.current) {
        // 设置默认资料而不是跳转，让InstantAuthCheck处理认证
        setProfile({
          id: 'error',
          username: '加载失败',
          email: '',
          balance: 0,
          frozen_balance: 0
        });
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // 防抖加载
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        loadProfileData();
      }
    }, 100);

    // 超时保护：确保10秒内结束加载状态
    const timeoutId = setTimeout(() => {
      console.log('⚠️ 用户资料超时保护：强制结束加载状态');
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }, 10000);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      clearTimeout(timeoutId);
    };
  }, []);

  const refreshProfile = async () => {
    await loadProfileData();
    if (mountedRef.current) {
      toast.success("资料已刷新");
    }
  };

  return {
    profile,
    isLoading,
    navigateTo: navigate,
    refreshProfile
  };
};