import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProductConfig } from "@/hooks/useProductConfig";
import { createBusinessOrder } from "@/services/businessOrderService";
import { ProductPageTemplate } from "@/components/product/ProductPageTemplate";
import { EnhancedProductForm, FormField } from "@/components/product/EnhancedProductForm";

const OilCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: "",
    cardType: "",
    phone: ""
  });

  // 使用动态产品配置
  const { config, displayDiscount } = useProductConfig({
    productSlug: 'oil-card',
    productName: '石化加油卡',
    defaultConfig: {
      title: "石化加油卡",
      subtitle: "石化加油卡充值",
      description: "中石化加油卡在线充值，全国通用",
      submitButtonText: "立即充值",
      successMessage: "石化加油卡充值提交成功！",
      tutorialText: "查看充值教程 →",
      exchangeRate: 7.2,
      discountRate: 0.95, // 9.5折
      quickAmounts: ["100", "200", "500", "1000", "2000", "5000"]
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
    
    if (!formData.cardType) {
      toast.error("请选择卡类型");
      return;
    }
    
    if (!formData.phone) {
      toast.error("请输入手机号");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 计算实际消费金额（USDT）
      const amountCNY = parseFloat(formData.amount);
      const actualAmountUSDT = parseFloat((amountCNY / config.exchangeRate).toFixed(2));
      
      const order = await createBusinessOrder({
        userId: user.id,
        businessType: "石化加油卡",
        targetAccount: formData.phone,
        amount: amountCNY,
        actualAmount: actualAmountUSDT,
        accountName: formData.phone,
        metadata: {
          cardType: formData.cardType,
          phone: formData.phone,
          amount: formData.amount,
          exchange_rate: config.exchangeRate
        }
      });
      
      if (order) {
        setFormData({ amount: "", cardType: "", phone: "" });
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

  const cardOptions = [
    { value: "sinopec", label: "中石化加油卡" },
    { value: "cnpc", label: "中石油加油卡" }
  ];

  const formFields: FormField[] = [
    {
      name: "cardType",
      label: "卡类型",
      type: "select",
      placeholder: "请选择加油卡类型",
      required: true,
      options: cardOptions,
      value: formData.cardType,
      onChange: (value) => handleFieldChange("cardType", value)
    },
    {
      name: "phone",
      label: "手机号",
      type: "text",
      placeholder: "请输入手机号",
      required: true,
      value: formData.phone,
      onChange: (value) => handleFieldChange("phone", value)
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
      onTutorialClick={() => toast.info("加油卡充值教程开发中...")}
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

export default OilCard;
