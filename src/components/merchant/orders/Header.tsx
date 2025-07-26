
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onLogout: () => Promise<void>;
}

export const Header = ({ onLogout }: HeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <button 
          onClick={handleBack}
          className="text-gray-600"
        >
          返回
        </button>
        <div className="text-lg font-medium">在线订单</div>
      </div>
      <button 
        onClick={onLogout}
        className="flex items-center text-gray-600"
      >
        <LogOut className="w-5 h-5" />
        <span className="ml-1">退出</span>
      </button>
    </div>
  );
};
