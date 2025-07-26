import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const LoginSimple = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("请输入邮箱和密码");
      return;
    }

    setIsLoading(true);
    console.log('🔐 开始登录...');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        console.error('❌ 登录失败:', error);
        toast.error("登录失败：" + error.message);
        return; // 让finally处理loading状态重置
      }

      if (data.user) {
        console.log('✅ 登录成功，用户ID:', data.user.id);
        toast.success("登录成功！");
        
        // 立即跳转到主页
        console.log('🚀 跳转到主页');
        window.location.href = '/dashboard';
        return; // 让finally处理loading状态重置
      }
    } catch (error: any) {
      console.error('❌ 登录异常:', error);
      toast.error("登录失败，请重试");
    } finally {
      // 确保无论成功失败都重置loading状态
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#543ab7] to-[#00acc1]">
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="waves relative w-full h-[15vh] min-h-[100px] max-h-[150px]" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
            <defs>
              <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
            </defs>
            <g className="parallax">
              <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(255, 255, 255, 0.7)" className="animate-[move-forever_25s_cubic-bezier(.55,.5,.45,.5)_infinite_-2s]" />
              <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(255, 255, 255, 0.5)" className="animate-[move-forever_20s_cubic-bezier(.55,.5,.45,.5)_infinite_-1s]" />
              <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(255, 255, 255, 0.3)" className="animate-[move-forever_15s_cubic-bezier(.55,.5,.45,.5)_infinite]" />
              <use xlinkHref="#gentle-wave" x="48" y="7" fill="white" className="animate-[move-forever_30s_cubic-bezier(.55,.5,.45,.5)_infinite_-4s]" />
            </g>
          </svg>
        </div>
      </div>

      <div className="relative px-6 pt-20 z-10">
        <div className="text-center mb-12">
          <h1 className="mb-3 text-7xl font-bold text-white">惠享生活</h1>
          <p className="text-white/80 text-sm">信息加密、智能交易、资金全额保障</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 mb-8">
          <Input 
            type="email" 
            placeholder="请输入邮箱" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="h-12 bg-white/90 backdrop-blur-sm" 
            disabled={isLoading}
          />
          <Input 
            type="password" 
            placeholder="请输入密码" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            className="h-12 bg-white/90 backdrop-blur-sm"
            disabled={isLoading}
          />
          <div className="flex justify-end">
            <Button 
              variant="link" 
              className="text-white hover:text-white/80 p-0 h-auto" 
              onClick={e => {
                e.preventDefault();
                navigate("/forgot-password");
              }}
              disabled={isLoading}
            >
              忘记密码？
            </Button>
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 bg-[#6c2bd9] hover:bg-[#5a23b6]" 
            disabled={isLoading}
          >
            {isLoading ? "登录中..." : "登录"}
          </Button>
        </form>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Button
            className="h-12 bg-green-500 hover:bg-green-600 text-white"
            onClick={() => navigate("/register")}
            disabled={isLoading}
          >
            <span className="mr-2">👤</span>
            用户登录
          </Button>
          <Button
            className="h-12 bg-pink-500 hover:bg-pink-600 text-white"
            onClick={() => navigate("/register")}
            disabled={isLoading}
          >
            <span className="mr-2">📝</span>
            用户注册
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <Button className="h-16 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20" disabled={isLoading}>
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-1 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs">话</span>
              </div>
              <span className="text-xs">话费充值</span>
            </div>
          </Button>
          <Button className="h-16 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20" disabled={isLoading}>
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-1 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-xs">电</span>
              </div>
              <span className="text-xs">电费充值</span>
            </div>
          </Button>
          <Button className="h-16 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20" disabled={isLoading}>
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-1 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs">抖</span>
              </div>
              <span className="text-xs">抖币充值</span>
            </div>
          </Button>
          <Button className="h-16 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20" disabled={isLoading}>
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-1 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-xs">支</span>
              </div>
              <span className="text-xs">花呗代还</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginSimple; 