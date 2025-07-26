import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProductConfig } from "@/hooks/useProductConfig";
import { createBusinessOrder } from "@/services/businessOrderService";
import { ProductPageTemplate } from "@/components/product/ProductPageTemplate";
import { EnhancedProductForm, FormField } from "@/components/product/EnhancedProductForm";

const FangxinLoan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: "",
    phone: ""
  });

  // 使用动态产品配置
  const { config, displayDiscount } = useProductConfig({
    productSlug: 'fangxin-loan',
    productName: '放心借',
    defaultConfig: {
      title: "放心借",
      subtitle: "放心借代还服务",
      description: "安全快速的放心借代还服务",
      submitButtonText: "立即代还",
      successMessage: "放心借代还提交成功！",
      tutorialText: "查看代还教程 →",
      exchangeRate: 7.2,
      discountRate: 0.9, // 9折
      quickAmounts: ["500", "1000", "2000", "3000", "5000", "10000"]
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
        businessType: "放心借",
        targetAccount: formData.phone,
        amount: amountCNY,
        actualAmount: actualAmountUSDT,
        accountName: formData.phone,
        metadata: {
          phone: formData.phone,
          amount: formData.amount,
          exchange_rate: config.exchangeRate
        }
      });
      
      if (order) {
        setFormData({ amount: "", phone: "" });
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
      name: "phone",
      label: "手机号",
      type: "text",
      placeholder: "请输入绑定放心借的手机号",
      required: true,
      value: formData.phone,
      onChange: (value) => handleFieldChange("phone", value)
    },
    {
      name: "amount",
      label: "代还金额",
      type: "number",
      placeholder: "请输入代还金额",
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
      onTutorialClick={() => toast.info("放心借代还教程开发中...")}
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

export default FangxinLoan;
