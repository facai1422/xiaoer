
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export interface Order {
  id: string;
  type: string;
  amount: number;
  created_at: string;
}

interface OrdersListProps {
  orders: Order[];
  searchQuery?: string;
}

const OrdersList = ({ orders, searchQuery = "" }: OrdersListProps) => {
  const navigate = useNavigate();

  const filteredOrders = orders.filter(order => 
    searchQuery ? order.id.includes(searchQuery) : true
  );

  if (orders.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        暂无订单数据
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredOrders.map((order: Order) => (
        <Card key={order.id} className="p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-base font-medium">{order.type}</div>
            <div className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleString()}
            </div>
          </div>
          <div className="text-sm text-gray-500 mb-2">
            订单号: {order.id}
          </div>
          <div className="flex justify-between items-center">
            <div className="text-lg">¥{order.amount}</div>
            <Button
              variant="outline"
              onClick={() => navigate(`/orderDetail/${order.id}`)}
            >
              查看详情
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default OrdersList;
