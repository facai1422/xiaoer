import { useNavigate } from "react-router-dom";
import { LogOut, Settings, HelpCircle } from "lucide-react";
import { clearAdminSession } from "@/utils/adminAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SidebarFooter = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // 先清除Supabase认证状态
      await supabase.auth.signOut();
      // 再清除本地管理员session
      clearAdminSession();
      toast.success("已退出登录");
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("退出登录失败:", error);
      // 即使Supabase退出失败，也要清除本地session
      clearAdminSession();
      toast.error("退出登录时出现错误，但已强制退出");
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <div className="space-y-3 neu-fade-in">
      {/* 快捷操作按钮 */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          className="neu-button neu-interactive p-3 rounded-xl flex items-center justify-center"
          aria-label="设置"
        >
          <Settings className="h-5 w-5 text-gray-600" />
        </button>
        <button 
          className="neu-button neu-interactive p-3 rounded-xl flex items-center justify-center"
          aria-label="帮助"
        >
          <HelpCircle className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      
      {/* 退出登录按钮 */}
      <button
        onClick={handleLogout}
        className="neu-button neu-danger w-full p-4 rounded-xl flex items-center justify-center space-x-3 text-red-600 font-semibold hover:text-white transition-colors duration-300"
      >
        <LogOut className="h-5 w-5" />
        <span>退出登录</span>
      </button>
      
      {/* 版本信息 */}
      <div className="text-center pt-3 border-t border-gray-200">
        <div className="text-xs neu-text-muted">
          LifePay Manager v1.0.0
        </div>
        <div className="text-xs neu-text-muted mt-1">
          © 2024 All Rights Reserved
        </div>
      </div>
    </div>
  );
};
