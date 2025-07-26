
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChannelOrder } from "@/types/payment";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { useNavigate } from "react-router-dom";

interface OrderCardProps {
  order: ChannelOrder;
  onOpenStatusModal: (order: ChannelOrder) => void;
}

export const OrderCard = ({ order, onOpenStatusModal }: OrderCardProps) => {
  const navigate = useNavigate();

  return (
    <Card key={order.id} className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium">
            订单号：{order.order_no}
          </h3>
          <p className="text-sm text-gray-500">
            渠道：{order.payment_channels?.name}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div>金额：¥{order.amount}</div>
            <div className="text-sm text-gray-500">
              USDT：${order.usdt_amount}
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => onOpenStatusModal(order)}
            >
              更新状态
            </Button>
            <Button 
              variant="default"
              onClick={() => navigate(`/admin/payment/orders/${order.id}`)}
            >
              查看详情
            </Button>
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        创建时间：{format(new Date(order.created_at), 'yyyy-MM-dd HH:mm:ss')}
      </div>
    </Card>
  );
};
