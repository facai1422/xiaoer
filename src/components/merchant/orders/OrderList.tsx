
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Order {
  id: string;
  type: string;
  amount: number;
  phone_number: string;
  status: string;
  created_at: string;
}

interface OrderListProps {
  orders: Order[];
}

export const OrderList = ({ orders }: OrderListProps) => {
  const navigate = useNavigate();

  if (orders.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        暂无订单数据
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div 
          key={order.id} 
          className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="text-base font-medium text-gray-900">
              {order.phone_number}
            </div>
            <div className="text-lg font-medium text-gray-900">
              {order.amount.toFixed(2)}
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            充值金额
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {order.status === "pending" ? "待充值" :
                 order.status === "processing" ? "充值中" :
                 order.status === "completed" ? "已完成" :
                 "已取消"}
              </div>
            </div>
            <div className="flex gap-3">
              {order.status === "pending" && (
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={() => {}}
                >
                  取消充值
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                className="bg-blue-500 hover:bg-blue-600"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                查看详情
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
