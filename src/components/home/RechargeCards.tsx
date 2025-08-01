import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface RechargeCard {
  id: number;
  title: string;
  discount: string;
  discount_rate: number;
  exchange_rate: number;
  image_url: string;
  route: string;
  is_active: boolean;
  display_order: number;
}

export const RechargeCards = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [cards, setCards] = useState<RechargeCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 获取用户余额和充值卡片数据
    const fetchData = async () => {
      try {
        // 获取用户余额
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

        // 获取充值卡片数据
        const { data: cardsData, error: cardsError } = await supabase
          .from('homepage_recharge_cards')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (cardsError) {
          console.error('获取充值卡片失败:', cardsError);
          // 如果数据库查询失败，使用默认数据
          setDefaultCards();
        } else if (cardsData && cardsData.length > 0) {
          setCards(cardsData);
        } else {
          // 如果没有数据，使用默认数据
          setDefaultCards();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setDefaultCards();
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const setDefaultCards = () => {
    const defaultCards: RechargeCard[] = [
      {
        id: 1,
        title: "普通话费充值",
        discount: "85折充值",
        discount_rate: 0.85,
        exchange_rate: 7.2,
        image_url: "/lovable-uploads/IMG_2938.PNG",
        route: "/mobile-recharge",
        is_active: true,
        display_order: 1
      },
      {
        id: 2,
        title: "高折扣话费",
        discount: "75折充值",
        discount_rate: 0.75,
        exchange_rate: 7.2,
        image_url: "/lovable-uploads/IMG_2945.PNG",
        route: "/mobile-recharge",
        is_active: true,
        display_order: 2
      },
      {
        id: 3,
        title: "南网电费充值",
        discount: "80折充值",
        discount_rate: 0.8,
        exchange_rate: 7.2,
        image_url: "/lovable-uploads/IMG_2943.PNG",
        route: "/utilities",
        is_active: true,
        display_order: 3
      },
      {
        id: 4,
        title: "网易游戏",
        discount: "85折充值",
        discount_rate: 0.85,
        exchange_rate: 7.2,
        image_url: "/lovable-uploads/IMG_2941.PNG",
        route: "/netease-game",
        is_active: true,
        display_order: 4
      }
    ];
    setCards(defaultCards);
  };

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

  if (isLoading) {
    return (
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-medium mb-3">缴费充值</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-500">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 pt-4 pb-2">
      <h2 className="text-base sm:text-lg font-medium mb-3">缴费充值</h2>
      <div className="w-full">
        <div 
          className="relative overflow-hidden rounded-lg"
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
              <div key={card.id} className="min-w-[50%] px-2 flex-shrink-0">
                <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden rounded-[2rem] h-[180px] sm:h-[200px] md:aspect-square">
                  <img 
                    src={card.image_url} 
                    alt={card.title} 
                    className="absolute inset-0 w-full h-full object-cover rounded-[2rem]" 
                  />
                  {/* 渐变遮罩，确保文字可读性 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-[2rem]"></div>
                  
                  {/* 卡片标题 */}
                  <div className="absolute top-3 left-3 right-3">
                    <h3 className="text-white font-medium text-sm sm:text-base drop-shadow-lg">
                      {card.title}
                    </h3>
                  </div>
                  
                  {/* 折扣信息 */}
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                    {card.discount}
                  </div>
                  
                  {/* 充值按钮 */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full px-3">
                    <Button 
                      className="bg-[#6366f1] hover:bg-[#4f46e5] rounded-full text-sm w-full py-2 shadow-lg" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(card.route, card.title);
                      }}
                    >
                      立即充值
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
        
        {/* 分页指示点 */}
        {totalPages > 1 && (
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
        )}
      </div>
    </div>
  );
};
