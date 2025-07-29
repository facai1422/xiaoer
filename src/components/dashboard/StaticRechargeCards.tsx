import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// 充值卡片类型
interface RechargeCard {
  title: string;
  discount: string;
  image: string;
  route: string;
  is_active: boolean;
  quick_amounts?: number[];
}

interface StaticRechargeCardsProps {
  cards: RechargeCard[];
}

const StaticRechargeCards: React.FC<StaticRechargeCardsProps> = ({ cards }) => {
  const navigate = useNavigate();

  if (!cards || cards.length === 0) {
    return null;
  }

  const cardData = [
    {
      title: "话费充值",
      subtitle: "无骚扰",
      mainText: "话费充值",
      discount: "85折",
      description: "无骚扰话费充值高折扣，秒冲",
      route: "/mobile-recharge"
    },
    {
      title: "电费充值", 
      subtitle: "快速到账",
      mainText: "电费充值",
      discount: "75折",
      description: "电费充值快速到账，支持全国",
      route: "/electric-recharge"
    }
  ];

  return (
    <div className="px-4 pt-6 pb-6">
      <h2 
        className="text-lg font-medium mb-4" 
        style={{ color: '#1f2937 !important' }}
      >
        快速充值
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {cardData.map((card, index) => (
          <div 
            key={index} 
            className="card-container cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => navigate(card.route)}
            style={{ 
              // 使用CSS变量覆盖可能的全局样式
              '--text-color': '#ffffff',
              '--text-dark': '#838383',
              '--text-light': '#bab9b9'
            } as React.CSSProperties}
          >
            {/* 渐变边框容器 */}
            <div 
              className="w-full p-1 rounded-[32px] flex flex-col"
              style={{
                background: 'linear-gradient(135deg, #975af4, #2f7cf8, #78aafa, #934cff)',
                color: '#ffffff'
              }}
            >
              {/* 顶部标题卡片 */}
              <div 
                className="flex items-center justify-between px-[18px] py-4" 
                style={{ color: '#ffffff' }}
              >
                <p 
                  className="text-sm font-semibold italic recharge-card-title" 
                  style={{ 
                    color: '#ffffff !important',
                    textShadow: '2px 2px 6px #2975ee',
                    fontWeight: '600'
                  }}
                >
                  {card.title}
                </p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  style={{ color: '#ffffff', fill: '#ffffff' }}
                >
                  <path
                    fill="currentColor"
                    d="M10.277 16.515c.005-.11.187-.154.24-.058c.254.45.686 1.111 1.177 1.412c.49.3 1.275.386 1.791.408c.11.005.154.186.058.24c-.45.254-1.111.686-1.412 1.176s-.386 1.276-.408 1.792c-.005.11-.187.153-.24.057c-.254-.45-.686-1.11-1.176-1.411s-1.276-.386-1.792-.408c-.11-.005-.153-.187-.057-.24c.45-.254 1.11-.686 1.411-1.177c.301-.49.386-1.276.408-1.791m8.215-1c-.008-.11-.2-.156-.257-.062c-.172.283-.421.623-.697.793s-.693.236-1.023.262c-.11.008-.155.2-.062.257c.283.172.624.42.793.697s.237.693.262 1.023c.009.11.2.155.258.061c.172-.282.42-.623.697-.792s.692-.237 1.022-.262c.11-.009.156-.2.062-.258c-.283-.172-.624-.42-.793-.697s-.236-.692-.262-1.022M14.704 4.002l-.242-.306c-.937-1.183-1.405-1.775-1.95-1.688c-.545.088-.806.796-1.327 2.213l-.134.366c-.149.403-.223.604-.364.752c-.143.148-.336.225-.724.38l-.353.141l-.248.1c-1.2.48-1.804.753-1.881 1.283c-.082.565.49 1.049 1.634 2.016l.296.25c.325.275.488.413.58.6c.094.187.107.403.134.835l.024.393c.093 1.52.14 2.28.634 2.542s1.108-.147 2.336-.966l.318-.212c.35-.233.524-.35.723-.381c.2-.032.402.024.806.136l.368.102c1.422.394 2.133.591 2.52.188c.388-.403.196-1.14-.19-2.613l-.099-.381c-.11-.419-.164-.628-.134-.835s.142-.389.365-.752l.203-.33c.786-1.276 1.179-1.914.924-2.426c-.254-.51-.987-.557-2.454-.648l-.379-.024c-.417-.026-.625-.039-.806-.135c-.18-.096-.314-.264-.58-.6m-5.869 9.324C6.698 14.37 4.919 16.024 4.248 18c-.752-4.707.292-7.747 1.965-9.637c.144.295.332.539.5.73c.35.396.852.82 1.362 1.251l.367.31l.17.145c.005.064.01.14.015.237l.03.485c.04.655.08 1.294.178 1.805"
                  />
                </svg>
              </div>

              {/* 主要内容区域 */}
              <div 
                className="w-full h-full rounded-[30px] text-xs p-[18px] flex flex-col gap-[14px] recharge-card-content"
                style={{ 
                  backgroundColor: '#161a20 !important',
                  color: '#838383 !important'
                }}
              >
                {/* 副标题 */}
                <p 
                  className="font-semibold recharge-card-subtitle" 
                  style={{ 
                    color: '#bab9b9 !important',
                    fontWeight: '600'
                  }}
                >
                  {card.subtitle}
                </p>
                
                {/* 主要文字和折扣 */}
                <div className="flex items-baseline justify-between">
                  <span 
                    className="text-3xl font-normal recharge-card-main" 
                    style={{ 
                      color: '#ffffff !important',
                      fontSize: '1.875rem',
                      fontWeight: '400'
                    }}
                  >
                    {card.mainText}
                  </span>
                  <span 
                    className="text-sm recharge-card-discount" 
                    style={{ 
                      color: '#838383 !important',
                      fontSize: '0.875rem'
                    }}
                  >
                    {card.discount}
                  </span>
                </div>
                
                {/* 描述文字 */}
                <p 
                  className="text-xs leading-relaxed recharge-card-desc" 
                  style={{ 
                    color: '#838383 !important',
                    fontSize: '0.75rem',
                    lineHeight: '1.625'
                  }}
                >
                  {card.description}
                </p>
                
                {/* 按钮 */}
                <button 
                  className="p-2 border-none w-full rounded-lg text-xs transition-all duration-300 ease-in-out cursor-pointer shadow-inner hover:scale-105 hover:shadow-[0_0_8px_#fff] active:scale-100 recharge-card-button"
                  style={{ 
                    background: 'linear-gradient(to right, #975af4, #2f7cf8, #78aafa, #934cff) !important',
                    color: '#ffffff !important',
                    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.6)',
                    fontSize: '0.75rem',
                    padding: '0.5rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '500'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(card.route);
                  }}
                >
                  立即充值
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaticRechargeCards; 