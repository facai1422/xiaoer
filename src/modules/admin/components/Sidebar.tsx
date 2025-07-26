import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarHeader } from "@/components/admin/menu/SidebarHeader";
import { SidebarFooter } from "@/components/admin/menu/SidebarFooter";
import { menuItems } from "@/pages/admin/menu/menuItems";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isActiveLink = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="flex flex-col w-80 h-screen neu-sidebar neu-slide-in">
      {/* 新拟态背景容器 */}
      <div className="flex flex-col h-full relative overflow-hidden">
        {/* 内容容器 */}
        <div className="relative z-10 flex flex-col flex-grow overflow-y-auto">
          {/* 新拟态头部容器 */}
          <div className="p-6 neu-fade-in">
            <div className="neu-container p-4 neu-glow">
              <SidebarHeader />
            </div>
          </div>
          
          {/* 新拟态导航容器 */}
          <nav className="flex-1 px-6 space-y-3 pb-6">
            {menuItems.map((item, index) => (
              <div 
                key={index}
                className="neu-slide-in"
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                {item.submenu && item.subMenuItems ? (
                  // 有子菜单的项目 - 新拟态按钮
                  <>
                    <button
                      onClick={() => toggleMenu(item.title)}
                      className={cn(
                        "neu-nav-item flex w-full items-center px-6 py-4 text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                        openMenus[item.title] 
                          ? "text-blue-700 neu-primary" 
                          : "text-gray-700 hover:text-blue-600"
                      )}
                    >
                      {/* 新拟态图标容器 */}
                      {item.icon && (
                        <div className="neu-card p-2 rounded-lg mr-4 neu-fade-in">
                          <item.icon className="h-5 w-5" />
                        </div>
                      )}
                      <span className="font-semibold">{item.title}</span>
                      <ChevronDown
                        className={cn(
                          "ml-auto h-5 w-5 transition-transform duration-300", 
                          openMenus[item.title] && "rotate-180"
                        )}
                      />
                    </button>
                    
                    {/* 子菜单容器 - 新拟态凹陷效果 */}
                    {openMenus[item.title] && (
                      <div className="ml-6 mt-3 neu-panel p-3 neu-fade-in">
                        <div className="space-y-2">
                          {item.subMenuItems.map((subItem, subIndex) => (
                            <Link
                              key={subItem.title}
                              to={subItem.href}
                              className={cn(
                                "neu-nav-item flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden neu-slide-in",
                                isActiveLink(subItem.href)
                                  ? "neu-primary text-blue-700 font-bold"
                                  : "text-gray-600 hover:text-blue-600"
                              )}
                              style={{ animationDelay: `${subIndex * 0.05}s` }}
                            >
                              <span className="font-medium">{subItem.title}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // 没有子菜单的项目 - 新拟态链接
                  <Link
                    to={item.href || "#"}
                    className={cn(
                      "neu-nav-item flex items-center px-6 py-4 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden",
                      isActiveLink(item.href || "#")
                        ? "neu-primary text-blue-700 font-bold neu-glow"
                        : "text-gray-700 hover:text-blue-600"
                    )}
                  >
                    {/* 新拟态图标容器 */}
                    {item.icon && (
                      <div className="neu-card p-2 rounded-lg mr-4 neu-float">
                        <item.icon className="h-5 w-5" />
                      </div>
                    )}
                    <span className="font-semibold">{item.title}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* 新拟态页脚容器 */}
          <div className="p-6 mt-auto neu-fade-in">
            <div className="neu-container p-4">
              <SidebarFooter />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 