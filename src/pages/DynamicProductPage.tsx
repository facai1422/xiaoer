import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DynamicProductForm from '@/components/product/DynamicProductForm';
import { getTemplateById } from '@/config/templates';
import { FormTemplate } from '@/types/template';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductConfig {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  logo_url?: string;
  base_rate?: number;
  discount_rate?: number;
  status: string;
  min_amount?: number;
  max_amount?: number;
  quick_amounts?: number[];
  sort_order?: number;
  template_id?: string;
  form_config?: any;
  workflow_config?: any;
  created_at?: string;
  updated_at?: string;
}

const DynamicProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [productConfig, setProductConfig] = useState<ProductConfig | null>(null);

  useEffect(() => {
    if (!slug) {
      navigate('/');
      return;
    }

    loadProductConfig();
  }, [slug]);

  const loadProductConfig = async () => {
    try {
      setLoading(true);

      // 使用RPC函数获取产品数据
      const { data: products, error } = await supabase
        .rpc('get_homepage_products');

      if (error) {
        console.error('RPC error:', error);
        toast.error('获取产品数据失败');
        navigate('/');
        return;
      }

      // 查找匹配的产品
      const product = products?.find((p: any) => p.slug === slug && p.status === 'active');

      if (!product) {
        console.error('Product not found for slug:', slug);
        toast.error('产品不存在或已下线');
        navigate('/');
        return;
      }

      // 获取对应的模板
      const templateId = product.template_id || getDefaultTemplateId(product.name);
      const templateData = getTemplateById(templateId);

      if (!templateData) {
        console.error('Template not found:', templateId);
        toast.error('产品模板不存在');
        navigate('/');
        return;
      }

      setProductConfig(product);
      setTemplate(templateData);
    } catch (error) {
      console.error('Error loading product config:', error);
      toast.error('加载产品配置失败');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // 根据产品名称推断默认模板ID
  const getDefaultTemplateId = (productName: string): string => {
    if (productName.includes('话费') || productName.includes('充值')) {
      return 'mobile-recharge';
    } else if (productName.includes('信用卡') || productName.includes('代还')) {
      return 'credit-card-repayment';
    } else if (productName.includes('二维码') || productName.includes('花呗') || productName.includes('借呗')) {
      return 'qrcode-repayment';
    } else if (productName.includes('卡密') || productName.includes('游戏')) {
      return 'card-secret';
    } else if (productName.includes('电费') || productName.includes('缴费')) {
      return 'electricity-bill';
    }
    return 'mobile-recharge'; // 默认模板
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!template || !productConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">产品不存在</h2>
          <p className="text-gray-600 mb-6">您访问的产品可能已下线或不存在</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  // 构建自定义配置
  const customConfig = {
    title: productConfig.name,
    subtitle: productConfig.description || template.customContent?.subtitle,
    description: productConfig.description || template.customContent?.description,
    discount: productConfig.base_rate ? ((1 - productConfig.base_rate) * 100).toFixed(1) : template.customContent?.discount,
    submitButtonText: productConfig.form_config?.submitButtonText || template.submitButtonText,
    successMessage: productConfig.form_config?.successMessage || template.successMessage,
    quickAmounts: productConfig.quick_amounts || template.quickAmounts,
    exchangeRate: productConfig.form_config?.exchangeRate || template.exchangeRate,
    businessType: productConfig.name,
    showTutorial: productConfig.form_config?.showTutorial ?? template.showTutorial,
    tutorialText: productConfig.form_config?.tutorialText || template.tutorialText,
    features: productConfig.form_config?.features || template.customContent?.features || []
  };

  return (
    <DynamicProductForm
      template={template}
      customConfig={customConfig}
    />
  );
};

export default DynamicProductPage; 