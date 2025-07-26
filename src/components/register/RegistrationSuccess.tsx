
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const RegistrationSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-lg shadow">
      <div className="text-5xl mb-4">✅</div>
      <h2 className="text-xl font-bold mb-2">注册成功</h2>
      <p className="text-gray-600 mb-4">
        注册成功！您现在可以使用邮箱和密码登录系统。
      </p>
      <Button
        type="button"
        onClick={() => navigate("/login")}
        className="mt-4 bg-[#6c2bd9] hover:bg-[#5a23b6]"
      >
        返回登录
      </Button>
    </div>
  );
};
