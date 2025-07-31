/**
 * 可配置在线业务服务管理
 */

import { supabase } from "@/integrations/supabase/client";

// 表单字段类型定义
export interface ConfigurableFormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'password' | 'url' | 'textarea' | 'number' | 'select' | 'file' | 'qrcode';
  placeholder?: string;
  required: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

// 教程步骤定义
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  type?: 'info' | 'warning' | 'success' | 'default';
}

// 可配置服务类型定义
export interface ConfigurableService {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  status: 'active' | 'inactive';
  
  // 价格配置
  exchange_rate: number;
  discount_rate: number;
  min_amount: number;
  max_amount: number;
  quick_amounts: number[];
  
  // 教程配置
  tutorial_title: string;
  tutorial_content: string;
  show_tutorial: boolean;
  tutorial_steps: TutorialStep[];
  
  // 表单配置
  form_fields: ConfigurableFormField[];
  
  // 显示配置
  sort_order: number;
  is_featured: boolean;
  
  // 时间戳
  created_at: string;
  updated_at: string;
}

/**
 * 获取所有可配置服务（管理员用）
 */
export const getAllConfigurableServices = async (): Promise<ConfigurableService[]> => {
  try {
    const { data, error } = await supabase
      .from('configurable_services')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('获取可配置服务失败:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('获取可配置服务异常:', error);
    throw error;
  }
};

/**
 * 获取启用的可配置服务（用户端用）
 */
export const getActiveConfigurableServices = async (): Promise<ConfigurableService[]> => {
  try {
    const { data, error } = await supabase
      .from('configurable_services')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('获取启用的可配置服务失败:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('获取启用的可配置服务异常:', error);
    throw error;
  }
};

/**
 * 根据slug获取可配置服务
 */
export const getConfigurableServiceBySlug = async (slug: string): Promise<ConfigurableService | null> => {
  try {
    const { data, error } = await supabase
      .from('configurable_services')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // 没有找到记录
      }
      console.error('获取可配置服务失败:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('获取可配置服务异常:', error);
    throw error;
  }
};

/**
 * 创建可配置服务
 */
export const createConfigurableService = async (service: Partial<ConfigurableService>): Promise<ConfigurableService> => {
  try {
    const { data, error } = await supabase
      .from('configurable_services')
      .insert([service])
      .select()
      .single();

    if (error) {
      console.error('创建可配置服务失败:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('创建可配置服务异常:', error);
    throw error;
  }
};

/**
 * 更新可配置服务
 */
export const updateConfigurableService = async (id: string, updates: Partial<ConfigurableService>): Promise<ConfigurableService> => {
  try {
    const { data, error } = await supabase
      .from('configurable_services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新可配置服务失败:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('更新可配置服务异常:', error);
    throw error;
  }
};

/**
 * 删除可配置服务
 */
export const deleteConfigurableService = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('configurable_services')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除可配置服务失败:', error);
      throw error;
    }
  } catch (error) {
    console.error('删除可配置服务异常:', error);
    throw error;
  }
};

/**
 * 切换服务状态
 */
export const toggleServiceStatus = async (id: string): Promise<ConfigurableService> => {
  try {
    // 先获取当前状态
    const { data: currentService, error: fetchError } = await supabase
      .from('configurable_services')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // 切换状态
    const newStatus = currentService.status === 'active' ? 'inactive' : 'active';
    
    const { data, error } = await supabase
      .from('configurable_services')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('切换服务状态失败:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('切换服务状态异常:', error);
    throw error;
  }
};

/**
 * 创建服务订单
 */
export const createConfigurableServiceOrder = async (orderData: {
  userId: string;
  serviceId: string;
  serviceName: string;
  amount: number;
  actualAmount: number;
  formData: Record<string, any>;
  metadata?: Record<string, any>;
}) => {
  try {
    // 这里可以复用现有的 createBusinessOrder 函数
    const { createBusinessOrder } = await import('./businessOrderService');
    
    return await createBusinessOrder({
      userId: orderData.userId,
      businessType: `可配置服务-${orderData.serviceName}`,
      targetAccount: orderData.formData.account || orderData.formData.phone || orderData.formData.email || 'N/A',
      amount: orderData.amount,
      actualAmount: orderData.actualAmount,
      accountName: orderData.formData.name || orderData.formData.account || 'N/A',
      metadata: {
        serviceId: orderData.serviceId,
        serviceName: orderData.serviceName,
        formData: orderData.formData,
        ...orderData.metadata
      }
    });
  } catch (error) {
    console.error('创建可配置服务订单失败:', error);
    throw error;
  }
};

/**
 * 获取默认表单字段模板
 */
export const getDefaultFormFieldTemplates = (): ConfigurableFormField[] => {
  return [
    {
      id: 'name',
      name: 'name',
      label: '姓名',
      type: 'text',
      placeholder: '请输入姓名',
      required: false
    },
    {
      id: 'phone',
      name: 'phone',
      label: '手机号',
      type: 'phone',
      placeholder: '请输入手机号',
      required: false,
      validation: {
        pattern: '^1[3-9]\\d{9}$'
      }
    },
    {
      id: 'email',
      name: 'email',
      label: '邮箱',
      type: 'email',
      placeholder: '请输入邮箱地址',
      required: false
    },
    {
      id: 'account',
      name: 'account',
      label: '账号',
      type: 'text',
      placeholder: '请输入账号',
      required: false
    },
    {
      id: 'password',
      name: 'password',
      label: '密码',
      type: 'password',
      placeholder: '请输入密码',
      required: false
    },
    {
      id: 'url',
      name: 'url',
      label: '链接',
      type: 'url',
      placeholder: '请输入链接地址',
      required: false
    },
    {
      id: 'amount',
      name: 'amount',
      label: '金额',
      type: 'number',
      placeholder: '请输入金额',
      required: true,
      validation: {
        min: 1,
        max: 10000
      }
    }
  ];
};