import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_active: boolean;
  is_scrolling: boolean;
  scroll_speed: number;
  display_order: number;
  start_time?: string;
  end_time?: string;
  created_at: string;
}

export const WebsiteAnnouncements = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      
      // 直接使用 PostgreSQL 查询
      const { data, error } = await supabase
        .from('website_announcements' as any)
        .select('*')
        .eq('is_active', true)
        .eq('is_scrolling', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('获取公告失败:', error);
        // 如果数据库查询失败，使用默认公告
        setDefaultAnnouncement();
        return;
      }

      if (data && data.length > 0) {
        const announcementData = data[0] as any;
        const announcement: Announcement = {
          id: announcementData.id,
          title: announcementData.title,
          content: announcementData.content,
          type: announcementData.type,
          is_active: announcementData.is_active,
          is_scrolling: announcementData.is_scrolling,
          scroll_speed: announcementData.scroll_speed || 50,
          display_order: announcementData.display_order,
          start_time: announcementData.start_time,
          end_time: announcementData.end_time,
          created_at: announcementData.created_at
        };
        setAnnouncement(announcement);
      } else {
        // 如果没有数据，使用默认公告
        setDefaultAnnouncement();
      }
    } catch (error) {
      console.error('获取公告异常:', error);
      setDefaultAnnouncement();
    } finally {
      setLoading(false);
    }
  };

  const setDefaultAnnouncement = () => {
    const defaultAnnouncement: Announcement = {
      id: 1,
      title: "欢迎使用惠享生活平台",
      content: "我们提供便捷的充值缴费服务，享受优惠折扣！信用卡代还，花呗代还，游戏充值，话费充值，电费充值，各种网贷代还，各种贷款代还",
      type: "info",
      is_active: true,
      is_scrolling: true,
      scroll_speed: 50,
      display_order: 1,
      created_at: new Date().toISOString()
    };
    setAnnouncement(defaultAnnouncement);
  };

  const getAnnouncementIcon = (type: string) => {
    // 统一使用GIF图标
    return (
      <img 
        src="/lovable-uploads/icons8.gif" 
        alt="通知图标" 
        className="w-4 h-4 object-contain"
      />
    );
  };

  const getAnnouncementStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  // 加载中状态
  if (loading) {
    return (
      <div className="mx-4 mb-4">
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 没有公告时不显示
  if (!announcement) {
    return null;
  }

  return (
    <div className="mx-4 mb-4">
      <div className={`border rounded-lg p-3 transition-all duration-500 ease-in-out ${getAnnouncementStyle(announcement.type)}`}>
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            {getAnnouncementIcon(announcement.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="overflow-hidden whitespace-nowrap">
              {/* eslint-disable-next-line react/forbid-dom-props */}
              <div 
                className="inline-block text-sm font-medium animate-marquee"
                style={{
                  animationDuration: announcement.is_scrolling 
                    ? `${Math.max(10, announcement.content.length * 0.2)}s` 
                    : '0s'
                }}
              >
                <span className="font-semibold">{announcement.title}：</span>
                {announcement.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 