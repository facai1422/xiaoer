import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const RechargeCards = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [userBalance, setUserBalance] = useState<number | null>(null);

  useEffect(() => {
    // 获取用户余额
    const fetchUserBalance = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('balance')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (!error && data) {
            setUserBalance(data.balance);
          }
        }
      } catch (error) {
        console.error("Error fetching user balance:", error);
      }
    };
    
    fetchUserBalance();
  }, []);

  const cards = [
    {
      title: "普通话费充值",
      discount: "85折充值",
      image: "/lovable-uploads/IMG_2938.PNG",
      route: "/mobile-recharge"
    },
    {
      title: "高折扣话费",
      discount: "75折充值",
      image: "/lovable-uploads/IMG_2945.PNG",
      route: "/mobile-recharge"
    },
    {
      title: "南网电费充值",
      discount: "80折充值",
      image: "/lovable-uploads/IMG_2943.PNG",
      route: "/utilities"
    },
    {
      title: "网易游戏",
      discount: "85折充值",
      image: "/lovable-uploads/IMG_2941.PNG",
      route: "/netease-game"
    }
  ];

  const totalPages = Math.ceil(cards.length / 2);

  const handleCardClick = async (route: string, title: string) => {
    try {
      // 直接跳转，让目标页面处理用户验证
    navigate(route, { state: { serviceTitle: title } });
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error("页面跳转失败");
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // 向左滑动
        setCurrentPage(prev => (prev + 1) % totalPages);
      } else {
        // 向右滑动
        setCurrentPage(prev => (prev - 1 + totalPages) % totalPages);
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleDotClick = (index: number) => {
    setCurrentPage(index);
  };

  return (
    <div className="px-4 pt-4 pb-2">
      <h2 className="text-lg font-medium mb-3">缴费充值</h2>
      <div className="w-full">
        <div 
          className="relative overflow-hidden"
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex transition-transform duration-300 ease-in-out will-change-transform"
            style={{ transform: `translateX(-${currentPage * 100}%)` }}
          >
            {cards.map((card, index) => (
              <div key={index} className="min-w-[50%] px-1.5 flex-shrink-0">
                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden aspect-square rounded-[2.5rem]">
                  <img 
                    src={card.image} 
                    alt={card.title} 
                    className="absolute inset-0 w-full h-full object-cover rounded-[2.5rem]" 
                  />
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                    <Button 
                      className="bg-[#6366f1] hover:bg-[#4f46e5] px-10 py-1 rounded-full text-sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(card.route, card.title);
                      }}
                    >
                      充值
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
        
        {/* 分页指示点 */}
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              title={`跳转到第${index + 1}页`}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentPage === index ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
