import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { RechargeForm } from "@/components/product/RechargeForm";
import { TutorialDialog } from "@/components/product/TutorialDialog";
import { BatchRechargeForm } from "@/components/product/BatchRechargeForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RechargeEntry } from "@/types/recharge";
import { createBusinessOrder } from "@/services/businessOrderService";

const MobileRecharge = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const serviceTitle = location.state?.serviceTitle || "话费充值";

  // Form states
  const [cardInfo, setCardInfo] = useState("");
  const [name, setName] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [userBalance, setUserBalance] = useState<number>(0);
  
  // Dialog states
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  
  // Batch recharge states
  const [entries, setEntries] = useState<RechargeEntry[]>([
    { cardInfo: "", name: "", amount: "" }
  ]);

  const exchangeRate = 7.2;

  // 检查用户登录状态并获取余额
  useEffect(() => {
    const checkAuthAndFetchBalance = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("请先登录");
        navigate("/login");
        return;
      }

      try {
        console.log('获取用户余额，用户ID:', session.user.id);
        
        // 从user_profiles表获取余额，使用user_id字段
        const { data, error } = await supabase
          .from('user_profiles')
          .select('balance')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (!error && data) {
          console.log('从user_profiles获取到余额:', data.balance);
          setUserBalance(data.balance || 0);
        } else {
          console.error('从user_profiles获取余额失败:', error);
          setUserBalance(0);
        }
      } catch (error) {
        console.error("Error fetching user balance:", error);
        setUserBalance(0);
      }
    };
    
    checkAuthAndFetchBalance();
  }, [navigate]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleTutorialOpen = () => {
    setIsTutorialOpen(true);
  };

  const handleSwitchToBatch = () => {
    setIsBatchMode(true);
  };

  const handleSwitchToSingle = () => {
    setIsBatchMode(false);
  };

  const handleSubmit = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("请先登录");
        navigate("/login");
        return;
      }

      if (isBatchMode) {
        // 批量充值验证
        const validEntries = entries.filter(entry => entry.cardInfo && entry.amount);
        if (validEntries.length === 0) {
          toast.error("请至少添加一个有效的充值信息");
          return;
        }
        
        const totalAmount = validEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || "0"), 0);
        const finalAmount = totalAmount * 0.8;
        const usdtAmount = finalAmount / exchangeRate;
        const usdtAmountStr = usdtAmount.toFixed(2);
        
        if (usdtAmount > userBalance) {
          toast.error(`余额不足，需要 ${usdtAmountStr} USDT，当前余额 ${userBalance.toFixed(2)} USDT`);
          return;
        }
        
        // TODO: 实现批量充值
        toast.success(`批量充值提交成功！共${validEntries.length}个号码，实付: ${usdtAmountStr} USDT`);
      } else {
        // 单个充值验证
        if (!cardInfo) {
          toast.error("请输入手机号码");
          return;
        }
        if (!customAmount || parseFloat(customAmount) <= 0) {
          toast.error("请输入充值金额");
          return;
        }
        
        const amount = parseFloat(customAmount);
        const finalAmount = amount * 0.8;
        const usdtAmount = finalAmount / exchangeRate;
        const usdtAmountStr = usdtAmount.toFixed(2);
        
        if (usdtAmount > userBalance) {
          toast.error(`余额不足，需要 ${usdtAmountStr} USDT，当前余额 ${userBalance.toFixed(2)} USDT`);
          return;
        }
        
        try {
          const order = await createBusinessOrder({
            userId: session.user.id,
            businessType: "话费充值",
            targetAccount: cardInfo,
            amount: amount,
            actualAmount: usdtAmount,
            accountName: name || cardInfo,
            metadata: {
              phone: cardInfo,
              amount: amount,
              discount: '8折',
              exchange_rate: exchangeRate
            }
          });
          
          if (order) {
            toast.success(`充值提交成功！实付: ${usdtAmountStr} USDT`);
            // 清空表单
            setCardInfo("");
            setCustomAmount("");
            navigate("/orders");
          }
        } catch (error) {
          console.error("Submit error:", error);
          toast.error("提交失败，请重试");
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("提交失败，请重试");
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
          {serviceTitle}
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
          {!isBatchMode ? (
            <RechargeForm 
              cardInfo={cardInfo}
              onCardInfoChange={setCardInfo}
              name={name}
              onNameChange={setName}
              customAmount={customAmount}
              onCustomAmountChange={setCustomAmount}
              exchangeRate={exchangeRate}
              onSwitchToBatch={handleSwitchToBatch}
            />
          ) : (
            <BatchRechargeForm 
              entries={entries}
              onEntriesChange={setEntries}
              onSwitchMode={handleSwitchToSingle}
            />
          )}
          
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
            >
              确认充值
            </Button>
          </div>
        </div>
      </div>

      {/* 教程对话框 */}
      <TutorialDialog 
        open={isTutorialOpen} 
        onOpenChange={setIsTutorialOpen}
        type="phoneRecharge"
      />
    </div>
  );
};

export default MobileRecharge; 