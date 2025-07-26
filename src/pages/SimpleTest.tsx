import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const SimpleTest = () => {
  const [status, setStatus] = useState("初始化中...");
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  useEffect(() => {
    const testAuth = async () => {
      try {
        setStatus("检查认证状态...");
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setStatus(`认证错误: ${error.message}`);
          return;
        }

        if (!session) {
          setStatus("未登录");
          return;
        }

        setUser(session.user);
        setStatus("认证成功");
      } catch (err) {
        setStatus(`异常: ${err instanceof Error ? err.message : '未知错误'}`);
      }
    };

    testAuth();
  }, []);

  const handleLogin = async () => {
    try {
      setStatus("正在登录...");
      const { error } = await supabase.auth.signInWithPassword({
        email: 'test_user@example.com',
        password: 'password123'
      });

      if (error) {
        setStatus(`登录失败: ${error.message}`);
      } else {
        setStatus("登录成功，刷新页面...");
        window.location.reload();
      }
    } catch (err) {
      setStatus(`登录异常: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  const handleLogout = async () => {
    try {
      setStatus("正在登出...");
      await supabase.auth.signOut();
      setStatus("已登出");
      setUser(null);
    } catch (err) {
      setStatus(`登出异常: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-bold mb-4">简单测试页面</h1>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">状态:</p>
          <p className="font-mono text-sm bg-gray-100 p-2 rounded">{status}</p>
        </div>

        {user && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">用户信息:</p>
            <div className="font-mono text-sm bg-blue-50 p-2 rounded">
              <p>ID: {user.id}</p>
              <p>邮箱: {user.email}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {!user ? (
            <Button onClick={handleLogin} className="w-full">
              测试登录
            </Button>
          ) : (
            <Button onClick={handleLogout} variant="outline" className="w-full">
              登出
            </Button>
          )}
          
          <Button 
            onClick={() => window.location.href = '/'}
            variant="secondary"
            className="w-full"
          >
            返回首页
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimpleTest; 