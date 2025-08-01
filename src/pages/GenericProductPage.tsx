import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EnhancedProductForm } from "@/components/product/EnhancedProductForm";
import { TutorialDialog } from "@/components/product/TutorialDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { createBusinessOrder } from "@/services/businessOrderService";

// 导入专属页面组件
import AnYiHua from "./AnYiHua";
import FenQiLe from "./FenQiLe";
import DuXiaoManRepay from "./DuXiaoManRepay";

interface ProductConfig {
  baseRate: number;
  discountRate: number;
  minAmount: number;
  maxAmount: number;
  quickAmounts: number[];
  formConfig: any[];
  workflowConfig: any[];
}

interface LocationState {
  serviceTitle?: string;
  productConfig?: ProductConfig;
}

const GenericProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const state = location.state as LocationState;
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [productConfig, setProductConfig] = useState<ProductConfig | null>(state?.productConfig || null);
  const [serviceTitle, setServiceTitle] = useState(state?.serviceTitle || '业务服务');
  const [isLoading, setIsLoading] = useState(!state?.productConfig);
  const [formData, setFormData] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 检查是否为特殊的专属页面 slug
  const specialPages = {
    'anyihua': AnYiHua,
    'fenqile': FenQiLe, 
    'duxiaoman-repay': DuXiaoManRepay
  };

  // 如果是特殊页面，直接渲染对应组件
  if (slug && specialPages[slug as keyof typeof specialPages]) {
    const SpecialPageComponent = specialPages[slug as keyof typeof specialPages];
    return <SpecialPageComponent />;
  }

  // 从数据库获取产品配置
  const fetchProductConfig = async () => {
    if (!slug) return;
    
    try {
      setIsLoading(true);
      // URL解码slug，处理中文字符
      const decodedSlug = decodeURIComponent(slug);
      console.log('查询产品slug:', { original: slug, decoded: decodedSlug });
      
      let { data, error } = await supabase
        .from('business_products')
        .select('*')
        .eq('slug', decodedSlug)
        .eq('status', 'active')
        .single();

      // 如果解码后的slug找不到，尝试用原始slug查询
      if (error && decodedSlug !== slug) {
        console.log('用解码slug查询失败，尝试原始slug:', slug);
        const fallbackResult = await supabase
          .from('business_products')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'active')
          .single();
        data = fallbackResult.data;
        error = fallbackResult.error;
      }

      // 如果还是找不到，尝试用名称查询
      if (error) {
        console.log('用slug查询失败，尝试用名称查询:', decodedSlug);
        const nameResult = await supabase
          .from('business_products')
          .select('*')
          .eq('name', decodedSlug)
          .eq('status', 'active')
          .single();
        data = nameResult.data;
        error = nameResult.error;
      }

      if (error) {
        console.error('获取产品配置失败:', error);
        toast.error("产品不存在或已下线");
        navigate('/', { replace: true });
        return;
      }

      if (data) {
        console.log('🔍 从数据库获取的产品数据:', data);
        console.log('🔍 产品名称:', data.name);
        console.log('🔍 产品slug:', data.slug);
        console.log('🔍 表单配置 form_config:', data.form_config);
        console.log('🔍 表单配置类型:', typeof data.form_config);
        console.log('🔍 表单配置长度:', data.form_config?.length);
        
        // 处理 quick_amounts 字段（可能是字符串或数组）
        let quickAmounts = [500, 1000, 2000, 5000];
        if (data.quick_amounts) {
          if (typeof data.quick_amounts === 'string') {
            quickAmounts = data.quick_amounts.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
          } else if (Array.isArray(data.quick_amounts)) {
            quickAmounts = data.quick_amounts;
          }
        }
        
        // 转换数据库字段到 ProductConfig 格式
        const config: ProductConfig = {
          baseRate: data.exchange_rate || data.base_rate || data.custom_exchange_rate || 7.2,
          discountRate: data.discount_rate || data.custom_discount_rate || 0.75,
          minAmount: data.min_amount || 100,
          maxAmount: data.max_amount || 50000,
          quickAmounts: quickAmounts,
          formConfig: data.form_config || [],
          workflowConfig: data.workflow_config || []
        };
        
        console.log('🚀 转换后的产品配置:', config);
        console.log('🚀 最终表单配置 formConfig:', config.formConfig);
        setProductConfig(config);
        setServiceTitle(data.name || '业务服务');
      }
    } catch (error) {
      console.error('获取产品配置失败:', error);
      toast.error("加载产品信息失败");
      navigate('/', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 如果没有从 state 获取到产品配置，则从数据库获取
    if (!productConfig && slug) {
      fetchProductConfig();
    }
  }, [slug, productConfig]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleTutorialOpen = () => {
    setIsTutorialOpen(true);
  };

  const handleSubmitSuccess = () => {
    navigate("/orders");
  };

  // 提交订单
  const handleSubmit = async () => {
    if (!user) {
      toast.error("请先登录");
      navigate("/login");
      return;
    }

    if (!productConfig) {
      toast.error("产品配置加载失败");
      return;
    }

    // 验证必填字段
    const requiredFields = formFields.filter(field => field.required);
    for (const field of requiredFields) {
      if (!formData[field.name || field.id]?.trim()) {
        toast.error(`请填写${field.label}`);
        return;
      }
    }

    // 获取金额字段
    const amountField = formFields.find(f => f.name === 'amount' || f.id === 'amount');
    const amount = amountField ? parseFloat(formData[amountField.name || amountField.id]) : 0;
    
    if (!amount || amount <= 0) {
      toast.error("请输入有效的金额");
      return;
    }

    if (amount < productConfig.minAmount || amount > productConfig.maxAmount) {
      toast.error(`金额范围：${productConfig.minAmount} - ${productConfig.maxAmount}`);
      return;
    }

    setIsSubmitting(true);
    try {
      // 计算实际消费金额（USDT）
      const actualAmountUSDT = parseFloat((amount * productConfig.discountRate / exchangeRate).toFixed(2));
      
      // 构建订单数据
      const orderData = {
        userId: user.id,
        businessType: serviceTitle,
        targetAccount: formData.account || formData.phone || formData.jd_account || '未填写',
        amount: amount,
        actualAmount: actualAmountUSDT,
        accountName: formData.name || formData.real_name || '未填写',
        metadata: {
          ...formData,
          service_type: slug,
          exchange_rate: exchangeRate,
          discount_rate: productConfig.discountRate,
          product_name: serviceTitle
        }
      };

      console.log('提交订单数据:', orderData);
      
      await createBusinessOrder(orderData);
      toast.success(`订单提交成功！实付: ${actualAmountUSDT} USDT`);
      navigate("/orders");
    } catch (error) {
      console.error("提交订单失败:", error);
      toast.error(error instanceof Error ? error.message : "提交订单失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 如果正在加载或没有产品配置，显示加载状态
  if (isLoading || !productConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">加载产品信息中...</p>
        </div>
      </div>
    );
  }

  // 计算折扣率和汇率
  const exchangeRate = productConfig.baseRate > 1 ? productConfig.baseRate : 7.2;
  const discountRate = productConfig.baseRate > 1 ? productConfig.discountRate : (1 - productConfig.baseRate);

  // 生成表单字段（基于productConfig.formConfig或使用默认字段）
  console.log('productConfig.formConfig:', productConfig.formConfig);
  
  const formFields = productConfig.formConfig && productConfig.formConfig.length > 0 
    ? productConfig.formConfig.map((field: any) => {
        console.log('处理表单字段:', field);
        return {
          id: field.id,
          name: field.id, // 使用id作为name
          label: field.label,
          type: field.type === 'tel' ? 'text' : field.type === 'link' ? 'text' : field.type, // 转换tel和link类型为text
          placeholder: field.placeholder,
          required: field.required,
          options: field.options,
          validation: field.type === 'number' ? {
            min: productConfig.minAmount,
            max: productConfig.maxAmount
          } : field.type === 'text' ? {
            minLength: 1,
            maxLength: 100
          } : undefined
        };
      })
    : [
        {
          id: 'account',
          name: 'account',
          label: '账号',
          type: 'text',
          placeholder: '请输入账号',
          required: true,
          validation: {
            minLength: 1,
            maxLength: 50
          }
        },
        {
          id: 'name', 
          name: 'name',
          label: '姓名',
          type: 'text',
          placeholder: '请输入姓名',
          required: false,
          validation: {
            minLength: 2,
            maxLength: 20
          }
        },
        {
          id: 'amount',
          name: 'amount', 
          label: '金额',
          type: 'number',
          placeholder: '请输入金额',
          required: true,
          validation: {
            min: productConfig.minAmount,
            max: productConfig.maxAmount
          }
        }
      ];

  // 生成教程内容（基于productConfig.workflowConfig或使用默认教程）
  const tutorialContent = productConfig.workflowConfig && productConfig.workflowConfig.length > 0
    ? {
        title: `${serviceTitle}使用教程`,
        steps: productConfig.workflowConfig.map((step: any, index: number) => ({
          title: step.title || `步骤${index + 1}`,
          items: [step.description || '请按照提示操作'],
          type: step.type || 'default'
        }))
      }
    : {
        title: `${serviceTitle}使用教程`,
        steps: [
          {
            title: '填写信息',
            items: ['请准确填写相关信息', '确保信息的真实性和有效性'],
            type: 'info'
          },
          {
            title: '确认订单',
            items: ['核对填写的信息', '确认金额和费率'],
            type: 'warning'
          },
          {
            title: '提交处理',
            items: ['点击提交按钮', '等待系统处理完成'],
            type: 'success'
          }
        ]
      };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white p-4 flex items-center">
        <Button
          variant="ghost"
          className="p-0 mr-3"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold flex-1 text-center mr-9">
          {serviceTitle}
        </h1>
      </div>

      {/* 主要内容 */}
      <div className="p-4">
        {/* 查看教程链接 */}
        <div className="mb-4">
          <Button
            variant="link"
            className="text-blue-500 p-0 h-auto font-normal text-sm"
            onClick={handleTutorialOpen}
          >
            查看操作教程 →
          </Button>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          {(() => {
            console.log('准备渲染表单，formFields:', formFields);
            console.log('准备渲染表单，quickAmounts:', productConfig.quickAmounts);
            console.log('准备渲染表单，serviceTitle:', serviceTitle);
            console.log('准备渲染表单，exchangeRate:', exchangeRate);
            console.log('准备渲染表单，discountRate:', discountRate);
            return null;
          })()}
          
          {/* 错误边界 */}
          {formFields && formFields.length > 0 ? (
            <EnhancedProductForm
              fields={formFields.map(field => ({
                name: field.name || field.id,
                label: field.label || '未知字段',
                type: field.type || 'text',
                placeholder: field.placeholder || '',
                required: field.required || false,
                options: field.options?.map(opt => ({
                  value: typeof opt === 'string' ? opt : opt.value || '',
                  label: typeof opt === 'string' ? opt : opt.label || ''
                })) || [],
                value: formData[field.name || field.id] || '',
                onChange: (value: string) => setFormData(prev => ({
                  ...prev,
                  [field.name || field.id]: value
                })),
                optional: !field.required
              }))}
              title={serviceTitle}
              description={`${serviceTitle}服务，享受优惠价格`}
              discount={`${Math.abs(discountRate * 10).toFixed(1)}`}
              exchangeRate={exchangeRate}
              quickAmounts={productConfig.quickAmounts?.map(String) || ['500', '1000', '2000']}
              showBatchMode={false}
              onSubmit={handleSubmit}
              submitButtonText="确认充值"
              isSubmitting={isSubmitting}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">暂无表单字段配置</p>
              <p className="text-sm text-gray-400 mt-2">请联系管理员配置产品表单</p>
            </div>
          )}
        </div>
      </div>

      {/* 教程对话框 */}
      <TutorialDialog 
        open={isTutorialOpen} 
        onOpenChange={setIsTutorialOpen}
        type="custom"
        tutorialContent={tutorialContent}
        productName={serviceTitle}
        productSlug={slug || 'generic'}
      />
    </div>
  );
};

export default GenericProductPage;