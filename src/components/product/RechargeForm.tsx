
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { queryPhoneBalance, formatBalance, getOperatorColor } from "@/services/phoneBalanceService";
import { Loader2, Smartphone, Signal } from "lucide-react";

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
  const [isQueryingBalance, setIsQueryingBalance] = useState(false);
  const [balanceInfo, setBalanceInfo] = useState<{
    balance: string;
    operator: string;
    province: string;
    city: string;
  } | null>(null);
  const [balanceError, setBalanceError] = useState<string>("");
  const quickAmounts = ["300", "500", "1000", "1500", "2000", "3000"];

  const handleQuickAmountSelect = (amount: string) => {
    setSelectedAmount(amount);
    onCustomAmountChange(amount);
  };

  // 自动查询手机号余额和归属地
  useEffect(() => {
    const queryPhoneInfo = async () => {
      // 清空之前的状态
      setBalanceInfo(null);
      setBalanceError("");

      // 检查手机号格式
      if (!cardInfo || !/^1[3-9]\d{9}$/.test(cardInfo)) {
        return;
      }

      setIsQueryingBalance(true);
      
      try {
        console.log('开始查询手机号信息:', cardInfo);
        const result = await queryPhoneBalance(cardInfo);
        
        if (result.code === 0 && result.data) {
          setBalanceInfo({
            balance: result.data.balance,
            operator: result.data.operator,
            province: result.data.province,
            city: result.data.city
          });
          console.log('✅ 手机号信息查询成功:', result.data);
        } else {
          setBalanceError(result.message || '查询失败');
          console.warn('⚠️ 手机号信息查询失败:', result.message);
        }
      } catch (error) {
        setBalanceError('查询失败，请稍后重试');
        console.error('❌ 手机号信息查询异常:', error);
      } finally {
        setIsQueryingBalance(false);
      }
    };

    // 防抖处理：用户停止输入800ms后立即查询
    const timeoutId = setTimeout(queryPhoneInfo, 800);
    
    return () => clearTimeout(timeoutId);
  }, [cardInfo]);

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

      {/* 号码余额显示区域 */}
      {cardInfo && cardInfo.length >= 11 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Smartphone className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">号码信息</span>
          </div>
          
          {isQueryingBalance && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500 mr-2" />
              <span className="text-sm text-gray-500">查询中...</span>
            </div>
          )}
          
          {!isQueryingBalance && balanceInfo && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">当前余额:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatBalance(balanceInfo.balance)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">运营商:</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getOperatorColor(balanceInfo.operator)}`}>
                  {balanceInfo.operator}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">归属地:</span>
                <span className="text-sm text-gray-800">
                  {balanceInfo.province} {balanceInfo.city}
                </span>
              </div>
              
              <div className="flex items-center text-xs text-gray-500 mt-2">
                <Signal className="w-3 h-3 mr-1" />
                <span>余额信息仅供参考，以实际充值为准</span>
              </div>
            </div>
          )}
          
          {!isQueryingBalance && balanceError && (
            <div className="flex items-center justify-center py-4">
              <div className="text-center">
                <span className="text-sm text-red-500">{balanceError}</span>
                <div className="text-xs text-gray-500 mt-1">
                  请检查号码是否正确或稍后重试
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
