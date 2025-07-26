import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

interface StandardProductFormProps {
  fields: FormField[];
  title?: string;
  description?: string;
  discount?: string;
  exchangeRate?: number;
}

export const StandardProductForm = ({
  fields,
  title,
  description,
  discount,
  exchangeRate = 7.2
}: StandardProductFormProps) => {
  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'select':
        return (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
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
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg resize-none min-h-[100px]"
            placeholder={field.placeholder}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            required={field.required}
          />
        );
        
      default:
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            required={field.required}
            className="h-12 text-base"
          />
        );
    }
  };

  // 计算金额相关信息
  const amountField = fields.find(field => field.name === 'amount');
  const amount = amountField ? parseFloat(amountField.value) || 0 : 0;
  const finalAmount = discount ? amount * (parseFloat(discount) / 10) : amount;
  const usdtAmount = (finalAmount / exchangeRate).toFixed(2);

  return (
    <div className="space-y-4">
      {/* 产品信息 */}
      {(title || description) && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          {title && <h3 className="font-medium text-blue-900 mb-1">{title}</h3>}
          {description && <p className="text-blue-700 text-sm">{description}</p>}
          {discount && (
            <p className="text-red-600 font-medium text-sm mt-2">
              🎉 {discount}折优惠中！
            </p>
          )}
        </div>
      )}

      {/* 表单字段 */}
      {fields.map((field, index) => (
        <div key={index} className="space-y-2">
          <Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {renderField(field)}
        </div>
      ))}

      {/* 金额计算显示 */}
      {amount > 0 && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">原价:</span>
              <span className="font-medium">¥{amount.toFixed(2)}</span>
            </div>
            {discount && discount !== "10" && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">优惠折扣:</span>
                  <span className="text-red-600 font-medium">{discount}折</span>
                </div>
                <div className="flex justify-between border-t border-green-300 pt-2">
                  <span className="text-green-700 font-medium">实付金额:</span>
                  <span className="text-green-700 font-bold">¥{finalAmount.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-xs text-gray-500">
              <span>折合 USDT:</span>
              <span>${usdtAmount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 