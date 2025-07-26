import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";
import { PasswordInputs } from "./PasswordInputs";
import { RegistrationSuccess } from "./RegistrationSuccess";
import { validateRegistrationForm } from "./utils/registrationValidation";

interface RegisterFormProps {
  onSuccess: () => void;
  defaultInviteCode?: string;
}

export const RegisterForm = ({ onSuccess, defaultInviteCode }: RegisterFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  // 当defaultInviteCode改变时，自动填入邀请码
  useEffect(() => {
    if (defaultInviteCode && defaultInviteCode.trim() !== "") {
      setInviteCode(defaultInviteCode.trim().toUpperCase());
    }
  }, [defaultInviteCode]);

  // 最基础的邀请码输入处理
  const handleInviteCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInviteCode(value);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError(null);
    
    try {
      setIsLoading(true);

      // 清理邀请码
      const cleanInviteCode = inviteCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().trim();
      
      // 表单验证
      const validationError = validateRegistrationForm(email, password, confirmPassword, cleanInviteCode);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      console.log('开始注册，邮箱:', email, '邀请码:', cleanInviteCode);

      // 验证邀请码 - 使用数据库函数验证
      const { data: isValidInviteCode, error: inviteCodeError } = await supabase
        .rpc('check_invite_code', { p_invite_code: cleanInviteCode });

      if (inviteCodeError) {
        console.error('邀请码验证错误:', inviteCodeError);
        throw new Error("邀请码验证失败，请重试");
      }

      if (!isValidInviteCode) {
        throw new Error("邀请码无效，请检查后重新输入");
      }

      // 获取邀请人信息
      const { data: referrerData, error: referrerError } = await supabase
        .from('user_profiles')
        .select('id, user_id, username, status')
        .eq('invite_code', cleanInviteCode)
        .eq('status', 'active')
        .single();

      if (referrerError || !referrerData) {
        console.error('获取邀请人信息错误:', referrerError);
        throw new Error("邀请码对应的用户不存在或已被禁用");
      }

      const referrer = referrerData;
      console.log('找到邀请人:', referrer);

      // 第一步：注册认证用户（不依赖触发器）
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });
      
      console.log('Auth注册结果:', { authData, authError });

      if (authError) {
        console.error('Auth注册错误:', authError);
        if (authError.message.includes('already registered')) {
          throw new Error("该邮箱已被注册");
        } else {
          throw new Error(`注册失败: ${authError.message}`);
        }
      }

      if (!authData.user) {
        throw new Error("用户创建失败：未返回用户数据");
      }

      console.log('认证用户创建成功，用户ID:', authData.user.id);

      // 第二步：直接创建用户档案（避免触发器冲突）
      console.log('开始创建用户档案...');
      
      // 生成邀请码
      const userInviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          email: email,
          username: username || `用户${authData.user.id.substring(0, 8)}`,
          invite_code: userInviteCode,
          referrer_id: referrer.id,
          balance: 0,
          total_recharge: 0,
          referral_count: 0,
          status: 'active'
        })
        .select()
        .single();

      if (profileError) {
        console.error('创建用户档案错误:', profileError);
        throw new Error("用户档案创建失败，请重试");
      }
      
      console.log('用户档案创建成功:', profileData);

      // 更新推荐人的推荐数量
      const { data: currentReferrer, error: getReferrerError } = await supabase
        .from('user_profiles')
        .select('referral_count')
        .eq('id', referrer.id)
        .single();

      if (!getReferrerError && currentReferrer) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ 
            referral_count: (currentReferrer.referral_count || 0) + 1
          })
          .eq('id', referrer.id);

        if (updateError) {
          console.error('更新推荐人数量错误:', updateError);
        }
      }

      console.log('用户档案创建成功');

      // 注册成功
      setIsRegistrationComplete(true);
      toast.success("注册成功！邀请关系已建立");

    } catch (error: unknown) {
      console.error('完整的注册错误:', error);
      const errorMessage = error instanceof Error ? error.message : "注册失败，请重试";
      toast.error(errorMessage);
      setRegistrationError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistrationComplete) {
    return <RegistrationSuccess />;
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4 mb-8">
      <div className="relative">
        <Input
          type="email"
          placeholder="请输入邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 bg-white/90 backdrop-blur-sm"
          disabled={isLoading}
        />
      </div>

      <div className="relative">
        <Input
          type="text"
          placeholder="请输入用户名（可选）"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="h-12 bg-white/90 backdrop-blur-sm"
          disabled={isLoading}
        />
      </div>

      <PasswordInputs
        password={password}
        confirmPassword={confirmPassword}
        onPasswordChange={setPassword}
        onConfirmPasswordChange={setConfirmPassword}
        disabled={isLoading}
      />

      <div className="relative">
        <Input
          type="text"
          placeholder={defaultInviteCode ? "邀请码已自动填入" : "请输入邀请码"}
          value={inviteCode}
          onChange={handleInviteCodeChange}
          className={`h-12 bg-white/90 backdrop-blur-sm ${
            defaultInviteCode ? "border-green-300 bg-green-50/90" : ""
          }`}
          disabled={isLoading}
        />
        {defaultInviteCode && inviteCode === defaultInviteCode && (
          <div className="text-xs text-green-600 mt-1 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            来自代理链接的邀请码
          </div>
        )}
      </div>

      {registrationError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center" role="alert">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{registrationError}</span>
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full h-12 bg-[#6c2bd9] hover:bg-[#5a23b6]"
        disabled={isLoading}
      >
        {isLoading ? "注册中..." : "注册"}
      </Button>
    </form>
  );
};
