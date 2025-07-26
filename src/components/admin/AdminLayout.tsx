import { ReactNode, useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarMenuItem } from "./menu/SidebarMenuItem";
import { SidebarHeader } from "./menu/SidebarHeader";
import { SidebarFooter } from "./menu/SidebarFooter";
import { menuItems } from "./menu/menuItems";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AdminLayoutProps {
  children?: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (!session) {
          console.log("No session found, redirecting to login");
          navigate("/admin/login", { replace: true });
          return;
        }

        // 临时解决方案：允许所有已登录用户访问管理后台
        // TODO: 实施完整的管理员权限系统后移除此临时方案
        console.log("当前登录用户:", session.user.email);
        console.log("临时方案：允许所有已登录用户访问管理后台");
        
        // 记录用户访问（可选）
        if (session.user.email) {
          console.log("管理后台访问记录 - 用户:", session.user.email, "时间:", new Date().toISOString());
        }
        
        // 显示临时访问提示
        toast.success(`欢迎访问管理后台，${session.user.email}`);
        
        setIsLoading(false);
        return;
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast.error("验证管理员权限时出错");
        navigate("/admin/login", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setSession(session);
        if (event === 'SIGNED_OUT') {
          console.log("用户已退出登录，跳转到登录页");
          // 清除本地管理员session（如果还存在的话）
          try {
            const adminSession = localStorage.getItem('admin_session');
            if (adminSession) {
              localStorage.removeItem('admin_session');
              console.log("已清除本地管理员session");
            }
          } catch (error) {
            console.error("清除本地session失败:", error);
          }
          navigate("/admin/login", { replace: true });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full bg-gray-100">
        <Sidebar 
          variant={isMobile ? "floating" : "sidebar"} 
          className="w-64 border-r bg-white shadow-sm"
        >
          <SidebarHeader />
          <SidebarContent>
            <SidebarGroup className="p-2">
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    item={item}
                    isOpen={true}
                    onToggle={() => {}}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter />
        </Sidebar>
        <main className="flex-1">
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <SidebarTrigger className="h-8 w-8 items-center justify-center rounded-md border bg-white shadow-sm md:hidden" />
              </div>
            </div>
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
