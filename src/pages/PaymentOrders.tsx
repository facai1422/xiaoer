import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InstantAuthCheck } from "@/components/auth/InstantAuthCheck";
import BottomNav from "@/components/BottomNav";

interface PaymentOrder {
  id: string;
  type: string;
  account: string;
  amount: number;
  status: string;
  time: string;
}

const PaymentOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      // 从localStorage加载缴费订单数据
      const savedOrders = localStorage.getItem('payment_orders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        // 按时间倒序排列，最新的订单在前
        const sortedOrders = parsedOrders.sort((a: PaymentOrder, b: PaymentOrder) => {
          return new Date(b.time).getTime() - new Date(a.time).getTime();
        });
        setOrders(sortedOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('加载缴费订单失败:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <InstantAuthCheck>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* 头部 */}
        <div className="bg-white p-4 flex items-center shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <h1 className="text-lg font-semibold ml-4">缴费订单</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadOrders}
            className="ml-auto"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* 订单列表 */}
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          ) : orders.length > 0 ? (
            orders.map((order: PaymentOrder) => (
              <Card key={order.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{order.type}</h3>
                    <p className="text-sm text-gray-600">{order.account}</p>
                    <p className="text-xs text-gray-500">{order.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">¥{order.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      order.status === '成功' ? 'bg-green-100 text-green-600' :
                      order.status === '处理中' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">暂无缴费订单记录</p>
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </InstantAuthCheck>
  );
};

export default PaymentOrders;
