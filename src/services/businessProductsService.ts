// 业务产品服务模块
import { supabase } from '@/integrations/supabase/client';

// 表单字段类型
export interface FormField {
  id: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'tel' | 'email' | 'qrcode' | 'link';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  order: number;
}

// 工作流步骤
export interface WorkflowStep {
  step: number;
  title: string;
  description: string;
}

// 业务产品类型
export interface BusinessProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  logo_url: string;
  animated_logo_url?: string;
  logo_type: 'static' | 'animated' | 'lottie';
  base_rate: number;
  discount_rate: number;
  status: 'active' | 'inactive' | 'maintenance';
  is_featured: boolean;
  min_amount: number;
  max_amount: number;
  quick_amounts: number[];
  form_config: FormField[];
  workflow_config: WorkflowStep[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// 业务分类类型
export interface BusinessCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

// 首页配置类型
export interface HomepageConfig {
  id: string;
  section_name: string;
  config_data: any;
  is_active: boolean;
  sort_order: number;
}

// Banner类型
export interface Banner {
  id: number;
  image: string;
  alt: string;
  link: string;
  is_active: boolean;
}

// 充值卡片类型
export interface RechargeCard {
  title: string;
  discount: string;
  image: string;
  route: string;
  is_active: boolean;
}

/**
 * 获取首页展示的产品列表
 */
export const getHomepageProducts = async (): Promise<BusinessProduct[]> => {
  try {
    const { data, error } = await supabase.rpc('get_homepage_products');
    
    if (error) {
      console.error('获取首页产品失败:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('获取首页产品异常:', error);
    throw error;
  }
};

/**
 * 根据slug获取产品详情
 */
export const getProductBySlug = async (slug: string): Promise<BusinessProduct | null> => {
  try {
    const { data, error } = await supabase.rpc('get_product_by_slug', {
      product_slug: slug
    });
    
    if (error) {
      console.error('获取产品详情失败:', error);
      throw error;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('获取产品详情异常:', error);
    throw error;
  }
};

/**
 * 获取所有业务产品（管理后台用）
 */
export const getAllBusinessProducts = async (): Promise<BusinessProduct[]> => {
  try {
    const { data, error } = await supabase
      .from('business_products')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('获取所有产品失败:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('获取所有产品异常:', error);
    throw error;
  }
};

/**
 * 创建业务产品
 */
export const createBusinessProduct = async (product: Partial<BusinessProduct>): Promise<BusinessProduct> => {
  try {
    const { data, error } = await supabase
      .from('business_products')
      .insert([product])
      .select()
      .single();

    if (error) {
      console.error('创建产品失败:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('创建产品异常:', error);
    throw error;
  }
};

/**
 * 更新业务产品
 */
export const updateBusinessProduct = async (id: string, updates: Partial<BusinessProduct>): Promise<BusinessProduct> => {
  try {
    // 清理不需要的字段，避免数据库错误
    const cleanUpdates: Record<string, any> = { ...updates };
    
    // 移除可能导致问题的字段
    delete cleanUpdates.id;
    delete cleanUpdates.created_at;
    
    console.log('准备更新产品:', { id, cleanUpdates });
    
    // 先检查产品是否存在
    const { data: existingProduct, error: checkError } = await supabase
      .from('business_products')
      .select('id, name, status')
      .eq('id', id)
      .single();
    
    if (checkError) {
      console.error('检查产品存在性失败:', checkError);
      throw new Error(`检查产品失败: ${checkError.message}`);
    }
    
    if (!existingProduct) {
      throw new Error(`找不到ID为 ${id} 的产品`);
    }
    
    console.log('找到现有产品:', existingProduct);
    
    // 执行更新操作
    const { data, error } = await supabase
      .from('business_products')
      .update({
        ...cleanUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    console.log('更新操作结果:', { data, error });

    if (error) {
      console.error('更新产品失败:', error);
      throw new Error(`更新产品失败: ${error.message}`);
    }

    if (!data || data.length === 0) {
      // 如果更新没有返回数据，尝试重新查询
      const { data: updatedProduct, error: refetchError } = await supabase
        .from('business_products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (refetchError || !updatedProduct) {
        throw new Error(`更新后无法获取产品数据: ${refetchError?.message || '未知错误'}`);
      }
      
      return updatedProduct as BusinessProduct;
    }

    return data[0] as BusinessProduct;
  } catch (error) {
    console.error('更新产品异常:', error);
    throw error;
  }
};

/**
 * 删除业务产品
 */
export const deleteBusinessProduct = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('business_products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除产品失败:', error);
      throw error;
    }
  } catch (error) {
    console.error('删除产品异常:', error);
    throw error;
  }
};

/**
 * 切换产品状态
 */
export const toggleProductStatus = async (id: string, status: 'active' | 'inactive' | 'maintenance'): Promise<void> => {
  try {
    const { error } = await supabase
      .from('business_products')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('切换产品状态失败:', error);
      throw error;
    }
  } catch (error) {
    console.error('切换产品状态异常:', error);
    throw error;
  }
};

/**
 * 切换产品首页推荐状态
 */
export const toggleProductFeatured = async (id: string, is_featured: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('business_products')
      .update({ 
        is_featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('切换产品推荐状态失败:', error);
      throw error;
    }
  } catch (error) {
    console.error('切换产品推荐状态异常:', error);
    throw error;
  }
};

/**
 * 获取业务分类列表
 */
export const getBusinessCategories = async (): Promise<BusinessCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('business_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('获取业务分类失败:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('获取业务分类异常:', error);
    throw error;
  }
};

/**
 * 获取首页配置
 */
export const getHomepageConfig = async (): Promise<HomepageConfig[]> => {
  try {
    const { data, error } = await supabase
      .from('homepage_config')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('获取首页配置失败:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('获取首页配置异常:', error);
    throw error;
  }
};

/**
 * 获取首页Banner列表
 */
export const getHomepageBanners = async (): Promise<Banner[]> => {
  try {
    const config = await getHomepageConfig();
    const bannerConfig = config.find(c => c.section_name === 'banners');
    
    if (!bannerConfig) {
      return [];
    }
    
    return bannerConfig.config_data.filter((banner: Banner) => banner.is_active);
  } catch (error) {
    console.error('获取首页Banner异常:', error);
    throw error;
  }
};

/**
 * 获取首页充值卡片列表
 */
export const getHomepageRechargeCards = async (): Promise<RechargeCard[]> => {
  try {
    const config = await getHomepageConfig();
    const cardConfig = config.find(c => c.section_name === 'recharge_cards');
    
    if (!cardConfig) {
      return [];
    }
    
    return cardConfig.config_data.filter((card: RechargeCard) => card.is_active);
  } catch (error) {
    console.error('获取首页充值卡片异常:', error);
    throw error;
  }
};

/**
 * 更新首页配置
 */
export const updateHomepageConfig = async (sectionName: string, configData: any): Promise<void> => {
  try {
    const { error } = await supabase
      .from('homepage_config')
      .upsert({
        section_name: sectionName,
        config_data: configData,
        is_active: true,
        sort_order: 1
      });

    if (error) {
      console.error('更新首页配置失败:', error);
      throw error;
    }
  } catch (error) {
    console.error('更新首页配置异常:', error);
    throw error;
  }
};

/**
 * 获取产品统计数据
 */
export const getProductStats = async () => {
  try {
    const products = await getAllBusinessProducts();
    
    const stats = {
      total: products.length,
      active: products.filter(p => p.status === 'active').length,
      inactive: products.filter(p => p.status === 'inactive').length,
      maintenance: products.filter(p => p.status === 'maintenance').length,
      featured: products.filter(p => p.is_featured).length,
      categories: [...new Set(products.map(p => p.category))].length
    };
    
    return stats;
  } catch (error) {
    console.error('获取产品统计异常:', error);
    throw error;
  }
};

/**
 * 批量更新产品排序
 */
export const batchUpdateProductOrder = async (updates: Array<{ id: string; sort_order: number }>): Promise<void> => {
  try {
    const promises = updates.map(update => 
      supabase
        .from('business_products')
        .update({ 
          sort_order: update.sort_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', update.id)
    );

    const results = await Promise.all(promises);
    
    // 检查是否有错误
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('批量更新排序失败:', errors);
      throw new Error('批量更新排序失败');
    }
  } catch (error) {
    console.error('批量更新产品排序异常:', error);
    throw error;
  }
};

/**
 * 搜索产品
 */
export const searchProducts = async (searchTerm: string): Promise<BusinessProduct[]> => {
  try {
    const { data, error } = await supabase
      .from('business_products')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('搜索产品失败:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('搜索产品异常:', error);
    throw error;
  }
};

/**
 * 简单的产品状态更新函数 - 使用原始SQL避免类型问题
 */
export const updateProductStatus = async (id: string, status: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('execute_sql', {
      query: `UPDATE business_products SET status = $1, updated_at = NOW() WHERE id = $2`,
      params: [status, id]
    });

    if (error) {
      console.error('更新产品状态失败:', error);
      throw error;
    }
  } catch (error) {
    console.error('更新产品状态异常:', error);
    throw error;
  }
};

// 默认导出服务对象
export const businessProductsService = {
  getHomepageProducts,
  getProductBySlug,
  getAllBusinessProducts,
  createBusinessProduct,
  updateBusinessProduct,
  deleteBusinessProduct,
  toggleProductStatus,
  toggleProductFeatured,
  getBusinessCategories,
  getHomepageConfig,
  getHomepageBanners,
  getHomepageRechargeCards,
  updateHomepageConfig,
  getProductStats,
  batchUpdateProductOrder,
  searchProducts,
  updateProductStatus
};

export default businessProductsService; 