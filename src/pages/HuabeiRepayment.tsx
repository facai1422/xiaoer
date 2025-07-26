import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProductConfig } from "@/hooks/useProductConfig";
import { createBusinessOrder } from "@/services/businessOrderService";
import { ProductPageTemplate } from "@/components/product/ProductPageTemplate";
import { EnhancedProductForm, FormField } from "@/components/product/EnhancedProductForm";

const HuabeiRepayment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    qrCode: "",
    amount: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 使用动态产品配置
  const { config, displayDiscount } = useProductConfig({
    productSlug: 'huabei-repayment',
    productName: '花呗代还',
    defaultConfig: {
      title: "花呗代还",
      subtitle: "支付宝花呗代还",
      description: "安全快速的花呗还款服务",
      submitButtonText: "立即还款",
      successMessage: "花呗还款提交成功！",
      tutorialText: "查看花呗还款教程 →",
      exchangeRate: 7.2,
      discountRate: 0.8, // 8折
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
    
    if (!formData.name) {
      toast.error("请输入姓名");
      return;
    }
    
    if (!formData.qrCode) {
      toast.error("请上传二维码");
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("请输入有效金额");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 计算实际消费金额（USDT）
      const amountCNY = parseFloat(formData.amount);
      const actualAmountUSDT = parseFloat((amountCNY / config.exchangeRate).toFixed(2));
      
      const order = await createBusinessOrder({
        userId: user.id,
        businessType: "花呗还款",
        targetAccount: formData.name, // 使用姓名作为目标账户
        amount: amountCNY,
        actualAmount: actualAmountUSDT,
        accountName: formData.name,
        metadata: {
          name: formData.name,
          qrCode: formData.qrCode,
          amount: formData.amount,
          exchange_rate: config.exchangeRate
        }
      });
      
      if (order) {
        setFormData({
          name: "",
          qrCode: "",
          amount: ""
        });
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
      name: "name",
      label: "姓名",
      type: "text",
      placeholder: "请输入姓名",
      required: true,
      value: formData.name,
      onChange: (value) => handleFieldChange("name", value)
    },
    {
      name: "qrCode",
      label: "二维码",
      type: "file",
      placeholder: "请上传花呗二维码截图",
      required: true,
      value: formData.qrCode,
      onChange: (value) => handleFieldChange("qrCode", value),
      accept: "image/*"
    },
    {
      name: "amount",
      label: "还款金额",
      type: "number",
      placeholder: "请输入花呗还款金额",
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
      onTutorialClick={() => toast.info("花呗还款教程开发中...")}
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

export default HuabeiRepayment;
