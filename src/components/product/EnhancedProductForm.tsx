import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { X } from "lucide-react";

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'phone' | 'file' | 'email';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  optional?: boolean; // 是否为选填字段
  accept?: string; // 文件上传的accept属性
}

interface EnhancedProductFormProps {
  fields: FormField[];
  title?: string;
  description?: string;
  discount?: string;
  exchangeRate?: number;
  quickAmounts?: string[];
  showBatchMode?: boolean;
  onSwitchToBatch?: () => void;
  batchButtonText?: string;
}

export const EnhancedProductForm = ({
  fields,
  title,
  description,
  discount = "8",
  exchangeRate = 7.2,
  quickAmounts = ["300", "500", "1000", "1500", "2000", "3000"],
  showBatchMode = false,
  onSwitchToBatch,
  batchButtonText = "切换批量充值"
}: EnhancedProductFormProps) => {
  const [selectedAmount, setSelectedAmount] = useState<string>("");
  const [filePreview, setFilePreview] = useState<{[key: string]: string}>({});

  // 查找金额字段
  const amountField = fields.find(field => field.name === 'amount' || field.name === 'customAmount');
  const amount = amountField ? parseFloat(amountField.value) || 0 : 0;
  
  // 计算折扣和汇率 - 修复计算逻辑
  const discountRate = parseFloat(discount) / 10; // 8.5 -> 0.85
  const finalAmount = amount * discountRate; // 折扣后价格
  const discountAmount = amount - finalAmount; // 优惠金额
  const usdtAmount = (finalAmount / exchangeRate).toFixed(2);

  const handleQuickAmountSelect = (quickAmount: string) => {
    setSelectedAmount(quickAmount);
    if (amountField) {
      amountField.onChange(quickAmount);
    }
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'select':
        return (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              {field.options?.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="bg-white hover:bg-gray-100 text-gray-900"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'textarea':
        return (
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg resize-none min-h-[100px] bg-white"
            placeholder={field.placeholder}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            required={field.required}
          />
        );
        
      case 'phone':
        return (
          <Input
            type="text"
            placeholder={field.placeholder}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            required={field.required}
            className="bg-white text-lg h-12"
          />
        );
        
      case 'file': {
        const previewUrl = filePreview[field.name];
        return (
          <div className="space-y-3">
            {!field.value ? (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">点击上传</span> 或拖拽文件到此处
                    </p>
                    <p className="text-xs text-gray-500">支持 PNG, JPG, JPEG 格式</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept={field.accept || "image/*"}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // 创建预览URL
                        const url = URL.createObjectURL(file);
                        setFilePreview(prev => ({
                          ...prev,
                          [field.name]: url
                        }));
                        
                        // 保存图片URL而不是文件名，这样订单详情可以显示图片
                        field.onChange(url);
                      }
                    }}
                    required={field.required}
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                {/* 图片预览 */}
                {previewUrl && (
                  <div className="relative inline-block">
                    <img 
                      src={previewUrl} 
                      alt="预览" 
                      className="max-w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFilePreview(prev => {
                          const newPreview = { ...prev };
                          delete newPreview[field.name];
                          return newPreview;
                        });
                        field.onChange("");
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {/* 文件信息 */}
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded flex items-center justify-between">
                  <span>已选择文件：{field.value}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFilePreview(prev => {
                        const newPreview = { ...prev };
                        delete newPreview[field.name];
                        return newPreview;
                      });
                      field.onChange("");
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    删除
                  </button>
                </div>
              </div>
                         )}
           </div>
         );
       }
         
       default:
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            required={field.required}
            className="bg-white h-12"
          />
        );
    }
  };

  // 分离主要输入字段和金额字段
  const mainFields = fields.filter(f => f.name !== 'amount' && f.name !== 'customAmount');
  
  return (
    <div className="space-y-4">
      {/* 产品信息 - 居中显示，只显示标题和图标 */}
      {title && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex flex-col items-center justify-center text-center">
            {/* 电费图标 */}
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-medium text-blue-900">{title}</h3>
          </div>
        </div>
      )}

      {/* 主要输入区域 - 模仿话费充值的蓝色背景样式 */}
      <div className="bg-blue-100 rounded-xl p-4 space-y-4">
        {mainFields.map((field, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">
                {field.label}
                {field.optional && " (选填)"}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
              {index === 0 && showBatchMode && onSwitchToBatch && (
                <Button 
                  variant="default" 
                  className="bg-[#1a237e] hover:bg-[#0d47a1] text-sm"
                  onClick={onSwitchToBatch}
                >
                  {batchButtonText}
                </Button>
              )}
            </div>
            {renderField(field)}
          </div>
        ))}
      </div>

      {/* 快速选择金额 */}
      {amountField && quickAmounts.length > 0 && (
        <div>
          <div className="text-gray-600 mb-2">快速选择</div>
          <div className="grid grid-cols-3 gap-3">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                className={`py-3 rounded-lg border transition-colors ${
                  selectedAmount === quickAmount
                    ? "border-blue-500 bg-blue-50 text-blue-500"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                onClick={() => handleQuickAmountSelect(quickAmount)}
              >
                {quickAmount}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 实充金额输入 */}
      {amountField && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">实充金额</span>
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">¥</span>
              <input
                type="number"
                value={amountField.value}
                onChange={(e) => amountField.onChange(e.target.value)}
                className="w-24 text-right outline-none bg-transparent"
                placeholder="输入金额"
              />
            </div>
          </div>
        </div>
      )}

      {/* 结算信息 - 重新设计布局 */}
      {amount > 0 && (
        <div className="bg-white border rounded-lg p-4 space-y-3">
          {/* 充值金额 */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">充值金额</span>
            <span className="font-medium">¥{amount}</span>
          </div>
          
          {/* 优惠折扣 */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">优惠折扣</span>
            <span className="text-green-600 font-medium">{discount}折</span>
          </div>
          
          {/* 优惠金额 */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">优惠金额</span>
            <span className="text-green-600 font-medium">¥{discountAmount.toFixed(2)}</span>
          </div>
          
          {/* 参考汇率 */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">参考汇率</span>
            <span className="font-medium">{exchangeRate}</span>
          </div>
          
          {/* 实付金额 */}
          <div className="flex justify-between items-center text-lg font-semibold border-t pt-3">
            <span className="text-gray-800">实付金额</span>
            <span className="text-blue-600">{usdtAmount} USDT</span>
          </div>
        </div>
      )}
    </div>
  );
}; 