import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

// 钩子函数：监听并获取最新的钱包余额
export const useWalletBalance = () => {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // 获取最新余额 - 简化的查询逻辑
  const fetchBalance = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 获取当前用户
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('⚠️ 用户未登录，设置余额为0');
        setBalance(0);
        setError(null); // 不显示错误，因为会被InstantAuthCheck处理
        return;
      }
      
      const currentUserId = user.id;
      setUserId(currentUserId);

      console.log('🔍 查询用户余额，用户ID:', currentUserId);

      // 简化查询：只查询user_profiles表
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('balance')
        .eq('user_id', currentUserId)
        .maybeSingle();
      
      if (!profileError && profileData) {
        const balance = Number(profileData.balance) || 0;
        console.log('✅ 获取余额成功:', balance);
        setBalance(balance);
        return;
      }

      // 如果没有找到用户档案，创建默认档案
      console.log('⚠️ 未找到用户档案，创建默认档案...');
      try {
        const { error: createError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: currentUserId,
            email: user.email,
            balance: 0,
            frozen_balance: 0,
            total_recharge: 0,
            total_withdraw: 0,
            total_commission: 0,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
        
        if (!createError) {
          console.log('✅ 已创建默认用户档案');
          setBalance(0);
        } else {
          console.error('❌ 创建用户档案失败:', createError);
          setBalance(0);
        }
      } catch (createErr) {
        console.error('❌ 创建用户档案异常:', createErr);
        setBalance(0);
      }

    } catch (err) {
      console.error('❌ 获取余额异常:', err);
      setError('获取余额失败');
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化时获取余额
  useEffect(() => {
    console.log('🚀 useWalletBalance钩子初始化');
    fetchBalance();
    
    // 超时保护：确保10秒内结束加载状态
    const timeoutId = setTimeout(() => {
      console.log('⚠️ 钱包余额超时保护：强制结束加载状态');
      setIsLoading(false);
    }, 10000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // 设置实时监听
  useEffect(() => {
    if (!userId) {
      return;
    }
    
    let channel: RealtimeChannel | null = null;
    let isSubscribed = false;
    
    try {
      // 创建监听通道 - 监听user_profiles表的变更
      channel = supabase
        .channel(`user_balance_${userId}_${Date.now()}`) // 添加时间戳确保唯一性
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_profiles',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            if (payload.new && typeof payload.new.balance === 'number') {
              setBalance(payload.new.balance);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_profiles',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            if (payload.new && typeof payload.new.balance === 'number') {
              setBalance(payload.new.balance);
            }
          }
        );

      // 订阅通道
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isSubscribed = true;
        }
      });
        
    } catch (error) {
      console.error('❌ 设置实时订阅失败:', error);
    }

    // 监听自定义余额更新事件
    const handleBalanceUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.balance === 'number') {
        setBalance(customEvent.detail.balance);
        console.log('✅ 余额已通过自定义事件更新:', customEvent.detail.balance);
      }
    };

    // 监听页面可见性变化，重新获取余额
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ 页面重新可见，刷新余额');
        fetchBalance();
      }
    };

    window.addEventListener('balance-updated', handleBalanceUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    console.log('✅ 已添加事件监听器');

    // 清理函数
    return () => {
      if (channel && isSubscribed) {
        channel.unsubscribe().catch(() => {
          // 静默处理取消订阅错误
        });
      }
      
      window.removeEventListener('balance-updated', handleBalanceUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId]); // 依赖项只有userId

  // 手动刷新余额
  const refreshBalance = () => {
    console.log('🔄 手动刷新余额');
    fetchBalance();
  };

  return { balance, isLoading, error, refreshBalance };
};

export default useWalletBalance; 