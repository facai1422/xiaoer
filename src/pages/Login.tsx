
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";


const Login = () => {
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
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("邮箱或密码错误");
        } else {
          toast.error("登录失败，请重试");
        }
        return;
      }

      if (data.user) {
        toast.success("登录成功");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("登录失败，请重试");
    } finally {
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
              <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(255, 255, 255, 0.5)" className="animate-[move-forever_25s_cubic-bezier(.55,.5,.45,.5)_infinite_-3s]" />
              <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(255, 255, 255, 0.3)" className="animate-[move-forever_25s_cubic-bezier(.55,.5,.45,.5)_infinite_-4s]" />
              <use xlinkHref="#gentle-wave" x="48" y="7" fill="#fff" className="animate-[move-forever_25s_cubic-bezier(.55,.5,.45,.5)_infinite_-5s]" />
            </g>
          </svg>
        </div>
      </div>

      <div className="fixed top-0 left-0 right-0 bg-transparent p-4 flex items-center justify-between z-10">
        <Button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center text-white">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <Bell className="w-6 h-6 text-white" />
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
          />
          <Input 
            type="password" 
            placeholder="请输入密码" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            className="h-12 bg-white/90 backdrop-blur-sm" 
          />
          <div className="flex justify-end">
            <Button 
              variant="link" 
              className="text-white hover:text-white/80 p-0 h-auto" 
              onClick={e => {
                e.preventDefault();
                navigate("/forgot-password");
              }}
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
          <Card className="p-4 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm border-none cursor-pointer" onClick={() => navigate("/login")}>
            <div className="w-12 h-12 bg-[#00ffa3] rounded-xl mb-2 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-xs font-medium">用户登录</span>
          </Card>

          <Card className="p-4 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm border-none cursor-pointer" onClick={() => navigate("/register")}>
            <div className="w-12 h-12 bg-[#ff4d94] rounded-xl mb-2 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-xs font-medium">用户注册</span>
          </Card>
        </div>

        <div className="grid grid-cols-4 gap-2 bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white/20 rounded-xl mb-1 flex items-center justify-center">
              <img alt="话费充值" className="w-12 h-12 object-cover" src="/lovable-uploads/b8e03fb2-d9dc-466e-b842-3965e865afc1.png" />
            </div>
            <span className="text-white text-xs">话费充值</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white/20 rounded-xl mb-1 flex items-center justify-center">
              <img alt="电费充值" className="w-12 h-12 object-contain" src="/lovable-uploads/33633912-8804-4b00-b43e-424c9174b630.png" />
            </div>
            <span className="text-white text-xs">电费充值</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white/20 rounded-xl mb-1 flex items-center justify-center overflow-hidden">
              <img alt="抖币充值" className="w-12 h-12 rounded-2xl" src="/lovable-uploads/ddd73dcc-6f46-4f9e-bf3b-58a757ed4fe4.png" />
            </div>
            <span className="text-white text-xs">抖币充值</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-[#222222] rounded-xl mb-1 flex items-center justify-center">
              <img alt="花呗代还" className="w-12 h-12 object-contain" src="/lovable-uploads/f8d89e3a-a50e-4c45-8c8c-a74bdae463d4.png" />
            </div>
            <span className="text-white text-xs">花呗代还</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
