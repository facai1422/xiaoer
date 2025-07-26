import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProductConfig } from "@/hooks/useProductConfig";
import { createBusinessOrder } from "@/services/businessOrderService";
import { ProductPageTemplate } from "@/components/product/ProductPageTemplate";
import { EnhancedProductForm, FormField } from "@/components/product/EnhancedProductForm";
import { TutorialDialog } from "@/components/product/TutorialDialog";

const NetEaseGame = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    amount: "",
    gameType: "",
    account: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  // 使用动态产品配置
  const { config, displayDiscount } = useProductConfig({
    productSlug: 'netease-game',
    productName: '网易游戏充值',
    defaultConfig: {
      title: "网易游戏",
      subtitle: "网易游戏充值",
      description: "支持网易旗下各类热门游戏充值服务",
      submitButtonText: "立即充值",
      successMessage: "网易游戏充值提交成功！",
      tutorialText: "查看充值教程 →",
      exchangeRate: 7.2,
      discountRate: 0.85, // 8.5折
      quickAmounts: ["100", "300", "500", "1000", "2000", "5000"]
    }
  });

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleTutorialClick = () => {
    setTutorialOpen(true);
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
    
    if (!formData.gameType) {
      toast.error("请选择游戏类型");
      return;
    }
    
    if (!formData.account) {
      toast.error("请输入游戏账号");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 计算实际消费金额（USDT）
      const amountCNY = parseFloat(formData.amount);
      const actualAmountUSDT = parseFloat((amountCNY / config.exchangeRate).toFixed(2));
      
      const order = await createBusinessOrder({
        userId: user.id,
        businessType: "网易游戏充值",
        targetAccount: formData.account,
        amount: amountCNY,
        actualAmount: actualAmountUSDT,
        accountName: formData.account,
        metadata: {
          gameType: formData.gameType,
          account: formData.account,
          amount: formData.amount,
          exchange_rate: config.exchangeRate
        }
      });
      
      if (order) {
        setFormData({ amount: "", gameType: "", account: "" });
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

  const gameOptions = [
    { value: "mhxy", label: "梦幻西游" },
    { value: "dhxy", label: "大话西游" },
    { value: "yys", label: "阴阳师" },
    { value: "xyq", label: "逍遥情缘" },
    { value: "tzz", label: "天谕" },
    { value: "other", label: "其他网易游戏" }
  ];

  const formFields: FormField[] = [
    {
      name: "gameType",
      label: "游戏类型",
      type: "select",
      placeholder: "请选择游戏",
      required: true,
      options: gameOptions,
      value: formData.gameType,
      onChange: (value) => handleFieldChange("gameType", value)
    },
    {
      name: "account",
      label: "游戏账号",
      type: "text",
      placeholder: "请输入游戏账号",
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
    <div>
      <ProductPageTemplate
        title={config.title}
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

      {/* 教程对话框 */}
      <TutorialDialog
        open={tutorialOpen}
        onOpenChange={setTutorialOpen}
        type="default"
        productName="网易游戏"
      />
    </div>
  );
};

export default NetEaseGame;
