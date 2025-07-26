import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const HomeSimple = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🏠 极简首页加载中...');
    
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          console.log('✅ 用户已登录:', session.user.email);
        } else {
          console.log('❌ 用户未登录，跳转登录页');
          window.location.href = '/login-simple';
        }
      } catch (error) {
        console.error('❌ 获取用户信息失败:', error);
        window.location.href = '/login-simple';
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("退出登录成功");
      window.location.href = '/login-simple';
    } catch (error) {
      console.error('❌ 退出登录失败:', error);
      toast.error("退出登录失败");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // 已经重定向
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">惠享生活</h1>
              <p className="text-gray-600">欢迎回来，{user.email}</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="text-red-600 hover:text-red-700">
              退出登录
            </Button>
          </div>
        </Card>

        {/* 功能区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">钱包余额</h3>
              <p className="text-gray-600">查看和管理您的账户余额</p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">我的订单</h3>
              <p className="text-gray-600">查看所有订单记录</p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">👤</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">个人中心</h3>
              <p className="text-gray-600">管理个人信息和设置</p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">话费充值</h3>
              <p className="text-gray-600">手机话费快速充值</p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">电费缴费</h3>
              <p className="text-gray-600">电费在线缴费服务</p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">💳</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">信用卡还款</h3>
              <p className="text-gray-600">信用卡便捷还款</p>
            </div>
          </Card>
        </div>

        {/* 底部信息 */}
        <Card className="p-6 mt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">服务说明</h3>
            <p className="text-gray-600">
              惠享生活致力于为用户提供便捷、安全的生活服务平台。
              我们采用银行级加密技术保障您的资金安全，提供7x24小时客服支持。
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HomeSimple; 