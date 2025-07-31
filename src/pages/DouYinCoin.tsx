import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { TutorialDialog } from "@/components/product/TutorialDialog";
import { createBusinessOrder } from "@/services/businessOrderService";
import { supabase } from "@/integrations/supabase/client";
import { getDefaultExchangeRate, getDefaultDiscountRate } from "@/services/pricingService";

const DouYinCoin = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  
  // Form states - 简化表单状态
  const [account, setAccount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<string>("");
  const [userBalance, setUserBalance] = useState<number>(0);
  
  // 动态配置状态
  const [exchangeRate, setExchangeRate] = useState<number>(7.2);
  const [discountRate, setDiscountRate] = useState<number>(0.7);
  const [loadingSettings, setLoadingSettings] = useState(false);

  const quickAmounts = ["100", "300", "500", "1000", "2000", "5000"];



  // 检查用户登录状态并获取余额
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("请先登录");
        navigate("/login");
        return;
      }

      try {
        // 获取用户余额
        const { data, error } = await supabase
          .from('user_profiles')
          .select('balance')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (!error && data) {
          setUserBalance(data.balance || 0);
        } else {
          setUserBalance(0);
        }

        // 获取动态配置
        const fetchPricingSettings = async () => {
          try {
            setLoadingSettings(true);
            const [exchangeRateData, discountData] = await Promise.all([
              getDefaultExchangeRate(),
              getDefaultDiscountRate()
            ]);
            
            if (exchangeRateData) {
              setExchangeRate(exchangeRateData);
            }
            if (discountData) {
              setDiscountRate(discountData);
            }
          } catch (error) {
            console.error('获取价格设置失败:', error);
          } finally {
            setLoadingSettings(false);
          }
        };
        
        fetchPricingSettings();
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserBalance(0);
      }
    };
    
    checkAuthAndFetchData();
  }, [navigate]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleTutorialOpen = () => {
    setTutorialOpen(true);
  };

  const handleQuickAmountSelect = (amount: string) => {
    setSelectedAmount(amount);
    setCustomAmount(amount);
  };

  const handleSubmit = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("请先登录");
        navigate("/login");
        return;
      }

      if (!account) {
        toast.error("请输入抖音号");
        return;
      }
      if (!customAmount || parseFloat(customAmount) <= 0) {
        toast.error("请输入充值金额");
        return;
      }
      
      const amount = parseFloat(customAmount);
      const finalAmount = amount * discountRate; // 应用折扣
      const usdtAmount = finalAmount / exchangeRate;
      const usdtAmountStr = usdtAmount.toFixed(2);
      
      if (usdtAmount > userBalance) {
        toast.error(`余额不足，需要 ${usdtAmountStr} USDT，当前余额 ${userBalance.toFixed(2)} USDT`);
        return;
      }
      
      setIsSubmitting(true);
      
      const order = await createBusinessOrder({
        userId: session.user.id,
        businessType: "抖音币充值",
        targetAccount: account,
        amount: amount,
        actualAmount: usdtAmount,
        accountName: account,
        metadata: {
          account: account,
          amount: amount,
          discount: `${Math.round(discountRate * 100)}折`,
          exchange_rate: exchangeRate
        }
      });
      
      if (order) {
        toast.success(`充值提交成功！实付: ${usdtAmountStr} USDT`);
        // 清空表单
        setAccount("");
        setCustomAmount("");
        setSelectedAmount("");
        navigate("/orders");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("提交失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white p-4 flex items-center">
        <Button
          variant="ghost"
          className="p-0 mr-3"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold flex-1 text-center mr-9">
          抖音充值
        </h1>
      </div>

      {/* 主要内容 */}
      <div className="p-4">
        {/* 查看教程链接 */}
        <div className="mb-4">
          <Button
            variant="link"
            className="text-blue-500 p-0 h-auto font-normal text-sm"
            onClick={handleTutorialOpen}
          >
            查看充值教程 →
          </Button>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          {/* 表单区域 */}
          <div className="space-y-4">
            {/* 头部输入区域 - 蓝色背景 */}
            <div className="bg-blue-100 rounded-xl p-4 space-y-4">
              <div>
                <div className="text-gray-600 mb-2">抖音号</div>
                <Input
                  placeholder="请输入抖音号或手机号"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
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
                    onChange={(e) => setCustomAmount(e.target.value)}
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
                <span className="text-gray-500 ml-2">优惠 {((parseFloat(customAmount || "0") * (1 - discountRate))).toFixed(2)}元</span>
              </div>
              <span className="text-gray-500">参考汇率: {exchangeRate.toFixed(2)}</span>
            </div>

            {/* 总计金额 */}
            <div className="flex justify-between items-center text-base">
              <span>合计:</span>
              <span className="text-orange-500">$ {((parseFloat(customAmount || "0") * discountRate) / exchangeRate).toFixed(2)} USDT</span>
            </div>
          </div>
          
          {/* 当前钱包余额 */}
          <div className="mt-4 mb-6 bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">当前钱包余额:</span>
              <span className="text-lg font-bold text-blue-600">
                {userBalance.toFixed(2)} USDT
              </span>
            </div>
          </div>
          
          {/* 提交按钮 */}
          <div>
            <Button 
              className="w-full bg-[#1a237e] hover:bg-[#0d47a1] text-white py-3"
              onClick={handleSubmit}
              disabled={isSubmitting || !account || !customAmount}
            >
              {isSubmitting ? "提交中..." : "确认充值"}
            </Button>
          </div>
        </div>
      </div>

      {/* 教程对话框 */}
      <TutorialDialog
        open={tutorialOpen}
        onOpenChange={setTutorialOpen}
        type="douyinCoin"
        productName="抖音充值"
      />
    </div>
  );
};

export default DouYinCoin;
