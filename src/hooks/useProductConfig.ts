import { useState, useEffect, useCallback } from 'react';
import { getProductBySlug, getAllBusinessProducts, BusinessProduct } from '@/services/businessProductsService';

export interface ProductConfig {
  title: string;
  subtitle: string;
  description: string;
  submitButtonText: string;
  successMessage: string;
  tutorialText: string;
  showTutorial: boolean;
  exchangeRate: number;
  discountRate: number;
  quickAmounts: string[];
  features: string[];
}

interface UseProductConfigProps {
  productSlug: string;
  productName: string;
  defaultConfig: Partial<ProductConfig>;
  autoRefresh?: boolean; // 是否启用自动刷新
  refreshInterval?: number; // 刷新间隔（毫秒）
}

// 全局配置缓存
const configCache = new Map<string, { config: ProductConfig; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 全局配置更新事件
export const triggerConfigRefresh = (productSlug?: string) => {
  const event = new CustomEvent('productConfigUpdate', { 
    detail: { productSlug, timestamp: Date.now() } 
  });
  window.dispatchEvent(event);
  console.log('🔔 触发全局配置刷新事件:', productSlug || 'all');
};

// 清除所有缓存
export const clearConfigCache = () => {
  configCache.clear();
  console.log('🗑️ 清除所有产品配置缓存');
};

export const useProductConfig = ({ 
  productSlug, 
  productName, 
  defaultConfig,
  autoRefresh = false, // 默认关闭自动刷新，避免性能问题
  refreshInterval = 60000 // 如果开启，60秒刷新一次
}: UseProductConfigProps) => {
  const [config, setConfig] = useState<ProductConfig>({
    title: productName,
    subtitle: productName,
    description: `${productName}服务`,
    submitButtonText: "立即提交",
    successMessage: `${productName}提交成功！`,
    tutorialText: "查看使用教程 →",
    showTutorial: true,
    exchangeRate: 7.2,
    discountRate: 0.75,
    quickAmounts: ["500", "1000", "2000", "5000"],
    features: [],
    ...defaultConfig
  });

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 生成可能的slug变体
  const generateSlugVariants = (baseSlug: string, productName: string): string[] => {
    const variants = [baseSlug];
    
    // 添加常见变体
    if (baseSlug.includes('-')) {
      variants.push(baseSlug.replace(/-/g, ''));
    }
    
    // 根据产品名称生成额外的slug
    const nameLower = productName.toLowerCase();
    if (nameLower.includes('抖音')) {
      variants.push('douyin', 'douyincoin', 'tiktok-coin', 'dy-coin', 'douyin-recharge');
    }
    if (nameLower.includes('快手')) {
      variants.push('kuaishou', 'kuaishoucoin', 'ks-coin', 'kuaishou-recharge');
    }
    if (nameLower.includes('信用卡')) {
      variants.push('credit-card', 'creditcard', 'xinyongka', 'credit-repay');
    }
    if (nameLower.includes('花呗')) {
      variants.push('huabei', 'huabei-repay', 'alipay-huabei', 'ant-huabei');
    }
    if (nameLower.includes('网易')) {
      variants.push('netease', 'netease-game', 'wangyi', 'wy-game');
    }
    if (nameLower.includes('京东')) {
      variants.push('jd', 'jingdong', 'jd-card', 'jingdong-card');
    }
    if (nameLower.includes('加油卡') || nameLower.includes('石化')) {
      variants.push('oil', 'gas-card', 'sinopec', 'petrochina');
    }
    if (nameLower.includes('电费')) {
      variants.push('electric', 'power', 'electricity', 'dianfei');
    }
    if (nameLower.includes('放心借')) {
      variants.push('fangxin', 'fangxinjie', 'anxin-loan', 'douyin-loan');
    }
    
    // 去重并返回
    return [...new Set(variants)];
  };

  const loadProductConfig = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // 检查缓存
      const cacheKey = `${productSlug}-${productName}`;
      const cached = configCache.get(cacheKey);
      const now = Date.now();
      
      if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_DURATION) {
        console.log(`📦 使用缓存配置: ${productName}`);
        setConfig(cached.config);
        setLastUpdated(new Date(cached.timestamp));
        return;
      }
      
      let product: BusinessProduct | null = null;
      
      // 1. 首先尝试精确匹配原始slug
      try {
        product = await getProductBySlug(productSlug);
        if (product) {
          console.log(`✅ 通过精确slug匹配找到产品: ${productSlug}`);
        }
      } catch (error) {
        console.log(`❌ 精确slug匹配失败: ${productSlug}`);
      }
      
      // 2. 如果精确匹配失败，尝试slug变体
      if (!product) {
        const slugVariants = generateSlugVariants(productSlug, productName);
        console.log(`🔍 尝试slug变体: ${slugVariants.join(', ')}`);
        
        for (const variant of slugVariants) {
          if (variant === productSlug) continue; // 跳过已经尝试过的原始slug
          
          try {
            product = await getProductBySlug(variant);
            if (product) {
              console.log(`✅ 通过slug变体找到产品: ${variant}`);
              break;
            }
          } catch (error) {
            // 继续尝试下一个变体
          }
        }
      }
      
      // 3. 如果还没找到，尝试通过名称模糊匹配
      if (!product) {
        console.log(`🔍 尝试名称模糊匹配: ${productName}`);
        try {
          const allProducts = await getAllBusinessProducts();
          
          // 优先匹配完全包含产品名称的
          product = allProducts.find(p => 
            p.name.includes(productName) || 
            productName.includes(p.name)
          ) || null;
          
          if (product) {
            console.log(`✅ 通过名称匹配找到产品: ${product.name}`);
          } else {
            // 尝试关键词匹配
            const keywords = productName.split(/[^\u4e00-\u9fa5a-zA-Z]+/).filter(k => k.length > 1);
            for (const keyword of keywords) {
              product = allProducts.find(p => 
                p.name.includes(keyword) || 
                p.description?.includes(keyword) ||
                p.slug.includes(keyword.toLowerCase())
              ) || null;
              
              if (product) {
                console.log(`✅ 通过关键词"${keyword}"找到产品: ${product.name}`);
                break;
              }
            }
          }
        } catch (error) {
          console.error('名称匹配查询失败:', error);
        }
      }

      if (product) {
        // 确定汇率：优先使用base_rate（如果>1则是汇率），否则使用默认值
        const exchangeRate = product.base_rate > 1 
          ? product.base_rate 
          : defaultConfig.exchangeRate || 7.2;
        
        // 确定折扣：如果base_rate<=1则是折扣率，否则使用discount_rate
        const discountRate = product.base_rate <= 1 
          ? product.base_rate 
          : product.discount_rate || defaultConfig.discountRate || 0.75;
        
        const newConfig = {
          ...config,
          title: product.name || config.title,
          subtitle: product.name || config.subtitle,
          description: product.description || config.description,
          exchangeRate: exchangeRate,
          discountRate: discountRate,
          quickAmounts: product.quick_amounts?.map(String) || config.quickAmounts,
        };
        
        setConfig(newConfig);
        setLastUpdated(new Date());
        
        // 更新缓存
        configCache.set(cacheKey, { config: newConfig, timestamp: now });
        
        console.log('🎉 产品配置加载完成:', {
          name: product.name,
          slug: product.slug,
          exchangeRate: exchangeRate,
          discountRate: discountRate,
          base_rate: product.base_rate,
          discount_rate: product.discount_rate,
          displayDiscount: (discountRate * 10).toFixed(1) + '折',
          lastUpdated: new Date().toLocaleTimeString()
        });
      } else {
        console.log(`⚠️ 未找到产品 "${productName}" (slug: ${productSlug})，使用默认配置`);
        console.log('💡 建议在管理后台添加此产品，或检查产品slug是否正确');
      }
    } catch (error) {
      console.error('加载产品配置失败:', error);
      // 使用默认配置，不影响用户使用
    } finally {
      setLoading(false);
    }
  }, [productSlug, productName, defaultConfig]);

  // 初始加载
  useEffect(() => {
    loadProductConfig();
  }, [productSlug]);

  // 自动刷新机制
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log(`🔄 自动刷新产品配置: ${productName}`);
      loadProductConfig();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadProductConfig, productName]);

  // 页面可见性变化时刷新
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log(`👁️ 页面重新可见，刷新产品配置: ${productName}`);
        loadProductConfig();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadProductConfig, productName]);

  // 监听全局配置更新事件
  useEffect(() => {
    const handleConfigUpdate = (event: CustomEvent) => {
      const { productSlug: updatedSlug } = event.detail;
      
      // 如果没有指定产品或者是当前产品，则刷新
      if (!updatedSlug || updatedSlug === productSlug) {
        console.log(`🔔 收到配置更新通知，刷新产品配置: ${productName}`);
        
        // 清除当前产品的缓存
        const cacheKey = `${productSlug}-${productName}`;
        configCache.delete(cacheKey);
        
        // 强制刷新
        loadProductConfig(true);
      }
    };

    window.addEventListener('productConfigUpdate', handleConfigUpdate as EventListener);
    return () => window.removeEventListener('productConfigUpdate', handleConfigUpdate as EventListener);
  }, [productSlug, productName, loadProductConfig]);

  // 计算显示的折扣值
  const displayDiscount = (config.discountRate * 10).toFixed(1);

  return {
    config,
    loading,
    displayDiscount,
    lastUpdated,
    reload: () => loadProductConfig(true), // 强制刷新
    autoReload: () => loadProductConfig(false) // 使用缓存的刷新
  };
}; 