import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BannerSection } from "@/components/dashboard/BannerSection";
import { UserCountSection } from "@/components/dashboard/UserCountSection";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StaticRechargeCards from "@/components/dashboard/StaticRechargeCards";
import { 
  CreditCard, 
  Droplet, 
  Gamepad, 
  Music, 
  ShoppingCart, 
  Phone, 
  Flame, 
  MessageSquare, 
  ChevronRight,
  Package,
  Loader2
} from "lucide-react";
import { 
  BusinessProduct, 
  Banner, 
  RechargeCard,
  getHomepageProducts,
  getHomepageBanners,
  getHomepageRechargeCards
} from "@/services/businessProductsService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [rechargeCards, setRechargeCards] = useState<RechargeCard[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      console.log('正在加载首页数据...');
      
      // 尝试从数据库获取数据
      try {
        const [productsData, bannersData, rechargeCardsData] = await Promise.all([
          getHomepageProducts().catch(() => []),
          getHomepageBanners().catch(() => []),
          getHomepageRechargeCards().catch(() => [])
        ]);
        
        // 优先使用数据库数据
        if (productsData.length > 0) {
          console.log('使用数据库产品数据:', productsData.length, '个产品');
          setProducts(productsData);
        } else {
          console.log('数据库无产品数据，使用默认数据');
          setDefaultProductsData();
        }
        
        if (bannersData.length > 0) {
          setBanners(bannersData);
          console.log('使用数据库横幅数据:', bannersData.length, '个横幅');
        } else {
          console.log('数据库无横幅数据，使用默认数据');
          setDefaultBannersData();
        }
        
        if (rechargeCardsData.length > 0) {
          setRechargeCards(rechargeCardsData);
          console.log('使用数据库充值卡数据:', rechargeCardsData.length, '个卡片');
        } else {
          console.log('数据库无充值卡数据，使用默认数据');
          setDefaultRechargeCardsData();
        }
        
      } catch (dbError) {
        console.log('数据库连接失败，使用默认数据:', dbError);
        setDefaultData();
      }

    } catch (error) {
      console.error('获取首页数据失败:', error);
      toast.error('获取首页数据失败，使用默认数据');
      
      // 降级到默认数据
      setDefaultData();
    } finally {
      setIsLoading(false);
    }
  };

  // 设置默认横幅数据
  const setDefaultBannersData = () => {
    const defaultBanners = [
      {
        id: 1,
        image: "/lovable-uploads/ce6cbed5-30d5-4e14-93f2-00062abcb167.png",
        alt: "创新携手共赢",
        link: "",
        is_active: true
      },
      {
        id: 2,
        image: "/lovable-uploads/81a79d97-e565-47d9-ad20-925851dadcc5.png",
        alt: "5G科技",
        link: "",
        is_active: true
      }
    ];
    setBanners(defaultBanners);
  };

  // 设置默认产品数据
  const setDefaultProductsData = () => {
    const defaultProducts: BusinessProduct[] = [
      {
        id: '1',
        name: '信用卡代还',
        slug: 'credit-card-repayment',
        category: '代还服务',
        description: '6.5折代还',
        logo_url: '/lovable-uploads/IMG_2873.PNG',
        logo_type: 'static' as const,
        base_rate: 0.65,
        discount_rate: 0,
        status: 'active' as const,
        is_featured: true,
        min_amount: 100,
        max_amount: 50000,
        quick_amounts: [1000, 3000, 5000, 10000],
        form_config: [],
        workflow_config: [],
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: '花呗代还',
        slug: 'huabei-repayment',
        category: '代还服务',
        description: '8折代还',
        logo_url: '/lovable-uploads/IMG_2869.PNG',
        logo_type: 'static' as const,
        base_rate: 0.8,
        discount_rate: 0,
        status: 'active' as const,
        is_featured: true,
        min_amount: 100,
        max_amount: 30000,
        quick_amounts: [500, 1000, 2000, 5000],
        form_config: [],
        workflow_config: [],
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        name: '抖币充值',
        slug: 'douyin-coin',
        category: '充值服务',
        description: '七折充值',
        logo_url: '/lovable-uploads/0e081b00-ec19-4565-a10d-46b9caf5667a.png',
        logo_type: 'static' as const,
        base_rate: 0.7,
        discount_rate: 0,
        status: 'active' as const,
        is_featured: true,
        min_amount: 10,
        max_amount: 10000,
        quick_amounts: [100, 300, 500, 1000],
        form_config: [],
        workflow_config: [],
        sort_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        name: '快币充值',
        slug: 'kuaishou-coin',
        category: '充值服务',
        description: '七折充值',
        logo_url: '/lovable-uploads/IMG_2883.PNG',
        logo_type: 'static' as const,
        base_rate: 0.7,
        discount_rate: 0,
        status: 'active' as const,
        is_featured: true,
        min_amount: 10,
        max_amount: 10000,
        quick_amounts: [100, 300, 500, 1000],
        form_config: [],
        workflow_config: [],
        sort_order: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '5',
        name: '网易游戏',
        slug: 'netease-game',
        category: '游戏充值',
        description: '8.5折充值',
        logo_url: '/lovable-uploads/IMG_2899.PNG',
        logo_type: 'static' as const,
        base_rate: 0.85,
        discount_rate: 0,
        status: 'active' as const,
        is_featured: true,
        min_amount: 10,
        max_amount: 5000,
        quick_amounts: [50, 100, 200, 500],
        form_config: [],
        workflow_config: [],
        sort_order: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '6',
        name: '石化加油卡',
        slug: 'sinopec-card',
        category: '生活服务',
        description: '暂停充值消化库存',
        logo_url: '/lovable-uploads/IMG_2903.PNG',
        logo_type: 'static' as const,
        base_rate: 0.95,
        discount_rate: 0,
        status: 'maintenance' as const,
        is_featured: false,
        min_amount: 100,
        max_amount: 5000,
        quick_amounts: [200, 500, 1000, 2000],
        form_config: [],
        workflow_config: [],
        sort_order: 6,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '7',
        name: '燃气缴费',
        slug: 'gas-fee',
        category: '生活服务',
        description: '燃气缴费',
        logo_url: '/lovable-uploads/IMG_2918.PNG',
        logo_type: 'static' as const,
        base_rate: 0.98,
        discount_rate: 0,
        status: 'active' as const,
        is_featured: false,
        min_amount: 10,
        max_amount: 2000,
        quick_amounts: [50, 100, 200, 500],
        form_config: [],
        workflow_config: [],
        sort_order: 7,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '8',
        name: '放心借',
        slug: 'fangxin-loan',
        category: '金融服务',
        description: '抖音放心借',
        logo_url: '/lovable-uploads/IMG_3061.PNG',
        logo_type: 'static' as const,
        base_rate: 1,
        discount_rate: 0,
        status: 'active' as const,
        is_featured: true,
        min_amount: 1000,
        max_amount: 50000,
        quick_amounts: [1000, 3000, 5000, 10000],
        form_config: [],
        workflow_config: [],
        sort_order: 8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '13',
        name: '京东E卡',
        slug: 'jd-ecard',
        category: '购物卡',
        description: '9.5折购买',
        logo_url: '/lovable-uploads/IMG_2912.PNG',
        logo_type: 'static' as const,
        base_rate: 0.95,
        discount_rate: 0,
        status: 'active' as const,
        is_featured: true,
        min_amount: 100,
        max_amount: 10000,
        quick_amounts: [500, 1000, 2000, 5000],
        form_config: [],
        workflow_config: [],
        sort_order: 13,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      // 新增的金融业务服务
      {
        id: '14',
        name: '滴滴金融',
        slug: 'didi-finance',
        category: '金融代还',
        description: '网贷代还服务',
        logo_url: null,
        logo_type: 'static' as const,
        base_rate: 1.0,
        discount_rate: 0,
        status: 'active' as const,
        is_featured: true,
        min_amount: 5000,
        max_amount: 50000,
        quick_amounts: [5000, 10000, 20000, 30000, 50000],
        form_config: [],
        workflow_config: [],
        sort_order: 14,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '15',
        name: '度小满代还',
        slug: 'duxiaoman-repay',
        category: '金融代还',
        description: '专业代还服务',
        logo_url: null,
        logo_type: 'static' as const,
        base_rate: 1.0,
        discount_rate: 0,
        status: 'active' as const,
        is_featured: true,
        min_amount: 5000,
        max_amount: 50000,
        quick_amounts: [5000, 10000, 20000, 30000, 50000],
        form_config: [],
        workflow_config: [],
        sort_order: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '16',
        name: '分期乐',
        slug: 'fenqile',
        category: '金融代还',
        description: '支持分期乐、好分期',
        logo_url: null,
        logo_type: 'static' as const,
        base_rate: 1.0,
        discount_rate: 0,
        status: 'active' as const,
        is_featured: true,
        min_amount: 5000,
        max_amount: 50000,
        quick_amounts: [5000, 10000, 20000, 30000, 50000],
        form_config: [],
        workflow_config: [],
        sort_order: 16,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '17',
        name: '安逸花',
        slug: 'anyihua',
        category: '金融代还',
        description: '安全快捷代还',
        logo_url: null,
        logo_type: 'static' as const,
        base_rate: 1.0,
        discount_rate: 0,
        status: 'active' as const,
        is_featured: true,
        min_amount: 5000,
        max_amount: 50000,
        quick_amounts: [5000, 10000, 20000, 30000, 50000],
        form_config: [],
        workflow_config: [],
        sort_order: 17,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    setProducts(defaultProducts);
  };

  // 设置默认充值卡片数据
  const setDefaultRechargeCardsData = () => {
    const defaultRechargeCards: RechargeCard[] = [
      {
        title: "话费充值",
        discount: "85折充值",
        image: "/lovable-uploads/8e869de8-5d9c-4962-ab54-b568d60b0295.png",
        route: "/mobile-recharge",
        is_active: true
      },
      {
        title: "电费充值",
        discount: "95折代缴",
        image: "/lovable-uploads/e081f13f-646d-4fd9-8c8c-276498ba1ea7.png",
        route: "/electric-recharge",
        is_active: true
      }
    ];
    setRechargeCards(defaultRechargeCards);
  };

  // 设置默认数据作为降级方案
  const setDefaultData = () => {
    setDefaultBannersData();
    setDefaultProductsData();
    setDefaultRechargeCardsData();
  };

  // 获取服务图标
  const getServiceIcon = (product: BusinessProduct) => {
    // 真实图标映射
    const iconMap: { [key: string]: string } = {
      '信用卡': '/lovable-uploads/IMG_2873.PNG',
      '花呗': '/lovable-uploads/IMG_2869.PNG',
      '话费': '/lovable-uploads/IMG_2915.PNG',
      '抖音': '/lovable-uploads/0e081b00-ec19-4565-a10d-46b9caf5667a.png',
      '快手': '/lovable-uploads/IMG_2883.PNG',
      '游戏': '/lovable-uploads/IMG_2899.PNG',
      '国网': '/lovable-uploads/IMG_2920.PNG',
      '南网': '/lovable-uploads/IMG_2920.PNG',
      '放心借': '/lovable-uploads/IMG_3061.PNG',
      '燃气': '/lovable-uploads/IMG_2918.PNG',
      '石油': '/lovable-uploads/IMG_2905.PNG',
      '石化': '/lovable-uploads/IMG_2903.PNG',
      '京东': '/lovable-uploads/IMG_2912.PNG',
      '滴滴': '/lovable-uploads/IMG_2916.PNG',
      '度小满': '/lovable-uploads/IMG_2916.PNG',
      '分期乐': '/lovable-uploads/IMG_2916.PNG',
      '安逸花': '/lovable-uploads/IMG_2916.PNG'
    };

    // 根据产品名称匹配图标
    for (const [key, iconSrc] of Object.entries(iconMap)) {
      if (product.name.includes(key)) {
        return (
          <img 
            src={iconSrc} 
            alt={product.name}
            className="w-12 h-12 object-contain"
          />
        );
      }
    }
    
    // 默认图标
    return (
      <img 
        src="/lovable-uploads/IMG_2916.PNG" 
        alt={product.name}
        className="w-12 h-12 object-contain"
      />
    );
  };

  // 处理服务点击
  const handleServiceClick = (product: BusinessProduct) => {
    setSelectedServiceId(product.id);
  };

  // 确认充值
  const handleConfirmRecharge = async (product: BusinessProduct) => {
    setIsSubmitting(true);
    
    try {
      // 根据产品slug路由到对应页面
      const routeMap: { [key: string]: string } = {
        // 信用卡代还
        'credit-card-repayment': '/credit-card',
        'credit-card': '/credit-card',
        'creditcard-daihuan': '/creditcard-daihuan',
        
        // 花呗代还
        'huabei-repayment': '/huabei-repayment',
        'huabei': '/huabei-repayment',
        
        // 抖音充值
        'douyin-coin': '/douyin-coin',
        'douyin-recharge': '/douyin-coin',
        'douyincoin': '/douyin-coin',
        
        // 快手充值
        'kuaishou-coin': '/kuaishou-coin',
        'kuaishou-recharge': '/kuaishou-coin',
        'kuaishoucoin': '/kuaishou-coin',
        
        // 网易游戏
        'netease-game': '/netease-game',
        'netease': '/netease-game',
        'wangyi-game': '/netease-game',
        
        // 加油卡
        'sinopec-card': '/oil-card',
        'oil-card': '/oil-card',
        'shihua-card': '/oil-card',
        'shihua-jiayou': '/oil-card',
        'shihua-jiayouka': '/oil-card',
        'jiayou-card': '/oil-card',
        'jiayouka': '/oil-card',
        'petrochina-card': '/oil-card',
        
        // 燃气缴费
        'gas-fee': '/gas-fee',
        'ranqi-fee': '/gas-fee',
        'gas-payment': '/gas-fee',
        
        // 放心借
        'fangxin-loan': '/fangxin-loan',
        'fangxinjie': '/fangxin-loan',
        
        // 话费充值
        'mobile-recharge': '/mobile-recharge',
        'huafei-recharge': '/mobile-recharge',
        'phone-recharge': '/mobile-recharge',
        
        // 电费缴费
        'electric-recharge': '/electric-recharge',
        'dianfei-payment': '/electric-recharge',
        'electricity-bill': '/electric-recharge',
        
        // 京东E卡 - 独立路由
        'jd-ecard': '/jd-ecard',
        'jd-card': '/jd-ecard',
        'jingdong-ecard': '/jd-ecard',
        
        // 新增的金融业务路由
        'didi-finance': '/didi-finance',
        'duxiaoman-repay': '/duxiaoman-repay',
        'fenqile': '/fenqile',
        'anyihua': '/anyihua',
        
        // 其他可能的slug
        'game-recharge': '/netease-game',
        'utility-payment': '/gas-fee'
      };

      const route = routeMap[product.slug] || `/${product.slug}`;
      
      // 智能路由fallback - 根据产品名称推断路由
      let finalRoute = route;
      if (route === `/${product.slug}`) {
        if (product.name.includes('石化') || product.name.includes('加油')) {
          finalRoute = '/oil-card';
        } else if (product.name.includes('京东') || product.name.includes('E卡')) {
          finalRoute = '/jd-ecard';
        } else if (product.name.includes('信用卡')) {
          finalRoute = '/credit-card';
        } else if (product.name.includes('花呗')) {
          finalRoute = '/huabei-repayment';
        } else if (product.name.includes('抖')) {
          finalRoute = '/douyin-coin';
        } else if (product.name.includes('快')) {
          finalRoute = '/kuaishou-coin';
        } else if (product.name.includes('网易')) {
          finalRoute = '/netease-game';
        } else if (product.name.includes('燃气')) {
          finalRoute = '/gas-fee';
        } else if (product.name.includes('放心借')) {
          finalRoute = '/fangxin-loan';
        } else if (product.name.includes('话费')) {
          finalRoute = '/mobile-recharge';
        } else if (product.name.includes('电费')) {
          finalRoute = '/electric-recharge';
        } else if (product.name.includes('滴滴')) {
          finalRoute = '/didi-finance';
        } else if (product.name.includes('度小满')) {
          finalRoute = '/duxiaoman-repay';
        } else if (product.name.includes('分期乐')) {
          finalRoute = '/fenqile';
        } else if (product.name.includes('安逸花')) {
          finalRoute = '/anyihua';
        }
      }
      
      navigate(finalRoute, { 
        state: { 
          serviceTitle: product.name,
          productConfig: {
            baseRate: product.base_rate,
            discountRate: product.discount_rate,
            minAmount: product.min_amount,
            maxAmount: product.max_amount,
            quickAmounts: product.quick_amounts,
            formConfig: product.form_config,
            workflowConfig: product.workflow_config
          }
        } 
      });
    } catch (error) {
      console.error('Service navigation error:', error);
      toast.error("操作失败，请重试");
    } finally {
      setIsSubmitting(false);
      setSelectedServiceId(null);
    }
  };

  // 格式化折扣显示
  const formatDiscount = (baseRate: number, discountRate: number) => {
    // 如果baseRate > 1，说明它是汇率值，需要转换为折扣显示
    if (baseRate > 1) {
      // baseRate是汇率（如7.2），discountRate是折扣率（如0.75表示75折）
      const discountPercent = Math.round(discountRate * 100);
      return `${discountPercent}折`;
    } else {
      // 兼容旧数据：baseRate是费率（如0.65），discountRate是额外折扣
      const actualDiscount = ((1 - baseRate + discountRate) * 100);
      return `${actualDiscount.toFixed(1)}折`;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>加载中...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Banner区域 */}
      <BannerSection banners={banners} />
      
      <div className="px-4 pt-3">
        <UserCountSection />
      </div>
      
      {/* 充值卡片区域 */}
      <StaticRechargeCards cards={rechargeCards} />

      {/* 业务服务区域 */}
      <div className="px-4 pt-4 pb-4">
        <h2 className="text-lg font-medium mb-4">在线业务</h2>
        <div className="space-y-4">
          {products.map(product => (
            <Card key={product.id} className="p-4 bg-gradient-to-r from-gray-50 to-white shadow-[6px_6px_12px_#c5c5c5,-6px_-6px_12px_#ffffff] rounded-2xl border-none">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleServiceClick(product)}>
                  {/* 产品图标 - 直接显示图片，无边框 */}
                  {product.logo_url ? (
                    <img 
                      src={product.logo_url} 
                      alt={product.name}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={product.logo_url ? 'hidden' : ''}>
                    {getServiceIcon(product)}
                  </div>
                  
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      {product.description ? product.description : formatDiscount(product.base_rate, product.discount_rate)}
                    </div>
                  </div>
                </div>
                
                {selectedServiceId === product.id ? (
                  <Button 
                    onClick={() => handleConfirmRecharge(product)} 
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      "前往充值"
                    )}
                  </Button>
                ) : (
                  <button 
                    onClick={() => handleServiceClick(product)}
                    className="bg-blue-500 text-white rounded-full flex items-center justify-center w-10 h-10 hover:bg-blue-600 transition-all"
                    title="选择服务"
                    aria-label="选择服务"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {/* 产品信息展示 */}
              {selectedServiceId === product.id && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">汇率:</span>
                      <span className="ml-2 font-medium text-blue-600">
                        {formatDiscount(product.base_rate, product.discount_rate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">金额:</span>
                      <span className="ml-2 font-medium">
                        ¥{product.min_amount}-{product.max_amount}
                      </span>
                    </div>
                  </div>
                  {product.quick_amounts.length > 0 && (
                    <div className="mt-2">
                      <span className="text-gray-500 text-sm">快捷金额:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {product.quick_amounts.slice(0, 4).map((amount, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                            ¥{amount}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">暂无可用服务</p>
            <Button 
              variant="outline" 
              onClick={fetchDashboardData}
              className="mt-4"
            >
              <Loader2 className="w-4 h-4 mr-2" />
              重新加载
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
