import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';
import { SimpleAuthCheck } from '@/components/auth/SimpleAuthCheck';

const ProfileSimple = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{
    id: string;
    email: string;
    username: string;
  } | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            username: session.user.email?.split('@')[0] || '用户'
          });
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("已退出登录");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error('退出登录失败:', error);
      toast.error("退出登录失败");
    }
  };

  return (
    <SimpleAuthCheck>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <h1 className="text-lg font-semibold">个人中心</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-white mx-4 mt-4 rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{user.username}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
        <div className="divide-y divide-gray-100">
          <button
            onClick={() => navigate('/orders')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">我的订单</span>
            <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
          </button>
          
          <button
            onClick={() => navigate('/wallet')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">我的钱包</span>
            <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
          </button>
          
          <button
            onClick={() => navigate('/customer-service')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">客服中心</span>
            <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-red-600"
          >
            <span>退出登录</span>
            <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
          </button>
        </div>
      </div>

      <BottomNav />
      </div>
    </SimpleAuthCheck>
  );
};

export default ProfileSimple; 