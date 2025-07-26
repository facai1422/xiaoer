
import { format } from "date-fns";
import { ArrowUpDown, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChannelOrder } from "@/types/payment";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "./OrderStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrdersTableProps {
  orders: ChannelOrder[];
  onOpenStatusModal: (order: ChannelOrder) => void;
}

export const OrdersTable = ({ orders, onOpenStatusModal }: OrdersTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">
              <Button variant="ghost" className="p-0 h-8">
                <span>订单号</span>
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>渠道</TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 h-8">
                <span>金额</span>
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>USDT金额</TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 h-8">
                <span>状态</span>
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 h-8">
                <span>创建时间</span>
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.order_no}</TableCell>
              <TableCell>{order.payment_channels?.name}</TableCell>
              <TableCell>¥{order.amount}</TableCell>
              <TableCell>${order.usdt_amount}</TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell>{format(new Date(order.created_at), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenStatusModal(order)}
                  >
                    更新状态
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate(`/admin/payment/orders/${order.id}`)}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    查看详情
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
