import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface VerificationCodeInputProps {
  email: string;
  verificationCode: string;
  onVerificationCodeChange: (code: string) => void;
  disabled?: boolean;
}

export const VerificationCodeInput = ({
  email,
  verificationCode,
  onVerificationCodeChange,
  disabled = false
}: VerificationCodeInputProps) => {
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>("");

  const handleSendVerificationCode = async () => {
    if (!email) {
      toast.error("请输入邮箱地址");
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("请输入有效的邮箱地址");
      return;
    }

    setIsSendingCode(true);
    try {
      // 生成6位数字验证码
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(verificationCode);
      
      // 模拟发送延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCodeSent(true);
      toast.success("验证码已发送到您的邮箱");
      
      // 在开发/测试模式下直接显示验证码
      toast.info(`测试模式: 您的验证码是 ${verificationCode}`, {
        duration: 10000, // 显示10秒
      });
      
      console.log(`验证码已生成: ${verificationCode} (邮箱: ${email})`);
      
    } catch (error: any) {
      console.error("发送验证码错误:", error);
      toast.error("发送验证码失败，请稍后重试");
    } finally {
      setIsSendingCode(false);
    }
  };

  // 导出验证函数供父组件使用
  const isCodeValid = () => {
    return verificationCode === generatedCode && generatedCode !== "";
  };

  // 通过组件的ref暴露验证函数
  if (typeof window !== 'undefined') {
    (window as any).verifyCode = isCodeValid;
  }

  return (
    <div className="space-y-2">
    <div className="flex space-x-2">
      <Input
        type="text"
        placeholder="请输入验证码"
        value={verificationCode}
        onChange={(e) => onVerificationCodeChange(e.target.value)}
        className="h-12 bg-white/90 backdrop-blur-sm"
        disabled={disabled}
          maxLength={6}
      />
      <Button
        type="button"
        onClick={handleSendVerificationCode}
        className="h-12 bg-[#6c2bd9] hover:bg-[#5a23b6] whitespace-nowrap"
          disabled={isSendingCode || disabled}
      >
          {isSendingCode ? "发送中..." : codeSent ? "重新发送" : "发送验证码"}
      </Button>
      </div>
      
      {codeSent && (
        <p className="text-sm text-gray-600">
          验证码已发送，请查收。如未收到，请检查垃圾邮件箱或点击重新发送。
        </p>
      )}
    </div>
  );
};
