
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  CreditCard,
  BarChart,
  MessageCircle,
  HelpCircle,
  LogOut
} from "lucide-react";
import {
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  path?: string;
  onClick?: () => void;
}

const SidebarItem = ({ icon, label, path, onClick }: SidebarItemProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (path) {
      navigate(path);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={handleClick} className="w-full">
        {icon}
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full py-4">
      <div className="px-4 mb-6">
        <h1 className="text-xl font-bold text-white">商户中心</h1>
      </div>
      
      <SidebarMenu>
        <SidebarItem icon={<Home className="h-4 w-4" />} label="首页" path="/merchant/dashboard" />
        <SidebarItem icon={<ShoppingCart className="h-4 w-4" />} label="订单管理" path="/merchant/orders" />
        <SidebarItem icon={<CreditCard className="h-4 w-4" />} label="支付订单" path="/merchant/payment-orders" />
        <SidebarItem icon={<FileText className="h-4 w-4" />} label="待处理订单" path="/merchant/pending-orders" />
        <SidebarItem icon={<Users className="h-4 w-4" />} label="客户管理" path="/merchant/customers" />
        <SidebarItem icon={<BarChart className="h-4 w-4" />} label="数据统计" path="/merchant/statistics" />
        <SidebarItem icon={<MessageCircle className="h-4 w-4" />} label="在线客服" path="/customer-service" />
        <SidebarItem icon={<Settings className="h-4 w-4" />} label="系统设置" path="/merchant/settings" />
        <SidebarItem icon={<HelpCircle className="h-4 w-4" />} label="帮助中心" path="/merchant/help" />
      </SidebarMenu>
      
      <div className="mt-auto px-4">
        <SidebarMenuButton 
          className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400"
          onClick={() => navigate("/login")}
        >
          <LogOut className="h-4 w-4" />
          <span>退出登录</span>
        </SidebarMenuButton>
      </div>
    </div>
  );
};

export default Sidebar;
