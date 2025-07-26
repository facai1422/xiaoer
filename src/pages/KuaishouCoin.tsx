import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProductConfig } from "@/hooks/useProductConfig";
import { createBusinessOrder } from "@/services/businessOrderService";
import { ProductPageTemplate } from "@/components/product/ProductPageTemplate";
import { EnhancedProductForm, FormField } from "@/components/product/EnhancedProductForm";

const KuaishouCoin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: "",
    account: ""
  });

  // 使用动态产品配置
  const { config, displayDiscount } = useProductConfig({
    productSlug: 'kuaishou-coin',
    productName: '快手币充值',
    defaultConfig: {
      title: "快手币充值",
      subtitle: "快手币充值",
      description: "快速充值快手币，支持打赏、购买道具等",
      submitButtonText: "立即充值",
      successMessage: "快手币充值提交成功！",
      tutorialText: "查看充值教程 →",
      exchangeRate: 7.2,
      discountRate: 0.7, // 7折
      quickAmounts: ["100", "300", "500", "1000", "2000", "5000"]
    }
  });

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
      toast.error("请输入快手号");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 计算实际消费金额（USDT）
      const amountCNY = parseFloat(formData.amount);
      const actualAmountUSDT = parseFloat((amountCNY / config.exchangeRate).toFixed(2));
      
      const order = await createBusinessOrder({
        userId: user.id,
        businessType: "快手币充值",
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

  const formFields: FormField[] = [
    {
      name: "account",
      label: "快手号",
      type: "text",
      placeholder: "请输入快手号或手机号",
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
    <ProductPageTemplate
      title={config.title}
      onSubmit={handleSubmit}
      submitText={isSubmitting ? "提交中..." : config.submitButtonText}
      showTutorial={config.showTutorial}
      tutorialText={config.tutorialText}
      onTutorialClick={() => toast.info("快手币充值教程开发中...")}
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
  );
};

export default KuaishouCoin;
