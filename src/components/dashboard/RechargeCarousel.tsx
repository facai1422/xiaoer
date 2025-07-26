import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
// 使用真实图标，不再需要Lucide图标
import styles from "./RechargeCarousel.module.css";

// 充值卡片类型
interface RechargeCard {
  title: string;
  discount: string;
  image: string;
  route: string;
  is_active: boolean;
  quick_amounts?: number[];
}

interface RechargeCarouselProps {
  cards: RechargeCard[];
}

// 获取服务图标
const getServiceIcon = (title: string) => {
  let imageSrc = "/lovable-uploads/IMG_2937.PNG"; // 默认图片
  
  // 根据标题选择对应的图片
  if (title.includes('普通话费') || (title.includes('话费') && !title.includes('高折扣'))) {
    imageSrc = "/lovable-uploads/IMG_2937.PNG";
  } else if (title.includes('高折扣话费')) {
    imageSrc = "/lovable-uploads/IMG_2939.PNG";
  } else if (title.includes('南网电费') || title.includes('电费')) {
    imageSrc = "/lovable-uploads/IMG_2942.PNG";
  } else if (title.includes('网易游戏') || title.includes('游戏')) {
    imageSrc = "/lovable-uploads/IMG_2940.PNG";
  }
  
  return (
    <img 
      src={imageSrc} 
      alt={title}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain'
      }}
    />
  );
};

// 获取快捷金额显示
const getQuickAmounts = (card: RechargeCard) => {
  if (card.quick_amounts && card.quick_amounts.length > 0) {
    return `¥${card.quick_amounts.slice(0, 3).join('、¥')}`;
  }
  return '¥100、¥500、¥1000';
};

const RechargeCarousel: React.FC<RechargeCarouselProps> = ({ cards }) => {
  const navigate = useNavigate();

  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <div className="px-4 pt-6 pb-10">
      <h2 className="text-lg font-medium mb-4 text-gray-800">快速充值</h2>
      <div className="relative">
        <div
          className={styles.slider}
          style={{
            '--width': '200px',
            '--height': '200px',
            '--quantity': cards.length.toString()
          } as React.CSSProperties}
        >
          <div className={styles.list}>
            {cards.map((card, index) => {
              const gradientClass = `gradient${(index % 2) + 1}`;
              return (
                <div 
                  key={index} 
                  className={styles.item} 
                  style={{ '--position': (index + 1).toString() } as React.CSSProperties}
                >
                  <div className={`${styles.card} ${styles[gradientClass]}`}>
                    <div className={styles.cardInner}>
                      <div className={styles.cardShine}></div>
                      <div className={styles.cardGlow}></div>
                      <div className={styles.cardContent}>
                        <div className={styles.cardBadge}>HOT</div>
                        <div className={styles.cardImageWrapper}>
                          <div className={styles.cardImage}>
                            {getServiceIcon(card.title)}
                          </div>
                          <p className={styles.cardTitle}>{card.title}</p>
                        </div>

                        <div className={styles.cardFooter}>
                          <div className={styles.cardPrice}>
                            {getQuickAmounts(card)}
                          </div>
                          <Button 
                            size="sm" 
                            className={styles.cardButton}
                            onClick={() => navigate(card.route)}
                          >
                            立即充值
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RechargeCarousel; 