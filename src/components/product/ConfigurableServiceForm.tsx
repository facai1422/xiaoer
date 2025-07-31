import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { toast } from "sonner";
import { 
  FileText, 
  Mail, 
  Phone, 
  Lock, 
  Link as LinkIcon, 
  QrCode,
  Upload,
  X,
  Eye,
  EyeOff
} from "lucide-react";
import { 
  type ConfigurableService, 
  type ConfigurableFormField,
  createConfigurableServiceOrder 
} from "@/services/configurableServicesService";

interface ConfigurableServiceFormProps {
  service: ConfigurableService;
  onSubmitSuccess?: () => void;
}

export const ConfigurableServiceForm = ({ service, onSubmitSuccess }: ConfigurableServiceFormProps) => {
  const { user } = useAuth();
  const { balance } = useWalletBalance();
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<string>("");
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [filePreview, setFilePreview] = useState<Record<string, string>>({});

  // 获取金额字段
  const amountField = service.form_fields.find(field => field.name === 'amount' || field.type === 'number');
  const amount = amountField ? parseFloat(formData[amountField.name] || "0") : 0;
  
  // 计算折扣和汇率
  const discountAmount = amount * (1 - service.discount_rate);
  const finalAmount = amount * service.discount_rate;
  const usdtAmount = (finalAmount / service.exchange_rate).toFixed(2);

  // 初始化表单数据
  useEffect(() => {
    const initialData: Record<string, any> = {};
    service.form_fields.forEach(field => {
      initialData[field.name] = '';
    });
    setFormData(initialData);
  }, [service.form_fields]);

  // 处理快速金额选择
  const handleQuickAmountSelect = (quickAmount: string) => {
    setSelectedAmount(quickAmount);
    if (amountField) {
      setFormData(prev => ({
        ...prev,
        [amountField.name]: quickAmount
      }));
    }
  };

  // 处理字段值变化
  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // 处理文件上传
  const handleFileChange = (fieldName: string, file: File | null) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFilePreview(prev => ({
        ...prev,
        [fieldName]: url
      }));
      handleFieldChange(fieldName, url);
    } else {
      setFilePreview(prev => {
        const newPreview = { ...prev };
        delete newPreview[fieldName];
        return newPreview;
      });
      handleFieldChange(fieldName, '');
    }
  };

  // 验证表单
  const validateForm = (): string | null => {
    for (const field of service.form_fields) {
      const value = formData[field.name];
      
      if (field.required && (!value || value.toString().trim() === '')) {
        return `请填写${field.label}`;
      }
      
      if (value && field.validation) {
        const validation = field.validation;
        
        // 长度验证
        if (validation.minLength && value.length < validation.minLength) {
          return `${field.label}长度不能少于${validation.minLength}个字符`;
        }
        if (validation.maxLength && value.length > validation.maxLength) {
          return `${field.label}长度不能超过${validation.maxLength}个字符`;
        }
        
        // 数值验证
        if (field.type === 'number') {
          const num = parseFloat(value);
          if (validation.min !== undefined && num < validation.min) {
            return `${field.label}不能小于${validation.min}`;
          }
          if (validation.max !== undefined && num > validation.max) {
            return `${field.label}不能大于${validation.max}`;
          }
        }
        
        // 正则验证
        if (validation.pattern) {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(value)) {
            switch (field.type) {
              case 'phone':
                return '请输入有效的手机号码';
              case 'email':
                return '请输入有效的邮箱地址';
              default:
                return `${field.label}格式不正确`;
            }
          }
        }
      }
    }
    
    return null;
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!user) {
      toast.error("请先登录");
      return;
    }

    // 表单验证
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // 余额验证
    const requiredUSDT = parseFloat(usdtAmount);
    if (requiredUSDT > balance) {
      toast.error(`余额不足，需要 ${usdtAmount} USDT，当前余额 ${balance.toFixed(2)} USDT`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createConfigurableServiceOrder({
        userId: user.id,
        serviceId: service.id,
        serviceName: service.name,
        amount: amount,
        actualAmount: requiredUSDT,
        formData: formData,
        metadata: {
          exchange_rate: service.exchange_rate,
          discount_rate: service.discount_rate,
          discount: `${(service.discount_rate * 10).toFixed(1)}折`
        }
      });

      toast.success("订单提交成功！");
      
      // 重置表单
      const resetData: Record<string, any> = {};
      service.form_fields.forEach(field => {
        resetData[field.name] = '';
      });
      setFormData(resetData);
      setSelectedAmount("");
      setFilePreview({});
      
      onSubmitSuccess?.();
    } catch (error) {
      console.error("提交失败:", error);
      toast.error("提交失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 渲染字段
  const renderField = (field: ConfigurableFormField) => {
    const value = formData[field.name] || '';
    
    switch (field.type) {
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleFieldChange(field.name, val)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="min-h-[100px] bg-white"
            required={field.required}
          />
        );
        
      case 'password':
        return (
          <div className="relative">
            <Input
              type={showPassword[field.name] ? "text" : "password"}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className="bg-white pr-10"
              required={field.required}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(prev => ({
                ...prev,
                [field.name]: !prev[field.name]
              }))}
            >
              {showPassword[field.name] ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        );
        
      case 'file':
        const previewUrl = filePreview[field.name];
        return (
          <div className="space-y-3">
            {!value ? (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">点击上传</span> 或拖拽文件到此处
                    </p>
                    <p className="text-xs text-gray-500">支持 PNG, JPG, JPEG 格式</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(field.name, e.target.files?.[0] || null)}
                    required={field.required}
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                {previewUrl && (
                  <div className="relative inline-block">
                    <img 
                      src={previewUrl} 
                      alt="预览" 
                      className="max-w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => handleFileChange(field.name, null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
        
      case 'number':
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="bg-white"
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );
        
      default:
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="bg-white"
            required={field.required}
          />
        );
    }
  };

  // 获取字段图标
  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-5 h-5 text-blue-500" />;
      case 'phone': return <Phone className="w-5 h-5 text-green-500" />;
      case 'password': return <Lock className="w-5 h-5 text-red-500" />;
      case 'url': return <LinkIcon className="w-5 h-5 text-purple-500" />;
      case 'qrcode': return <QrCode className="w-5 h-5 text-gray-500" />;
      default: return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 服务信息 */}
      <div className="bg-blue-50 rounded-xl p-4">
        <div className="flex items-center justify-center text-center">
          {service.logo_url && (
            <img 
              src={service.logo_url} 
              alt={service.name}
              className="w-12 h-12 rounded object-cover mb-2"
            />
          )}
          <div>
            <h3 className="font-medium text-blue-900">{service.name}</h3>
            <p className="text-sm text-blue-600">{service.description}</p>
          </div>
        </div>
      </div>

      {/* 表单字段 */}
      <div className="bg-blue-100 rounded-xl p-4 space-y-4">
        {service.form_fields.map((field, index) => (
          <div key={field.id}>
            <div className="flex items-center mb-2">
              {getFieldIcon(field.type)}
              <Label className="ml-2 text-gray-600">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            {renderField(field)}
          </div>
        ))}
      </div>

      {/* 快速选择金额 */}
      {amountField && service.quick_amounts && service.quick_amounts.length > 0 && (
        <div>
          <div className="text-gray-600 mb-2">快速选择</div>
          <div className="grid grid-cols-3 gap-3">
            {service.quick_amounts.map((quickAmount) => (
              <button
                key={quickAmount}
                className={`py-3 rounded-lg border transition-colors ${
                  selectedAmount === quickAmount.toString()
                    ? "border-blue-500 bg-blue-50 text-blue-500"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                onClick={() => handleQuickAmountSelect(quickAmount.toString())}
              >
                {quickAmount}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 金额计算显示 */}
      {amount > 0 && (
        <div className="space-y-3">
          {/* 折扣信息 */}
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center">
              <span className="text-orange-500 bg-orange-50 px-2 py-1 rounded text-xs">折扣</span>
              <span className="text-gray-500 ml-2">优惠 {discountAmount.toFixed(2)}元</span>
            </div>
            <span className="text-gray-500">参考汇率: {service.exchange_rate}</span>
          </div>

          {/* 总计金额 */}
          <div className="flex justify-between items-center text-lg font-medium">
            <span className="text-gray-700">合计支付:</span>
            <span className="text-orange-500 font-bold">$ {usdtAmount} USDT</span>
          </div>

          {/* 当前钱包余额提示 */}
          <div className="text-xs text-gray-500 text-center bg-blue-50 py-2 px-3 rounded">
            <span>💳 当前钱包余额: {balance.toFixed(2)} USDT</span>
          </div>
        </div>
      )}

      {/* 提交按钮 */}
      <Button 
        className="w-full bg-[#1a237e] hover:bg-[#0d47a1] text-white py-3"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "提交中..." : "确认提交"}
      </Button>
    </div>
  );
};