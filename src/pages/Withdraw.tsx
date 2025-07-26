import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createWithdrawOrder } from "@/services/withdrawService";

interface PaymentMethod {
  id: string;
  type: string;
  account_name: string;
  account_number: string;
}

const Withdraw = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("请先登录");
        navigate("/login");
        return;
      }

      setUserId(session.user.id);

      // Load user balance
      try {
        const { data, error } = await supabase
          .from('user_profiles' as any)
          .select('balance')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Error loading balance:", error);
          if (error.code === '42P01') {
            toast.error("用户资料表不存在，请联系管理员");
          } else {
            toast.error("获取账户余额失败");
          }
          return;
        }

        setUserBalance((data as any)?.balance || 0);
      } catch (error) {
        console.error("Balance error:", error);
        toast.error("获取余额异常");
      }

      // Load payment methods
      try {
        const { data, error } = await supabase
          .from('user_payments' as any)
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Payment methods error:", error);
          if (error.code === '42P01') {
            toast.error("提现账户表不存在，请联系管理员");
          } else {
            toast.error("加载提现账户失败");
          }
          return;
        }

        if (data && data.length > 0) {
          setPaymentMethods(data as PaymentMethod[]);
          // Select first payment method by default
          setSelectedPaymentId((data as any)[0].id);
        } else {
          toast.error("请先添加提现账户");
          navigate("/wallet-address");
        }
      } catch (error) {
        console.error("Payment methods error:", error);
        toast.error("加载提现账户异常");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("请先登录");
      return;
    }

    if (!amount || !selectedPaymentId) {
      toast.error("请完善提现信息");
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error("请输入有效的提现金额");
      return;
    }

    setIsSubmitting(true);

    const success = await createWithdrawOrder({
      userId: session.user.id,
      amount: withdrawAmount,
      accountId: selectedPaymentId
    });

    if (success) {
      navigate('/transaction-orders');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between px-4 py-4 bg-white">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-base font-medium">提现USDT</div>
        <div className="w-6"></div>
      </div>

      <div className="p-4">
        {/* 提现金额输入 */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500">提现金额</span>
            <div className="flex items-center">
              <span className="text-2xl font-medium mr-1">USDT</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-32 text-right text-2xl font-medium outline-none"
              />
            </div>
          </div>
          <div className="text-sm text-gray-500">
            可提现余额：{userBalance.toFixed(2) || '0.00'} USDT
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-6">
          <h3 className="text-base mb-4">选择提现账户</h3>
          <div className="space-y-3">
            {paymentMethods?.map(account => (
              <div
                key={account.id}
                className={`p-3 rounded-lg border ${
                  selectedPaymentId === account.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
                onClick={() => setSelectedPaymentId(account.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{account.type}</div>
                    <div className="text-sm text-gray-500">{account.account_number}</div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border ${
                    selectedPaymentId === account.id
                      ? 'border-4 border-blue-500'
                      : 'border-gray-300'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 添加新账户按钮 */}
        <Button 
          variant="outline"
          className="w-full mb-6"
          onClick={() => navigate('/wallet-address')}
        >
          添加新账户
        </Button>

        {/* 确认提现按钮 */}
        <Button 
          className="w-full"
          onClick={handleSubmit}
        >
          确认提现 USDT
        </Button>
      </div>
    </div>
  );
};

export default Withdraw;
