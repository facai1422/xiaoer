
import { OrderStatus } from "@/types/payment";

const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: "待处理", color: "bg-yellow-100 text-yellow-800" },
  processing: { label: "处理中", color: "bg-blue-100 text-blue-800" },
  completed: { label: "已完成", color: "bg-green-100 text-green-800" },
  failed: { label: "已失败", color: "bg-red-100 text-red-800" }
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  return (
    <span className={`px-2 py-1 rounded-full text-sm ${ORDER_STATUS_MAP[status].color}`}>
      {ORDER_STATUS_MAP[status].label}
    </span>
  );
};
