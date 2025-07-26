
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CreditCardFormProps {
  cardInfo: string;
  onCardInfoChange: (value: string) => void;
  name: string;
  onNameChange: (value: string) => void;
  bankName: string;
  onBankNameChange: (value: string) => void;
  branchName: string;
  onBranchNameChange: (value: string) => void;
  customAmount: string;
  onCustomAmountChange: (value: string) => void;
  exchangeRate: number;
  onSwitchToBatch: () => void;
}

export const CreditCardForm = ({
  cardInfo,
  onCardInfoChange,
  name,
  onNameChange,
  bankName,
  onBankNameChange,
  branchName,
  onBranchNameChange,
  customAmount,
  onCustomAmountChange,
  exchangeRate,
  onSwitchToBatch
}: CreditCardFormProps) => {
  const [selectedAmount, setSelectedAmount] = useState<string>("");
  const quickAmounts = ["10000", "20000", "30000", "40000", "50000"];
  const discountRate = 0.35; // 6.5折 = 35% 的折扣

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
            <span className="text-gray-600">姓名</span>
            <Button 
              variant="default" 
              className="bg-[#1a237e] hover:bg-[#0d47a1]"
              onClick={onSwitchToBatch}
            >
              切换批量还款
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
          <div className="text-gray-600 mb-2">卡号</div>
          <Input
            placeholder="请输入信用卡号"
            value={cardInfo}
            onChange={(e) => onCardInfoChange(e.target.value)}
            className="bg-white text-lg"
          />
        </div>

        <div>
          <div className="text-gray-600 mb-2">银行名称</div>
          <Input
            placeholder="请输入银行名称"
            value={bankName}
            onChange={(e) => onBankNameChange(e.target.value)}
            className="bg-white"
          />
        </div>

        <div>
          <div className="text-gray-600 mb-2">开户行</div>
          <Input
            placeholder="请输入开户行"
            value={branchName}
            onChange={(e) => onBranchNameChange(e.target.value)}
            className="bg-white"
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
          <span className="text-gray-500">还款金额</span>
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
          <span className="text-gray-500 ml-2">6.5折 优惠 {(parseFloat(customAmount || "0") * discountRate).toFixed(2)}元</span>
        </div>
        <span className="text-gray-500">参考汇率: {exchangeRate}</span>
      </div>

      {/* 总计金额 */}
      <div className="flex justify-between items-center text-base">
        <span>合计:</span>
        <span className="text-orange-500">$ {((parseFloat(customAmount || "0") * (1 - discountRate)) / exchangeRate).toFixed(2)} USDT</span>
      </div>
    </div>
  );
};
