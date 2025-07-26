import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const MerchantLogin = () => {
  const [secretKey, setSecretKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!secretKey) {
        toast.error("请输入登录密钥");
        setIsLoading(false);
        return;
      }
      
      // Here you would normally validate the secret key against a database
      // For this example, we'll use simplified validation
      if (secretKey !== "demo123") { // Replace with actual validation logic
        toast.error("密钥不正确，请重新输入");
        setIsLoading(false);
        return;
      }
      
      // 简化登录逻辑，直接允许访问
      toast.success("登录成功");
      navigate("/merchant");
    } catch (error) {
      console.error('Login error:', error);
      toast.error("系��错误，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col">
      <div className="bg-[#001529] text-white py-4 px-6">
        <h1 className="text-xl font-semibold">商户系统</h1>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">商户登录</h2>
            <p className="text-gray-500 mt-2">请使用管理员分配的登录密钥登录</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="请输入登录密钥"
                value={secretKey}
                onChange={e => setSecretKey(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#1890ff] hover:bg-[#40a9ff]"
              disabled={isLoading}
            >
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              className="text-[#1890ff]"
              onClick={() => navigate("/agent/apply")}
            >
              申请商家入驻
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MerchantLogin;
