import { useState, useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

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
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 暂时使用默认数据，后续完善数据库查询
    setDefaultAnnouncements();
    
    // 设置自动轮播
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        if (announcements.length === 0) return 0;
        return (prev + 1) % announcements.length;
      });
    }, 8000); // 每8秒切换一次

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [announcements.length]);

  const setDefaultAnnouncements = () => {
    const defaultAnnouncements: Announcement[] = [
      {
        id: 1,
        title: "欢迎使用惠享生活平台",
        content: "我们提供便捷的充值缴费服务，享受优惠折扣！",
        type: "info",
        is_active: true,
        is_scrolling: true,
        scroll_speed: 50,
        display_order: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: "新用户福利",
        content: "新注册用户首次充值享受额外95折优惠！",
        type: "success",
        is_active: true,
        is_scrolling: true,
        scroll_speed: 50,
        display_order: 2,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        title: "客服服务时间",
        content: "在线客服服务时间：9:00-21:00，如有问题请及时联系",
        type: "info",
        is_active: true,
        is_scrolling: true,
        scroll_speed: 50,
        display_order: 3,
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        title: "系统升级通知",
        content: "为了提供更好的服务，系统将在每日凌晨2-4点进行维护",
        type: "warning",
        is_active: true,
        is_scrolling: true,
        scroll_speed: 50,
        display_order: 4,
        created_at: new Date().toISOString()
      }
    ];
    setAnnouncements(defaultAnnouncements);
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
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

  if (announcements.length === 0) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className="mx-4 mb-4">
      <div className={`border rounded-lg p-3 transition-all duration-500 ease-in-out ${getAnnouncementStyle(currentAnnouncement.type)}`}>
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            {getAnnouncementIcon(currentAnnouncement.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="overflow-hidden whitespace-nowrap">
              <div 
                className="inline-block text-sm font-medium animate-marquee"
                style={{
                  animationDuration: currentAnnouncement.is_scrolling 
                    ? `${Math.max(10, currentAnnouncement.content.length * 0.2)}s` 
                    : '0s'
                }}
              >
                <span className="font-semibold">{currentAnnouncement.title}：</span>
                {currentAnnouncement.content}
              </div>
            </div>
          </div>

          {/* 分页指示器 */}
          {announcements.length > 1 && (
            <div className="flex space-x-1">
              {announcements.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${index === currentIndex ? 'bg-current' : 'bg-current opacity-30'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 