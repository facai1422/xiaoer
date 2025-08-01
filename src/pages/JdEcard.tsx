import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProductConfig } from "@/hooks/useProductConfig";
import { createBusinessOrder } from "@/services/businessOrderService";
import { ProductPageTemplate } from "@/components/product/ProductPageTemplate";
import { EnhancedProductForm, FormField } from "@/components/product/EnhancedProductForm";

const JdEcard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: "",
    email: "",
    phone: "",
    name: "",
    baitiaoLink: ""
  });

  // 使用动态产品配置
  const { config, displayDiscount } = useProductConfig({
    productSlug: 'jd-ecard',
    productName: '京东E卡',
    defaultConfig: {
      title: "京东E卡",
      subtitle: "京东E卡充值",
      description: "京东商城购物卡，全场通用无限制",
      submitButtonText: "立即充值",
      successMessage: "京东E卡充值提交成功！",
      tutorialText: "查看使用教程 →",
      exchangeRate: 7.2,
      discountRate: 0.9, // 9.0折
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
    
    if (!formData.baitiaoLink.trim()) {
      toast.error("请输入白条链接");
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
        businessType: "京东白条",
        targetAccount: formData.email || formData.phone,
        amount: amountCNY,
        actualAmount: actualAmountUSDT,
        accountName: formData.name || "未填写",
        metadata: {
          name: formData.name,
          account: formData.email,
          phone: formData.phone,
          baitiao_link: formData.baitiaoLink,
          amount: formData.amount,
          exchange_rate: config.exchangeRate
        }
      });
      
      if (order) {
        setFormData({ amount: "", email: "", phone: "", name: "", baitiaoLink: "" });
        toast.success("京东白条订单提交成功！");
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
      name: "name",
      label: "姓名",
      type: "text",
      placeholder: "请输入姓名（选填）",
      required: false,
      value: formData.name,
      onChange: (value) => handleFieldChange("name", value)
    },
    {
      name: "email",
      label: "账号",
      type: "text",
      placeholder: "请输入账号（选填）",
      required: false,
      value: formData.email,
      onChange: (value) => handleFieldChange("email", value)
    },
    {
      name: "baitiaoLink",
      label: "白条链接",
      type: "text",
      placeholder: "请输入白条链接",
      required: true,
      value: formData.baitiaoLink,
      onChange: (value) => handleFieldChange("baitiaoLink", value)
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
      onTutorialClick={() => toast.info("京东E卡使用教程开发中...")}
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

export default JdEcard; 