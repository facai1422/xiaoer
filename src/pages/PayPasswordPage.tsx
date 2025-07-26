
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PayPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length !== 6) {
      toast.error("支付密码必须为6位数字");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("两次输入的密码不一致");
      return;
    }

    // 保存支付密码
    localStorage.setItem("payPassword", password);
    toast.success("支付密码设置成功");
    
    // 返回上一页
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center border-b">
        <button onClick={() => navigate(-1)} className="text-gray-600" title="返回">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold flex-1 text-center mr-6">设置支付密码</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div className="space-y-2">
          <label className="text-sm text-gray-500">支付密码</label>
          <Input
            type="password"
            maxLength={6}
            placeholder="请输入6位数字支付密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-500">确认密码</label>
          <Input
            type="password"
            maxLength={6}
            placeholder="请再次输入支付密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-12"
          />
        </div>

        <Button type="submit" className="w-full h-12">
          确认
        </Button>
      </form>

      <div className="p-4">
        <div className="text-sm text-gray-500 space-y-2">
          <p>温馨提示：</p>
          <p>1. 支付密码用于保护您的账户资金安全</p>
          <p>2. 请设置6位数字的支付密码</p>
          <p>3. 请牢记您的支付密码，忘记密码可通过客服重置</p>
        </div>
      </div>
    </div>
  );
};

export default PayPasswordPage;
