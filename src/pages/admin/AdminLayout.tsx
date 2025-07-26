
import { Outlet } from "react-router-dom";
import { SidebarHeader } from "@/components/admin/menu/SidebarHeader";
import { SidebarFooter } from "@/components/admin/menu/SidebarFooter";
import { SidebarMenuItem } from "@/components/admin/menu/SidebarMenuItem";
import { menuItems } from "./menu/menuItems";

export interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
            <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
              <SidebarHeader />
              
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {menuItems.map((item, index) => (
                  <SidebarMenuItem key={index} item={item} isOpen={false} onToggle={() => {}} />
                ))}
              </nav>

              <SidebarFooter />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden">
          {/* Mobile top nav */}
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
