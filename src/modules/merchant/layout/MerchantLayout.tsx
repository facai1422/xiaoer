
import { ReactNode, useState } from "react";
import {
  Sidebar,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Sidebar as MerchantSidebar } from "../components/Sidebar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MerchantLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  showNotification?: boolean;
}

export const MerchantLayout = ({ 
  children, 
  title = "商户中心", 
  showBack = true, 
  showNotification = true 
}: MerchantLayoutProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#001529]">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar className="bg-[#001529] text-white border-r-0">
            <MerchantSidebar />
          </Sidebar>
        </div>
        
        <div className="flex-1 bg-gray-100">
          {/* Mobile Header */}
          {isMobile && (
            <div className="sticky top-0 left-0 z-10 w-full bg-white shadow-sm p-3 flex items-center">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 bg-[#001529] text-white border-r-0">
                  <Sidebar className="h-full bg-[#001529] text-white border-r-0">
                    <MerchantSidebar />
                  </Sidebar>
                </SheetContent>
              </Sheet>
              <div className="flex-1 flex items-center justify-center">
                {showBack && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute left-12"
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <h1 className="text-base font-medium">{title}</h1>
              </div>
            </div>
          )}
          
          {/* Desktop Header */}
          {!isMobile && (
            <div className="bg-white p-4 flex items-center shadow-sm">
              {showBack && (
                <Button 
                  variant="ghost" 
                  className="p-0 mr-2"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              )}
              <h1 className="text-lg font-semibold flex-1 text-center">{title}</h1>
              {showNotification && (
                <Button variant="ghost" size="icon" className="opacity-0">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              )}
            </div>
          )}
          
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

// Add both default and named exports to fix import errors
export default MerchantLayout;
