
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 检查是否是从重置密码邮件链接过来的
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("无效的重置链接");
        navigate("/login");
      }
    };
    checkSession();
  }, [navigate]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (password.length < 6) {
        toast.error("密码长度不能少于6位");
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        toast.error("两次输入的密码不一致");
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
      } else {
        toast.success("密码重置成功");
        navigate("/login");
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error("重置密码失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#543ab7] to-[#00acc1] px-6 py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            重置密码
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            请输入新密码
          </p>

          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div>
              <Input
                type="password"
                placeholder="请输入新密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="请确认新密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-[#6c2bd9] hover:bg-[#5a23b6]"
              disabled={isLoading}
            >
              {isLoading ? "重置中..." : "重置密码"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
