import { supabase } from "@/integrations/supabase/client";

// 汇率设置接口
export interface ExchangeRateSetting {
  id: string;
  name: string;
  rate: number;
  is_default: boolean;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// 折扣设置接口
export interface DiscountSetting {
  id: string;
  name: string;
  discount_rate: number;
  is_default: boolean;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// 价格计算结果接口
export interface PriceCalculation {
  original_price: number;
  discount_rate: number;
  exchange_rate: number;
  discounted_price: number;
  usdt_amount: number;
  discount_percent: number;
  savings: number;
}

// 产品价格信息接口
export interface ProductPricingInfo {
  product_id: string;
  product_name: string;
  exchange_rate: number;
  discount_rate: number;
  min_amount: number;
  max_amount: number;
  quick_amounts: number[];
}

/**
 * 获取所有汇率设置
 */
export const getExchangeRateSettings = async (): Promise<ExchangeRateSetting[]> => {
  try {
    const { data, error } = await supabase
      .from('exchange_rate_settings' as any)
      .select('*')
      .eq('status', 'active')
      .order('rate', { ascending: true });

    if (error) throw error;
    return (data as unknown) as ExchangeRateSetting[];
  } catch (error) {
    console.error('获取汇率设置失败:', error);
    throw error;
  }
};

/**
 * 获取所有折扣设置
 */
export const getDiscountSettings = async (): Promise<DiscountSetting[]> => {
  try {
    const { data, error } = await supabase
      .from('discount_settings' as any)
      .select('*')
      .eq('status', 'active')
      .order('discount_rate', { ascending: true });

    if (error) throw error;
    return (data as unknown) as DiscountSetting[];
  } catch (error) {
    console.error('获取折扣设置失败:', error);
    throw error;
  }
};

/**
 * 获取默认汇率
 */
export const getDefaultExchangeRate = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('exchange_rate_settings' as any)
      .select('rate')
      .eq('is_default', true)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      console.warn('未找到默认汇率，使用7.2');
      return 7.2;
    }
    
    return (data as any).rate;
  } catch (error) {
    console.error('获取默认汇率失败:', error);
    return 7.2;
  }
};

/**
 * 获取默认折扣率
 */
export const getDefaultDiscountRate = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('discount_settings' as any)
      .select('discount_rate')
      .eq('is_default', true)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      console.warn('未找到默认折扣，使用0.75');
      return 0.75;
    }
    
    return (data as any).discount_rate;
  } catch (error) {
    console.error('获取默认折扣失败:', error);
    return 0.75;
  }
};

/**
 * 计算产品价格
 */
export const calculateProductPrice = async (
  productId: string,
  originalPrice: number
): Promise<PriceCalculation> => {
  try {
    const { data, error } = await supabase
      .rpc('calculate_product_price' as any, {
        product_id: productId,
        original_price: originalPrice
      });

    if (error) throw error;
    return (data as unknown) as PriceCalculation;
  } catch (error) {
    console.error('计算产品价格失败:', error);
    // 返回默认计算结果
    const defaultExchangeRate = await getDefaultExchangeRate();
    const defaultDiscountRate = await getDefaultDiscountRate();
    
    const discountedPrice = originalPrice * defaultDiscountRate;
    const usdtAmount = discountedPrice / defaultExchangeRate;
    
    return {
      original_price: originalPrice,
      discount_rate: defaultDiscountRate,
      exchange_rate: defaultExchangeRate,
      discounted_price: discountedPrice,
      usdt_amount: usdtAmount,
      discount_percent: Math.round((1 - defaultDiscountRate) * 100 * 10) / 10,
      savings: originalPrice - discountedPrice
    };
  }
};

/**
 * 获取产品价格信息
 */
export const getProductPricingInfo = async (productSlug: string): Promise<ProductPricingInfo> => {
  try {
    const { data, error } = await supabase
      .rpc('get_product_pricing_info' as any, {
        product_slug: productSlug
      });

    if (error) throw error;
    return (data as unknown) as ProductPricingInfo;
  } catch (error) {
    console.error('获取产品价格信息失败:', error);
    throw error;
  }
};

/**
 * 简化版价格计算（不依赖数据库函数）
 */
