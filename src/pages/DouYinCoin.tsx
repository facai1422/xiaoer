import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProductConfig } from "@/hooks/useProductConfig";
import { createBusinessOrder } from "@/services/businessOrderService";
import { ProductPageTemplate } from "@/components/product/ProductPageTemplate";
import { EnhancedProductForm, FormField } from "@/components/product/EnhancedProductForm";
import { TutorialDialog } from "@/components/product/TutorialDialog";

const DouYinCoin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialContent, setTutorialContent] = useState(null);
  
  const [formData, setFormData] = useState({
    amount: "",
    account: ""
  });

  // 使用动态产品配置
  const { config, displayDiscount, loading, lastUpdated } = useProductConfig({
    productSlug: 'douyin-coin',
    productName: '抖音币充值',
    defaultConfig: {
      title: "抖音充值",
      subtitle: "抖音币充值",
      description: "快速充值抖音币，支持打赏、购买道具等",
      submitButtonText: "立即充值",
      successMessage: "抖音充值提交成功！",
      tutorialText: "查看充值教程 →",
      exchangeRate: 7.2,
      discountRate: 0.7, // 7折
      quickAmounts: ["100", "300", "500", "1000", "2000", "5000"],
      features: []
    }
  });

  // 添加调试信息
  useEffect(() => {
    if (!loading) {
      console.log('🔍 抖音充值页面配置调试信息:');
      console.log('- 产品slug:', 'douyin-coin');
      console.log('- 产品名称:', '抖音币充值');
      console.log('- 当前配置:', config);
      console.log('- 显示折扣:', displayDiscount);
      console.log('- 汇率:', config.exchangeRate);
      console.log('- 折扣率:', config.discountRate);
      
      // 在页面上也显示调试信息（开发环境）
      if (process.env.NODE_ENV === 'development') {
        const debugInfo = {
          slug: 'douyin-coin',
          name: '抖音币充值',
          exchangeRate: config.exchangeRate,
          discountRate: config.discountRate,
          displayDiscount: displayDiscount + '折'
        };
        
        // 临时在控制台显示配置
        setTimeout(() => {
          toast.info(`配置调试: ${displayDiscount}折, 汇率${config.exchangeRate}`, {
            duration: 5000
          });
        }, 1000);
      }
    }
  }, [loading, config, displayDiscount]);

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("请先登录");
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("请输入有效金额");
      return;
    }
    
    if (!formData.account) {
      toast.error("请输入抖音号");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 计算实际消费金额（USDT）
      const amountCNY = parseFloat(formData.amount);
      const actualAmountUSDT = parseFloat((amountCNY / config.exchangeRate).toFixed(2));
      
      const order = await createBusinessOrder({
        userId: user.id,
        businessType: "抖音币充值",
        targetAccount: formData.account,
        amount: amountCNY,
        actualAmount: actualAmountUSDT,
        accountName: formData.account,
        metadata: {
          account: formData.account,
          amount: formData.amount,
          exchange_rate: config.exchangeRate
        }
      });
      
      if (order) {
        setFormData({ amount: "", account: "" });
        toast.success(config.successMessage);
        navigate("/orders");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("提交失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTutorialClick = () => {
    setTutorialOpen(true);
  };

  const formFields: FormField[] = [
    {
      name: "account",
      label: "抖音号",
      type: "text",
      placeholder: "请输入抖音号或手机号",
      required: true,
      value: formData.account,
      onChange: (value) => handleFieldChange("account", value)
    },
    {
      name: "amount",
      label: "充值金额",
      type: "number",
      placeholder: "请输入充值金额",
      required: true,
      value: formData.amount,
      onChange: (value) => handleFieldChange("amount", value)
    }
  ];

  return (
    <div className="space-y-6">
      <ProductPageTemplate
        title={config.title}
        subtitle={config.subtitle}
        description={config.description}
        loading={loading}
        lastUpdated={lastUpdated}
        onSubmit={handleSubmit}
        submitText={isSubmitting ? "提交中..." : config.submitButtonText}
        showTutorial={config.showTutorial}
        tutorialText={config.tutorialText}
        onTutorialClick={handleTutorialClick}
      >
        <EnhancedProductForm
          fields={formFields}
          title={config.subtitle}
          description={config.description}
          discount={displayDiscount}
          exchangeRate={config.exchangeRate}
          quickAmounts={config.quickAmounts}
        />
      </ProductPageTemplate>

      {/* 开发环境显示调试信息 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mx-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">🔧 配置调试信息</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <div>产品Slug: douyin-coin</div>
            <div>当前折扣: {displayDiscount}折</div>
            <div>当前汇率: {config.exchangeRate}</div>
            <div>折扣率: {config.discountRate}</div>
            <div>配置来源: {loading ? '加载中...' : '已加载'}</div>
          </div>
        </div>
      )}

      {/* 显示特色功能 */}
      {config.features.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mx-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">服务特色</h3>
          <ul className="space-y-2">
            {config.features.map((feature, index) => (
              <li key={index} className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 教程对话框 */}
      <TutorialDialog
        open={tutorialOpen}
        onOpenChange={setTutorialOpen}
        type="douyinCoin"
        tutorialContent={tutorialContent}
        productName="抖音充值"
      />
    </div>
  );
};

export default DouYinCoin;
