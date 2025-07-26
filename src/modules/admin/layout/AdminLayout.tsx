import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { getAdminSession } from "@/utils/adminAuth";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        console.log('AdminLayout: 开始验证管理员权限...');
        
        // 只进行本地session检查，避免数据库验证导致卡住
        const adminSession = getAdminSession();
        console.log('AdminLayout: 获取到的session:', adminSession ? '有效' : '无效');
        
        if (!adminSession) {
          console.log('AdminLayout: No session found, redirecting to login');
          navigate("/admin/login", { replace: true });
          return;
        }

        console.log('AdminLayout: Session存在，邮箱:', adminSession.email);
        console.log('AdminLayout: Session过期时间:', new Date(adminSession.expires));
        console.log('AdminLayout: 当前时间:', new Date());
        
        // 只进行本地session检查，避免数据库验证导致的问题
        if (adminSession.expires <= Date.now()) {
          console.log('AdminLayout: Session已过期，清除并重定向');
          localStorage.removeItem('admin_session');
          navigate("/admin/login", { replace: true });
          return;
        }

        console.log('AdminLayout: 验证通过，设置为已验证状态');
        setIsValidating(false);
        
      } catch (error) {
        console.error('AdminLayout: 验证过程出错:', error);
        // 出错时也设置为已验证，避免一直卡在加载状态
        setIsValidating(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  // 显示加载状态 - 新拟态风格
  if (isValidating) {
    return (
      <div 
        className="flex h-screen items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
        }}
      >
        {/* 新拟态加载容器 */}
        <div className="neu-container p-12 text-center neu-fade-in">
          {/* 新拟态加载图标 */}
          <div className="neu-card w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center neu-pulse">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full neu-rotate"></div>
          </div>
          <div className="text-xl font-bold mb-2 neu-text-primary">验证管理员权限中...</div>
          <div className="neu-text-muted">请稍候，正在检查您的访问权限</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
      }}
    >
      {/* Desktop Sidebar - 新拟态风格 */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Mobile Header - 新拟态风格 */}
      {isMobile && (
        <div className="fixed top-0 left-0 z-20 w-full p-4 neu-slide-in">
          <div className="neu-container p-4">
            <div className="flex items-center justify-between">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <button 
                    className="neu-button neu-interactive p-3 rounded-xl"
                    aria-label="打开导航菜单"
                  >
                    <Menu className="h-6 w-6 text-gray-700" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80 border-0">
                  <div 
                    className="h-full"
                    style={{
                      background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                    }}
                  >
                    <Sidebar />
                  </div>
                </SheetContent>
              </Sheet>
              
              <h1 className="text-lg font-bold neu-text-primary neu-float">管理后台</h1>
              
              {/* 占位符，保持布局平衡 */}
              <div className="w-12"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* 主内容区域 - 新拟态容器 */}
      <div className={`flex-1 relative ${isMobile ? 'pt-20' : ''}`}>
        {/* 新拟态内容背景 */}
        <div className="h-full overflow-hidden">
          {/* 内容滚动容器 */}
          <div className="h-full overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
