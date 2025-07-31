import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EnhancedProductForm } from "@/components/product/EnhancedProductForm";
import { TutorialDialog } from "@/components/product/TutorialDialog";
import { toast } from "sonner";

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
  
  const state = location.state as LocationState;
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // 从路由状态中获取产品配置
  const productConfig = state?.productConfig;
  const serviceTitle = state?.serviceTitle || '业务服务';

  useEffect(() => {
    // 如果没有产品配置信息，说明是直接访问，需要重定向回首页
    if (!productConfig) {
      console.warn('缺少产品配置信息，重定向到首页');
      toast.error("产品信息不完整，请从首页重新选择");
      navigate('/', { replace: true });
    }
  }, [productConfig, navigate]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleTutorialOpen = () => {
    setIsTutorialOpen(true);
  };

  const handleSubmitSuccess = () => {
    navigate("/orders");
  };

  // 如果没有产品配置，显示加载状态
  if (!productConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  // 计算折扣率和汇率
  const exchangeRate = productConfig.baseRate > 1 ? productConfig.baseRate : 7.2;
  const discountRate = productConfig.baseRate > 1 ? productConfig.discountRate : (1 - productConfig.baseRate);

  // 生成表单字段（基于productConfig.formConfig或使用默认字段）
  const formFields = productConfig.formConfig && productConfig.formConfig.length > 0 
    ? productConfig.formConfig 
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
          <EnhancedProductForm
            fields={formFields.map(field => ({
              id: field.id,
              name: field.name,
              label: field.label,
              type: field.type,
              placeholder: field.placeholder,
              required: field.required,
              options: field.options,
              validation: field.validation
            }))}
            title={serviceTitle}
            description={`${serviceTitle}服务，享受优惠价格`}
            discount={`${(discountRate * 10).toFixed(1)}`}
            exchangeRate={exchangeRate}
            quickAmounts={productConfig.quickAmounts.map(String)}
            showBatchMode={false}
            onSubmitSuccess={handleSubmitSuccess}
          />
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