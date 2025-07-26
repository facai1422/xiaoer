
import { Header } from "@/components/home/Header";
import BottomNav from "@/components/BottomNav";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      {children}
      <BottomNav />
    </div>
  );
};
