import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createBusinessOrder } from "@/services/businessOrderService";

const amounts = [20, 50, 100, 200, 300, 500, 1000];

const Recharge = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const serviceTitle = location.state?.serviceTitle || "话费充值";

  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("请先登录");
        navigate("/login");
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('balance')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (!error && data) {
          setUserBalance(data.balance || 0);
        }
      } catch (error) {
        console.error("Error fetching user balance:", error);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    validateForm();
  }, [phoneNumber, selectedAmount, customAmount]);

  const validateForm = () => {
    const isPhoneValid = /^1[3-9]\d{9}$/.test(phoneNumber);
    const hasAmount = selectedAmount !== null || (customAmount && Number(customAmount) > 0);
    setIsValid(isPhoneValid && hasAmount);
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const getFinalAmount = (): number => {
    if (selectedAmount) return selectedAmount;
    if (customAmount) return Number(customAmount);
    return 0;
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    const amount = getFinalAmount();
    if (amount <= 0) {
      toast.error("请选择或输入充值金额");
      return;
    }

    if (amount > userBalance) {
      toast.error("余额不足，请先充值");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("会话已过期，请重新登录");
        navigate("/login");
        return;
      }

      // 计算实际消费金额（USDT）
      const exchangeRate = 7.2; // CNY到USDT的汇率
      const actualAmountUSDT = parseFloat((amount / exchangeRate).toFixed(2));
      
      const order = await createBusinessOrder({
        userId: session.user.id,
        businessType: serviceTitle,
        targetAccount: phoneNumber,
        amount: amount,
        actualAmount: actualAmountUSDT,
        accountName: phoneNumber,
        metadata: {
          phone: phoneNumber,
          amount: amount.toString(),
          exchange_rate: exchangeRate
        }
      });

      if (order) {
        toast.success("充值订单已提交");
        navigate("/orders");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("提交订单失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center">
        <Button
          variant="ghost"
          className="p-0 mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold flex-1 text-center mr-6">
          {serviceTitle}
        </h1>
      </div>

      <div className="p-4 space-y-4">
        <Card className="p-4">
          <label className="block text-sm font-medium text-gray-700">
            充值号码
          </label>
          <div className="mt-1">
            <Input
              type="tel"
              placeholder="请输入手机号码"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </Card>

        <Card className="p-4">
          <label className="block text-sm font-medium text-gray-700">
            选择充值金额
          </label>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {amounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                className={cn(
                  "relative rounded-md border shadow-sm px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                  selectedAmount === amount
                    ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500"
                    : "border-gray-300"
                )}
                onClick={() => handleAmountSelect(amount)}
              >
                {amount}
              </Button>
            ))}
          </div>
          <div className="mt-3">
            <Input
              type="number"
              placeholder="自定义金额"
              value={customAmount}
              onChange={handleCustomAmountChange}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-medium text-gray-500">
              账户余额
            </div>
            <div className="text-lg font-bold">
              {userBalance.toFixed(2)}
            </div>
          </div>
          <Button
            className="w-full"
            disabled={!isValid || isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? "提交中..." : "立即充值"}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Recharge;
