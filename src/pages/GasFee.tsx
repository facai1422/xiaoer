import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProductConfig } from "@/hooks/useProductConfig";
import { createBusinessOrder } from "@/services/businessOrderService";
import { ProductPageTemplate } from "@/components/product/ProductPageTemplate";
import { EnhancedProductForm, FormField } from "@/components/product/EnhancedProductForm";

const GasFee = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: "",
    account: "",
    region: ""
  });

  // 使用动态产品配置 - Hook会自动处理多种slug匹配
  const { config, displayDiscount, loading } = useProductConfig({
    productSlug: 'gas-fee',
    productName: '电费充值',
    defaultConfig: {
      title: "电费充值",
      subtitle: "电费缴费充值",
      description: "全国电费在线缴费，快速到账",
      submitButtonText: "立即充值",
      successMessage: "电费充值提交成功！",
      tutorialText: "查看缴费教程 →",
      showTutorial: true,
      exchangeRate: 7.2,
      discountRate: 0.95, // 9.5折
      quickAmounts: ["100", "200", "300", "500", "1000", "2000"]
    }
  });

  // 开发环境下显示配置信息
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 电费充值当前配置:', {
        exchangeRate: config.exchangeRate,
        discountRate: config.discountRate,
        displayDiscount: displayDiscount + '折',
        loading
      });
    }
  }, [config, displayDiscount, loading]);

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
      toast.error("请输入户号");
      return;
    }
    
    if (!formData.region) {
      toast.error("请选择地区");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 计算实际消费金额（USDT）
      const amountCNY = parseFloat(formData.amount);
      const actualAmountUSDT = parseFloat((amountCNY / config.exchangeRate).toFixed(2));
      
      const order = await createBusinessOrder({
        userId: user.id,
        businessType: "电费充值",
        targetAccount: formData.account,
        amount: amountCNY,
        actualAmount: actualAmountUSDT,
        accountName: formData.account,
        metadata: {
          account: formData.account,
          region: formData.region,
          amount: formData.amount,
          exchange_rate: config.exchangeRate
        }
      });
      
      if (order) {
        setFormData({ amount: "", account: "", region: "" });
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

  const regionOptions = [
    { value: "beijing", label: "北京" },
    { value: "shanghai", label: "上海" },
    { value: "guangdong", label: "广东" },
    { value: "jiangsu", label: "江苏" },
    { value: "zhejiang", label: "浙江" },
    { value: "shandong", label: "山东" },
    { value: "other", label: "其他地区" }
  ];

  const formFields: FormField[] = [
    {
      name: "region",
      label: "地区",
      type: "select",
      placeholder: "请选择地区",
      required: true,
      options: regionOptions,
      value: formData.region,
      onChange: (value) => handleFieldChange("region", value)
    },
    {
      name: "account",
      label: "户号",
      type: "text",
      placeholder: "请输入电费户号",
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
      onTutorialClick={() => toast.info("电费缴费教程开发中...")}
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

export default GasFee;
