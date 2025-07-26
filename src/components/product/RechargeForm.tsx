
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface RechargeFormProps {
  cardInfo: string;
  onCardInfoChange: (value: string) => void;
  name: string;
  onNameChange: (value: string) => void;
  customAmount: string;
  onCustomAmountChange: (value: string) => void;
  exchangeRate: number;
  onSwitchToBatch: () => void;
}

export const RechargeForm = ({
  cardInfo,
  onCardInfoChange,
  name,
  onNameChange,
  customAmount,
  onCustomAmountChange,
  exchangeRate,
  onSwitchToBatch
}: RechargeFormProps) => {
  const [selectedAmount, setSelectedAmount] = useState<string>("");
  const quickAmounts = ["300", "500", "1000", "1500", "2000", "3000"];

  const handleQuickAmountSelect = (amount: string) => {
    setSelectedAmount(amount);
    onCustomAmountChange(amount);
  };

  return (
    <div className="space-y-4">
      {/* 头部输入区域 */}
      <div className="bg-blue-100 rounded-xl p-4 space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">姓名 (输入姓名选填)</span>
            <Button 
              variant="default" 
              className="bg-[#1a237e] hover:bg-[#0d47a1]"
              onClick={onSwitchToBatch}
            >
              切换批量充值
            </Button>
          </div>
          <Input
            placeholder="请输入姓名"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="bg-white"
          />
        </div>

        <div>
          <div className="text-gray-600 mb-2">充值号码</div>
          <Input
            placeholder="请输入手机号码"
            value={cardInfo}
            onChange={(e) => onCardInfoChange(e.target.value)}
            className="bg-white text-lg"
          />
        </div>
      </div>

      {/* 快速选择金额 */}
      <div>
        <div className="text-gray-600 mb-2">快速选择</div>
        <div className="grid grid-cols-3 gap-3">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              className={`py-3 rounded-lg border ${
                selectedAmount === amount
                  ? "border-blue-500 bg-blue-50 text-blue-500"
                  : "border-gray-200 bg-white"
              }`}
              onClick={() => handleQuickAmountSelect(amount)}
            >
              {amount}
            </button>
          ))}
        </div>
      </div>

      {/* 实充金额 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">实充金额</span>
          <div className="flex items-center">
            <span className="text-gray-500 mr-1">¥</span>
            <input
              type="text"
              value={customAmount}
              onChange={(e) => onCustomAmountChange(e.target.value)}
              className="w-24 text-right outline-none bg-transparent"
              placeholder="输入金额"
            />
          </div>
        </div>
      </div>

      {/* 折扣信息 */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center">
          <span className="text-orange-500 bg-orange-50 px-2 py-1 rounded">折扣</span>
          <span className="text-gray-500 ml-2">优惠 {(parseFloat(customAmount || "0") * 0.2).toFixed(2)}元</span>
        </div>
        <span className="text-gray-500">参考汇率: {exchangeRate}</span>
      </div>

      {/* 总计金额 */}
      <div className="flex justify-between items-center text-base">
        <span>合计:</span>
        <span className="text-orange-500">$ {((parseFloat(customAmount || "0") * 0.8) / exchangeRate).toFixed(2)} USDT</span>
      </div>
    </div>
  );
};