export const calculatePrice = (
  originalPrice: number,
  discountRate: number,
  exchangeRate: number
): PriceCalculation => {
  const discountedPrice = originalPrice * discountRate;
  const usdtAmount = discountedPrice / exchangeRate;
  
  return {
    original_price: originalPrice,
    discount_rate: discountRate,
    exchange_rate: exchangeRate,
    discounted_price: discountedPrice,
    usdt_amount: parseFloat(usdtAmount.toFixed(4)),
    discount_percent: Math.round((1 - discountRate) * 100 * 10) / 10,
    savings: originalPrice - discountedPrice
  };
};

/**
 * 创建汇率设置
 */
export const createExchangeRateSetting = async (
  setting: Omit<ExchangeRateSetting, 'id' | 'created_at' | 'updated_at'>
): Promise<ExchangeRateSetting> => {
  try {
    // 如果设置为默认，先取消其他默认设置
    if (setting.is_default) {
      await supabase
        .from('exchange_rate_settings' as any)
        .update({ is_default: false })
        .eq('is_default', true);
    }

    const { data, error } = await supabase
      .from('exchange_rate_settings' as any)
      .insert([setting])
      .select()
      .single();

    if (error) throw error;
    return (data as unknown) as ExchangeRateSetting;
  } catch (error) {
    console.error('创建汇率设置失败:', error);
    throw error;
  }
};

/**
 * 更新汇率设置
 */
export const updateExchangeRateSetting = async (
  id: string,
  updates: Partial<Omit<ExchangeRateSetting, 'id' | 'created_at' | 'updated_at'>>
): Promise<ExchangeRateSetting> => {
  try {
    // 如果设置为默认，先取消其他默认设置
    if (updates.is_default) {
      await supabase
        .from('exchange_rate_settings' as any)
        .update({ is_default: false })
        .eq('is_default', true)
        .neq('id', id);
    }

    const { data, error } = await supabase
      .from('exchange_rate_settings' as any)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return (data as unknown) as ExchangeRateSetting;
  } catch (error) {
    console.error('更新汇率设置失败:', error);
    throw error;
  }
};

/**
 * 删除汇率设置
 */
export const deleteExchangeRateSetting = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('exchange_rate_settings' as any)
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('删除汇率设置失败:', error);
    throw error;
  }
};

/**
 * 创建折扣设置
 */
export const createDiscountSetting = async (
  setting: Omit<DiscountSetting, 'id' | 'created_at' | 'updated_at'>
): Promise<DiscountSetting> => {
  try {
    // 如果设置为默认，先取消其他默认设置
    if (setting.is_default) {
      await supabase
        .from('discount_settings' as any)
        .update({ is_default: false })
        .eq('is_default', true);
    }

    const { data, error } = await supabase
      .from('discount_settings' as any)
      .insert([setting])
      .select()
      .single();

    if (error) throw error;
    return (data as unknown) as DiscountSetting;
  } catch (error) {
    console.error('创建折扣设置失败:', error);
    throw error;
  }
};

/**
 * 更新折扣设置
 */
export const updateDiscountSetting = async (
  id: string,
  updates: Partial<Omit<DiscountSetting, 'id' | 'created_at' | 'updated_at'>>
): Promise<DiscountSetting> => {
  try {
    // 如果设置为默认，先取消其他默认设置
    if (updates.is_default) {
      await supabase
        .from('discount_settings' as any)
        .update({ is_default: false })
        .eq('is_default', true)
        .neq('id', id);
    }

    const { data, error } = await supabase
      .from('discount_settings' as any)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return (data as unknown) as DiscountSetting;
  } catch (error) {
    console.error('更新折扣设置失败:', error);
    throw error;
  }
};

/**
 * 删除折扣设置
 */
export const deleteDiscountSetting = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('discount_settings' as any)
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('删除折扣设置失败:', error);
    throw error;
  }
};

/**
 * 更新产品的汇率和折扣设置
 */
export const updateProductPricing = async (
  productId: string,
  updates: {
    exchange_rate_id?: string | null;
    discount_id?: string | null;
    custom_exchange_rate?: number | null;
    custom_discount_rate?: number | null;
  }
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('business_products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);

    if (error) throw error;
  } catch (error) {
    console.error('更新产品价格设置失败:', error);
    throw error;
  }
}; 