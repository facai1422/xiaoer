
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("请输入正确的邮箱地址");
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast.success("重置密码链接已发送到您的邮箱");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.message || "发送重置邮件失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#543ab7] to-[#00acc1] px-6 py-12">
      <div className="max-w-md mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 text-white flex items-center"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="ml-2">返回</span>
        </button>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            忘记密码
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            请输入您的注册邮箱，我们将发送重置密码链接给您
          </p>

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <Input
                type="email"
                placeholder="请输入邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-[#6c2bd9] hover:bg-[#5a23b6]"
              disabled={isLoading}
            >
              {isLoading ? "发送中..." : "发送重置链接"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
