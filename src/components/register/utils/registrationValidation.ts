export const validateRegistrationForm = (
  email: string,
  password: string,
  confirmPassword: string,
  inviteCode?: string
): string | null => {
  // 基本验证
  if (!email || !password || !confirmPassword) {
    return "请填写完整信息";
  }

  // 验证邀请码（必填）
  if (!inviteCode || inviteCode.trim() === "") {
    return "请输入邀请码";
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "请输入有效的邮箱地址";
  }

  // 验证密码
  if (password !== confirmPassword) {
    return "两次输入的密码不一致";
  }

  if (password.length < 6) {
    return "密码长度不能少于6位";
  }

  return null;
};
