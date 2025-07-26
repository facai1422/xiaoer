import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { createBusinessOrder } from "@/services/businessOrderService";
import { ProductPageTemplate } from "@/components/product/ProductPageTemplate";
import { EnhancedProductForm, FormField } from "@/components/product/EnhancedProductForm";
import { TutorialDialog } from "@/components/product/TutorialDialog";
import { getProductBySlug, BusinessProduct } from "@/services/businessProductsService";

interface ProductConfig {
  title: string;
  subtitle: string;
  description: string;
  submitButtonText: string;
  successMessage: string;
  tutorialText: string;
  showTutorial: boolean;
  exchangeRate: number;
  discountRate: number;
  quickAmounts: string[];
  features: string[];
}

// 自定义教程内容类型
interface TutorialContent {
  title: string;
  steps: Array<{
    title: string;
    items: string[];
    type?: 'info' | 'warning' | 'success' | 'default';
  }>;
}

const CreditCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialContent, setTutorialContent] = useState<TutorialContent | null>(null);
  const [productSlug, setProductSlug] = useState<string>("credit-card");
  
  const [config, setConfig] = useState<ProductConfig>({
    title: "信用卡还款",
    subtitle: "1-5万信用卡代还",
    description: "快速还款安全可靠，支持各大银行信用卡",
    submitButtonText: "立即还款",
    successMessage: "还款提交成功！",
    tutorialText: "查看还款教程 →",
    showTutorial: true,
    exchangeRate: 7.2,
    discountRate: 0.75,
    quickAmounts: ["1000", "3000", "5000", "10000", "20000", "50000"],
    features: []
  });
  
  const [formData, setFormData] = useState({
    amount: "",
    name: "",
    cardNumber: "",
    bankName: ""
  });

  useEffect(() => {
    loadProductConfig();
  }, []);

  const loadProductConfig = async () => {
    try {
      // 尝试通过slug获取产品
      let creditCardProduct = await getProductBySlug('credit-card-repayment');
      
      // 如果没找到，尝试其他可能的slug
      if (!creditCardProduct) {
        creditCardProduct = await getProductBySlug('credit-card');
      }
      
      // 如果还是没找到，使用getAllBusinessProducts搜索
      if (!creditCardProduct) {
        const { getAllBusinessProducts } = await import('@/services/businessProductsService');
        const allProducts = await getAllBusinessProducts();
        creditCardProduct = allProducts.find(p => 
          p.name.includes('信用卡') || 
          p.slug.includes('credit-card') ||
          p.category === '代还服务'
        ) || null;
      }

      if (creditCardProduct) {
        // 设置产品slug
        setProductSlug(creditCardProduct.slug || "credit-card");
        
        // 确定汇率：优先使用base_rate（如果>1则是汇率），否则使用默认值
        const exchangeRate = creditCardProduct.base_rate > 1 
          ? creditCardProduct.base_rate 
          : 7.2;
        
        // 确定折扣：如果base_rate<=1则是折扣率，否则使用discount_rate
        const discountRate = creditCardProduct.base_rate <= 1 
          ? creditCardProduct.base_rate 
          : creditCardProduct.discount_rate || 0.75;
        
        setConfig({
          title: creditCardProduct.name || "信用卡还款",
          subtitle: "1-5万信用卡代还",
          description: creditCardProduct.description || "快速还款安全可靠，支持各大银行信用卡",
          submitButtonText: "立即还款",
          successMessage: "还款提交成功！",
          tutorialText: "查看还款教程 →",
          showTutorial: true,
          exchangeRate: exchangeRate,
          discountRate: discountRate,
          quickAmounts: creditCardProduct.quick_amounts?.map(String) || ["1000", "3000", "5000", "10000", "20000", "50000"],
          features: []
        });
        
        console.log('产品配置加载完成:', {
          name: creditCardProduct.name,
          exchangeRate: exchangeRate,
          discountRate: discountRate,
          base_rate: creditCardProduct.base_rate,
          discount_rate: creditCardProduct.discount_rate
        });
      }
    } catch (error) {
      console.error('加载产品配置失败:', error);
      // 使用默认配置，不影响用户使用
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("请先登录");
      navigate("/login");
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("请输入有效金额");
      return;
    }
    
    if (!formData.name) {
      toast.error("请输入持卡人姓名");
      return;
    }
    
    if (!formData.cardNumber) {
      toast.error("请输入信用卡号");
      return;
    }
    
    if (!formData.bankName) {
      toast.error("请输入开户行");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 计算实际消费金额（USDT）
      const amountCNY = parseFloat(formData.amount);
      const actualAmountUSDT = parseFloat((amountCNY / config.exchangeRate).toFixed(2));
      
      const order = await createBusinessOrder({
        userId: user.id,
        businessType: "信用卡还款",
        targetAccount: formData.cardNumber,
        amount: amountCNY,
        actualAmount: actualAmountUSDT,
        accountName: formData.name,
        metadata: {
          name: formData.name,
          cardNumber: formData.cardNumber,
          bankName: formData.bankName,
          amount: formData.amount,
          exchange_rate: config.exchangeRate
        }
      });
      
      if (order) {
        setFormData({
          amount: "",
          name: "",
          cardNumber: "",
          bankName: ""
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
      placeholder: "请输入持卡人姓名",
      required: true,
      value: formData.name,
      onChange: (value) => handleFieldChange("name", value)
    },
    {
      name: "cardNumber",
      label: "卡号",
      type: "text",
      placeholder: "请输入信用卡号",
      required: true,
      value: formData.cardNumber,
      onChange: (value) => handleFieldChange("cardNumber", value)
    },
    {
      name: "bankName",
      label: "开户行",
      type: "text",
      placeholder: "请输入开户银行",
      required: true,
      value: formData.bankName,
      onChange: (value) => handleFieldChange("bankName", value)
    },
    {
      name: "amount",
      label: "还款金额",
      type: "number",
      placeholder: "请输入还款金额",
      required: true,
      value: formData.amount,
      onChange: (value) => handleFieldChange("amount", value)
    }
  ];

  return (
    <div className="space-y-6">
      <ProductPageTemplate
        title={config.title}
        onSubmit={handleSubmit}
        submitText={isSubmitting ? "提交中..." : config.submitButtonText}
        showTutorial={config.showTutorial}
        tutorialText={config.tutorialText}
        onTutorialClick={() => setTutorialOpen(true)}
      >
        <EnhancedProductForm
          fields={formFields}
          title={config.subtitle}
          description={config.description}
          discount={(config.discountRate * 10).toFixed(1)}
          quickAmounts={config.quickAmounts}
          exchangeRate={config.exchangeRate}
        />
      </ProductPageTemplate>

      {/* 显示特色功能 */}
      {config.features.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mx-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">服务特色</h3>
          <ul className="space-y-2">
            {config.features.map((feature, index) => (
              <li key={index} className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 教程对话框 - 支持自定义内容 */}
      <TutorialDialog
        open={tutorialOpen}
        onOpenChange={setTutorialOpen}
        type="creditCard"
        tutorialContent={tutorialContent}
        productName={config.title}
        productSlug={productSlug}
      />
    </div>
  );
};

export default CreditCard;
