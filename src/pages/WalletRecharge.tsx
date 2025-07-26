
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getPaymentAddresses, createRechargeOrder } from "@/services/rechargeService";
import { useAuth } from "@/hooks/useAuth";

interface PaymentAddress {
  id: string;
  address: string;
  type: string;
  is_active: boolean;
}

const WalletRecharge = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [addresses, setAddresses] = useState<PaymentAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<PaymentAddress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 加载支付地址
  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await getPaymentAddresses();
      setAddresses(data || []);
      if (data && data.length > 0) {
        setSelectedAddress(data[0]);
      }
    } catch (error) {
      console.error('获取地址失败:', error);
      toast.error('获取地址失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  // 处理充值
  const handleRecharge = async () => {
    if (!user) {
      toast.error("请先登录");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("请输入有效的充值金额");
      return;
    }

    if (!selectedAddress) {
      toast.error("请选择支付地址");
      return;
    }

    setIsSubmitting(true);
    try {
      await createRechargeOrder({
        userId: user.id,
        phone: user.phone || "",
        amount: parseFloat(amount),
        type: "USDT充值"
      });
      toast.success("充值订单创建成功");
    } catch (error) {
      console.error("创建订单失败:", error);
      toast.error("创建订单失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="text-gray-600" title="返回">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-base font-medium">USDT充值</div>
          <div className="w-6"></div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="pt-16 px-4 pb-20">
        <div className="max-w-md mx-auto space-y-4">
          
          {/* 金额输入 */}
          <Card className="p-4 bg-white border border-gray-200">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                充值金额 (USDT)
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="请输入充值金额"
                className="text-lg bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[100, 500, 1000].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="w-full bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                >
                  {quickAmount}
                </Button>
              ))}
            </div>
          </Card>

          {/* 地址选择 */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">选择充值地址</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadAddresses}
              disabled={isLoading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* 地址列表 */}
          <Card className="p-4 bg-white border border-gray-200">
            {isLoading ? (
              <div className="text-center py-4 text-gray-600">加载中...</div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-4 text-gray-600">暂无可用地址</div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAddress?.id === addr.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedAddress(addr)}
                  >
                    <div className="font-medium text-gray-900">{addr.type}</div>
                    <div className="text-sm text-gray-600 break-all">{addr.address}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 提交按钮 */}
          <Button 
            onClick={handleRecharge} 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium"
            disabled={isSubmitting || !selectedAddress || !amount}
          >
            {isSubmitting ? "处理中..." : "确认充值"}
          </Button>

          {/* 充值说明 */}
          <Card className="p-4 bg-blue-50">
            <h4 className="font-medium text-blue-800 mb-2">充值说明</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 最小充值金额为 10 USDT</li>
              <li>• 充值完成后余额将自动更新</li>
              <li>• 如遇到问题请联系在线客服</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WalletRecharge;
