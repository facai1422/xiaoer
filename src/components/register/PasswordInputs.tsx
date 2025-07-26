
import { Input } from "@/components/ui/input";

interface PasswordInputsProps {
  password: string;
  confirmPassword: string;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
  disabled?: boolean;
}

export const PasswordInputs = ({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  disabled = false
}: PasswordInputsProps) => {
  return (
    <>
      <Input
        type="password"
        placeholder="请输入密码"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        className="h-12 bg-white/90 backdrop-blur-sm"
        disabled={disabled}
      />
      <Input
        type="password"
        placeholder="请确认密码"
        value={confirmPassword}
        onChange={(e) => onConfirmPasswordChange(e.target.value)}
        className="h-12 bg-white/90 backdrop-blur-sm"
        disabled={disabled}
      />
    </>
  );
};
