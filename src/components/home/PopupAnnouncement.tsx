import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { shouldShowPopup, markPopupAsShown, setNoRemindToday as setNoRemindTodayStorage } from "./PopupAnnouncementUtils";

interface PopupAnnouncementData {
  id: number;
  title: string;
  content: string;
  popup_title?: string;
  popup_image_url?: string;
  popup_text_content?: string;
  show_today_no_remind?: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
  updated_at: string; // 新增：公告更新时间
}

interface PopupAnnouncementProps {
  onClose?: () => void;
}

export const PopupAnnouncement: React.FC<PopupAnnouncementProps> = ({ onClose }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<PopupAnnouncementData | null>(null);
  const [noRemindToday, setNoRemindToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // 检查当前路径，只在用户端页面显示弹窗
    const isAdminPage = location.pathname.startsWith('/admin');
    const isMerchantPage = location.pathname.startsWith('/merchant');
    const isLoginPage = location.pathname === '/login';
    const isRegisterPage = location.pathname === '/register';
    const isAgentPage = location.pathname.startsWith('/agent');
    
    // 排除的页面：管理后台、商户后台、代理页面、登录页、注册页
    const shouldExclude = isAdminPage || isMerchantPage || isAgentPage || isLoginPage || isRegisterPage;
    
    if (shouldExclude) {
      setIsLoading(false);
      setShouldRender(false);
      return;
    }
    
    setShouldRender(true);
    checkAndShowPopup();
  }, [location.pathname]);

  const checkAndShowPopup = async () => {
    try {
      setIsLoading(true);
      
      // 获取弹窗公告数据
      const popupData = await fetchPopupAnnouncement();
      if (!popupData) {
        setIsLoading(false);
        return;
      }

      // 使用新的逻辑检查是否应该显示弹窗
      const shouldShow = shouldShowPopup(popupData.updated_at);
      if (!shouldShow) {
        setIsLoading(false);
        return;
      }

      setAnnouncement(popupData);
      
      // 延迟1秒显示弹窗
      setTimeout(() => {
        setIsOpen(true);
        // 记录弹窗已显示，包含公告更新时间
        markPopupAsShown(popupData.updated_at);
        recordPopupShown(popupData.id);
      }, 1000);
    } catch (error) {
      console.error('获取弹窗公告失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPopupAnnouncement = async (): Promise<PopupAnnouncementData | null> => {
    try {
      // TODO: 这里应该从数据库获取真实的公告数据
      // const { data } = await supabase
      //   .from('website_announcements')
      //   .select('*')
      //   .eq('is_popup', true)
      //   .eq('is_active', true)
      //   .order('display_order', { ascending: true })
      //   .limit(1)
      //   .single();

      // 使用固定的公告数据，避免每次都更新时间
      const defaultPopup: PopupAnnouncementData = {
        id: 1,
              title: "欢迎来到惠享生活",
      content: "感谢您访问惠享生活平台！我们为您提供便捷的充值缴费服务，享受超值优惠折扣。",
      popup_title: "🎉 欢迎来到惠享生活平台",
        popup_image_url: "/lovable-uploads/gonggao.png",
        popup_text_content: "感谢您访问惠享生活平台！\n我们为您提供便捷的充值缴费服务\n享受超值优惠折扣\n新用户首次充值可享受额外优惠\n快来体验吧！",
        show_today_no_remind: true,
        type: "success",
        updated_at: "2024-12-22T00:00:00.000Z" // 使用固定时间，避免重复显示
      };
      
      return defaultPopup;
    } catch (error) {
      console.error('获取弹窗公告失败:', error);
      return null;
    }
  };

  const recordPopupShown = async (announcementId: number) => {
    try {
      const sessionId = getSessionId();
      
      // 这里可以记录到数据库
      console.log('弹窗显示记录:', { 
        announcementId, 
        sessionId, 
        timestamp: new Date().toISOString() 
      });
      
      // TODO: 记录到数据库
      // await supabase
      //   .from('user_popup_history')
      //   .insert({
      //     announcement_id: announcementId,
      //     session_id: sessionId,
      //     shown_at: new Date().toISOString()
      //   });
    } catch (error) {
      console.error('记录弹窗显示失败:', error);
    }
  };

  const getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('popup_session_id');
    if (!sessionId) {
      sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('popup_session_id', sessionId);
    }
    return sessionId;
  };

  const handleClose = () => {
    // 如果用户选择了今日不再提示，设置相应的存储
    if (noRemindToday) {
      setNoRemindTodayStorage(true);
    }
    
    setIsOpen(false);
    onClose?.();
  };

  // 如果不应该渲染（在排除的页面中），直接返回null
  if (!shouldRender || isLoading || !announcement) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md mx-auto p-0 overflow-hidden border-0 shadow-2xl bg-transparent">
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white transition-all duration-200 shadow-lg group"
          title="关闭公告"
        >
          <X className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
        </button>

        {/* 公告图片容器 */}
        <div className="relative">
          {/* 背景图片 */}
          <img 
            src={announcement.popup_image_url || "/lovable-uploads/gonggao.png"} 
            alt="公告图片"
            className="w-full h-auto max-w-full"
          />
          
          {/* 文字内容叠加层 - 定位在图片的白色区域 */}
          {announcement.popup_text_content && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-4 py-6 max-w-[320px] mt-8">
                <div className="text-gray-800 text-base leading-relaxed font-medium whitespace-pre-line drop-shadow-sm">
                  {announcement.popup_text_content}
                </div>
              </div>
            </div>
          )}

          {/* 今日不再提示选项 - 定位在图片底部 */}
          {announcement.show_today_no_remind && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-white/90 px-3 py-2 rounded-full shadow-sm">
              <Checkbox
                id="no-remind-today"
                checked={noRemindToday}
                onCheckedChange={(checked) => setNoRemindToday(checked === true)}
                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <label 
                htmlFor="no-remind-today" 
                className="text-xs text-gray-700 cursor-pointer select-none"
              >
                今日不再提示
              </label>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 