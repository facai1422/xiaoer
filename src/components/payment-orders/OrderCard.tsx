
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface OrderCardProps {
  order: {
    id: string;
    type: string;
    amount: number;
    phoneNumber: string;
    createTime: string;
    discount?: string;
    exchangeRate?: number;
    usdtAmount?: number;
  };
}

const OrderCard = ({ order }: OrderCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-sm">单个充值</span>
        </div>
        <div className="text-green-500 text-sm">待充值</div>
      </div>
      
      <div className="text-gray-600 mb-2">
        订单：{order.id}
        <div className="text-gray-400 text-sm">
          下单时间：{order.createTime}
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <div className="bg-blue-500 rounded-lg p-2">
          <Phone className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-gray-900">{order.type}</div>
          {order.discount && (
            <div className="text-orange-500 text-sm">{order.discount}</div>
          )}
          <div className="text-lg font-medium">充值 {order.amount.toFixed(2)} 元</div>
          <div className="text-sm text-gray-500">充值号码：{order.phoneNumber}</div>
          {order.exchangeRate && (
            <div className="mt-2 text-sm text-gray-500">
              <div>汇率：{order.exchangeRate}</div>
              <div>总计：$ {order.usdtAmount} USDT</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="outline" onClick={() => navigator.clipboard.writeText(order.phoneNumber)}>
          复制
        </Button>
        <Button variant="destructive">删除订单</Button>
        <Button onClick={() => navigate(`/orderDetail/${order.id}`)}>
          查看详情
        </Button>
      </div>
    </Card>
  );
};

export default OrderCard;
