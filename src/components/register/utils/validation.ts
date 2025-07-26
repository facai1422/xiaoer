import { supabase } from "@/integrations/supabase/client";

export const validateUsername = (username: string): string | null => {
  if (!username) return "请填写账号";
  return null;
};

export const validatePassword = (password: string, confirmPassword: string): string | null => {
  if (!password) return "请填写密码";
  if (password !== confirmPassword) return "两次输入的密码不一致";
  return null;
};

interface ReferrerData {
  id: string;
  user_id: string;
  username: string | null;
  status: string | null;
  invite_code: string | null;
}

export const validateInviteCode = async (inviteCode: string): Promise<{ isValid: boolean; error?: string; referrer?: ReferrerData }> => {
  if (!inviteCode || inviteCode.trim() === "") {
    return { isValid: false, error: "请填入邀请码" };
  }

  // 基本格式验证
  const cleanInviteCode = inviteCode.trim().toUpperCase();
  if (cleanInviteCode.length < 4 || cleanInviteCode.length > 20) {
    return { isValid: false, error: "邀请码格式不正确" };
  }

  try {
    // 使用数据库函数验证邀请码
    const { data: isValidInviteCode, error: inviteCodeError } = await supabase
      .rpc('check_invite_code', { p_invite_code: cleanInviteCode });

    if (inviteCodeError) {
      console.error('邀请码验证错误:', inviteCodeError);
      return { isValid: false, error: "邀请码验证失败，请重试" };
    }

    if (!isValidInviteCode) {
      return { isValid: false, error: "邀请码无效，请检查后重新输入" };
    }

    // 获取邀请人信息
    const { data: referrerData, error: referrerError } = await supabase
      .from('user_profiles')
      .select('id, user_id, username, status, invite_code')
      .eq('invite_code', cleanInviteCode)
      .eq('status', 'active')
      .single();

    if (referrerError || !referrerData) {
      console.error('获取邀请人信息错误:', referrerError);
      return { isValid: false, error: "邀请码对应的用户不存在或已被禁用" };
    }

    return { 
      isValid: true, 
      referrer: referrerData 
    };
  } catch (error) {
    console.error('邀请码验证异常:', error);
    return { isValid: false, error: "邀请码验证失败，请重试" };
  }
};
