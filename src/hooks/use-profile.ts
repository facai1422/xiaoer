import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { UserProfile } from '@/types';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useRef(false);
  const isMounted = useRef(true);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const fetchProfile = async () => {
    if (!user?.id || !isMounted.current) return;

    // 防抖处理
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        // 通过user_id查找用户资料
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        if (profileData && isMounted.current) {
          // 转换为UserProfile类型
          const userProfile: UserProfile = {
            id: profileData.id,
            user_id: profileData.user_id,
            email: profileData.email || user.email,
            username: profileData.username || user.email?.split('@')[0] || '',
            full_name: profileData.full_name || '',
            phone: profileData.phone || '',
            avatar_url: profileData.avatar_url || '',
            balance: profileData.balance || 0,
            frozen_balance: profileData.frozen_balance || 0,
            total_recharge: profileData.total_recharge || 0,
            total_withdraw: profileData.total_withdraw || 0,
            total_commission: profileData.total_commission || 0,
            invite_code: profileData.invite_code || '',
            referrer_id: profileData.referrer_id,
            agent_level: profileData.agent_level || 0,
            commission_rate: profileData.commission_rate || 0,
            status: profileData.status || 'active',
            created_at: profileData.created_at,
            updated_at: profileData.updated_at,
            referral_count: profileData.referral_count || 0
          };
          setProfile(userProfile);
        } else if (isMounted.current) {
          // 如果没有找到用户资料，创建一个新的
          const newProfileData = {
            user_id: user.id,
            username: user.email?.split('@')[0] || `user_${Date.now()}`,
            email: user.email || '',
            phone: '',
            full_name: '',
            avatar_url: '',
            balance: 0,
            invite_code: generateInviteCode(),
            status: 'active'
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([newProfileData])
            .select('*')
            .single();

          if (createError) {
            console.error('创建用户资料失败:', createError);
            // 使用默认资料
            const defaultProfile: UserProfile = {
              id: '',
              user_id: user.id,
              email: user.email,
              username: user.email?.split('@')[0] || '',
              full_name: '',
              phone: '',
              avatar_url: '',
              balance: 0,
              invite_code: '',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            setProfile(defaultProfile);
          } else if (createdProfile && isMounted.current) {
            const userProfile: UserProfile = {
              id: createdProfile.id,
              user_id: createdProfile.user_id,
              email: createdProfile.email,
              username: createdProfile.username,
              full_name: createdProfile.full_name || '',
              phone: createdProfile.phone || '',
              avatar_url: createdProfile.avatar_url || '',
              balance: createdProfile.balance,
              frozen_balance: createdProfile.frozen_balance || 0,
              total_recharge: createdProfile.total_recharge || 0,
              total_withdraw: createdProfile.total_withdraw || 0,
              total_commission: createdProfile.total_commission || 0,
              invite_code: createdProfile.invite_code,
              referrer_id: createdProfile.referrer_id,
              agent_level: createdProfile.agent_level || 0,
              commission_rate: createdProfile.commission_rate || 0,
              status: createdProfile.status || 'active',
              created_at: createdProfile.created_at,
              updated_at: createdProfile.updated_at,
              referral_count: createdProfile.referral_count || 0
            };
            setProfile(userProfile);
          }
        }
      } catch (err) {
        console.error('获取用户资料失败:', err);
        if (isMounted.current) {
          setError(err instanceof Error ? err.message : '获取用户资料失败');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    }, 300);
  };

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile?.id || !isMounted.current) return false;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          username: updates.username,
          full_name: updates.full_name,
          phone: updates.phone,
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .select('*')
        .single();

      if (error) throw error;

      if (data && isMounted.current) {
        setProfile(prev => prev ? { 
          ...prev, 
          username: data.username,
          full_name: data.full_name || '',
          phone: data.phone || '',
          avatar_url: data.avatar_url || '',
          balance: data.balance,
          invite_code: data.invite_code,
          status: data.status || 'active',
          updated_at: data.updated_at
        } : null);
      }

      return true;
    } catch (err) {
      console.error('更新用户资料失败:', err);
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : '更新用户资料失败');
      }
      return false;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user && !isInitialized.current && isMounted.current) {
      isInitialized.current = true;
      fetchProfile();
    }
  }, [user]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile
  };
} 