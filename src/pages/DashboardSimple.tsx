import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const DashboardSimple = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🏠 简化首页：检查用户登录状态...');
    
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ 认证检查失败:', error);
          window.location.href = '/login-simple';
          return;
        }
        
        if (!session) {
          console.log('❌ 用户未登录，跳转到登录页');
          window.location.href = '/login-simple';
          return;
        }
        
        console.log('✅ 用户已登录:', session.user.email);
        setUser(session.user);
              } catch (error) {
        console.error('❌ 认证检查异常:', error);
        window.location.href = '/login-simple';
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("已退出登录");
      window.location.href = '/login-simple';
    } catch (error) {
      console.error('❌ 退出登录失败:', error);
      toast.error("退出登录失败");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // 会被重定向处理
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">惠享生活</h1>
              <p className="text-gray-600">欢迎，{user.email}</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              退出登录
            </Button>
          </div>
        </div>

        {/* 功能菜单 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/wallet')}>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">💰</span>
              </div>
              <h3 className="font-semibold">我的钱包</h3>
              <p className="text-gray-600 text-sm">余额管理</p>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/orders')}>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">📋</span>
              </div>
              <h3 className="font-semibold">我的订单</h3>
              <p className="text-gray-600 text-sm">订单管理</p>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">👤</span>
              </div>
              <h3 className="font-semibold">个人中心</h3>
              <p className="text-gray-600 text-sm">账户设置</p>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">🛒</span>
              </div>
              <h3 className="font-semibold">业务充值</h3>
              <p className="text-gray-600 text-sm">各类充值</p>
            </div>
          </Card>
        </div>

        {/* 业务服务 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">热门服务</h3>
          <div className="grid grid-cols-4 gap-4">
            <Button className="h-16 flex flex-col items-center justify-center bg-blue-500 hover:bg-blue-600 text-white">
              <span className="text-xs mb-1">📱</span>
              <span className="text-xs">话费充值</span>
            </Button>
            <Button className="h-16 flex flex-col items-center justify-center bg-green-500 hover:bg-green-600 text-white">
              <span className="text-xs mb-1">⚡</span>
              <span className="text-xs">电费充值</span>
            </Button>
            <Button className="h-16 flex flex-col items-center justify-center bg-red-500 hover:bg-red-600 text-white">
              <span className="text-xs mb-1">🎵</span>
              <span className="text-xs">抖币充值</span>
            </Button>
            <Button className="h-16 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 text-white">
              <span className="text-xs mb-1">💳</span>
              <span className="text-xs">花呗代还</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSimple; 