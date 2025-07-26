
import { ReactNode, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  PackageSearch,
  Users,
  Wallet,
  UserCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  icon: any;
  url?: string;
  submenu?: MenuItem[];
}

interface MerchantLayoutProps {
  children: ReactNode;
}

const MerchantLayout = ({ children }: MerchantLayoutProps) => {
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const menuItems: MenuItem[] = [
    {
      title: "首页",
      icon: Home,
      url: "/merchant",
    },
    {
      title: "运营订单",
      icon: PackageSearch,
      submenu: [
        {
          title: "缴费订单",
          icon: PackageSearch,
          url: "/merchant/payment-orders",
        },
        {
          title: "在线订单",
          icon: PackageSearch,
          url: "/merchant/online-orders",
        },
      ],
    },
    {
      title: "下级管理",
      icon: Users,
      submenu: [
        {
          title: "下级列表",
          icon: Users,
          url: "/merchant/subordinates",
        },
      ],
    },
    {
      title: "财务管理",
      icon: Wallet,
      submenu: [
        {
          title: "收支明细",
          icon: Wallet,
          url: "/merchant/transactions",
        },
        {
          title: "提现管理",
          icon: Wallet,
          url: "/merchant/withdrawals",
        },
      ],
    },
    {
      title: "个人资料",
      icon: UserCircle,
      url: "/merchant/profile",
    },
  ];

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    const isOpen = openMenus.includes(item.title);

    if (item.submenu) {
      return (
        <div key={item.title}>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => toggleMenu(item.title)}
              className="w-full"
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.title}</span>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
          {isOpen && (
            <div className="ml-4 border-l border-gray-200">
              {item.submenu.map((subitem) => (
                <SidebarMenuItem key={subitem.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(subitem.url!)}
                    className={cn("w-full pl-4")}
                  >
                    <subitem.icon className="h-4 w-4" />
                    <span>{subitem.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          onClick={() => item.url && navigate(item.url)}
          className="w-full"
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#001529]">
        <Sidebar className="bg-[#001529] text-white border-r-0">
          <SidebarHeader className="border-b border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/lovable-uploads/15201ab3-e961-4298-8525-ebd51fcbefc5.png" />
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-white">商户名称</div>
                <div className="text-xs text-gray-400">商户账号</div>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {menuItems.map((item) => renderMenuItem(item))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-gray-700">
            <SidebarMenuButton
              onClick={() => navigate("/login")}
              className="w-full text-white"
            >
              <LogOut className="h-4 w-4" />
              <span>退出登录</span>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 bg-gray-100">{children}</div>
      </div>
    </SidebarProvider>
  );
};

export default MerchantLayout;
