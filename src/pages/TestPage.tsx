import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const TestPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. 获取会话
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`会话错误: ${sessionError.message}`);
        }

        if (!session) {
          navigate("/login", { replace: true });
          return;
        }

        if (!mounted) return;
        setUser(session.user);

        // 2. 获取用户资料
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profileError) {
          throw new Error(`资料查询错误: ${profileError.message}`);
        }

        if (!mounted) return;
        setProfile(profileData);

      } catch (err) {
        console.error('加载数据失败:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : '未知错误');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">❌ 错误: {error}</div>
          <Button onClick={() => navigate("/login")}>返回登录</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </Button>
        <h1 className="text-lg font-semibold ml-4">测试页面</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">用户信息</h2>
          {user && (
            <div className="space-y-2">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>邮箱:</strong> {user.email}</p>
              <p><strong>创建时间:</strong> {new Date(user.created_at).toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">用户资料</h2>
          {profile ? (
            <div className="space-y-2">
              <p><strong>用户名:</strong> {profile.username}</p>
              <p><strong>余额:</strong> {profile.balance}</p>
              <p><strong>状态:</strong> {profile.status}</p>
              <p><strong>角色:</strong> {profile.role}</p>
            </div>
          ) : (
            <p className="text-gray-500">未找到用户资料</p>
          )}
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">操作</h2>
          <div className="space-y-2">
            <Button 
              onClick={() => navigate("/wallet")}
              className="w-full"
            >
              前往钱包
            </Button>
            <Button 
              onClick={() => navigate("/orders")}
              variant="outline"
              className="w-full"
            >
              查看订单
            </Button>
            <Button 
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login");
              }}
              variant="destructive"
              className="w-full"
            >
              退出登录
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 