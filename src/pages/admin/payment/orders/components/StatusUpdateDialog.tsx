
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChannelOrder, OrderStatus, OrderStatusHistory } from "@/types/payment";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusUpdateDialogProps {
  selectedOrder: ChannelOrder | null;
  onClose: () => void;
}

export const StatusUpdateDialog = ({ selectedOrder, onClose }: StatusUpdateDialogProps) => {
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [note, setNote] = useState("");

  const { data: orderHistory } = useQuery({
    queryKey: ['order-history', selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder?.id) return [];
      const { data, error } = await supabase
        .from('channel_order_status_history')
        .select('*')
        .eq('order_id', selectedOrder.id)
        .order('created_at', { ascending: false })
        .returns<OrderStatusHistory[]>();

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedOrder?.id
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status, note }: { orderId: string; status: OrderStatus; note: string }) => {
      const { error } = await supabase
        .from('channel_orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      const { error: historyError } = await supabase
        .from('channel_order_status_history')
        .insert({
          order_id: orderId,
          old_status: selectedOrder?.status,
          new_status: status,
          note,
          created_by: 'system' // TODO: 替换为实际用户ID
        });

      if (historyError) throw historyError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-history', selectedOrder?.id] });
      toast.success('订单状态更新成功');
      onClose();
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`);
    }
  });

  const handleStatusUpdate = () => {
    if (!selectedOrder || !newStatus) return;
    updateOrderStatus.mutate({
      orderId: selectedOrder.id,
      status: newStatus,
      note
    });
  };

  return (
    <Dialog open={!!selectedOrder} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>更新订单状态</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={newStatus} onValueChange={(value: OrderStatus) => setNewStatus(value)}>
            <SelectTrigger>
              <SelectValue placeholder="选择新状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">待处理</SelectItem>
              <SelectItem value="processing">处理中</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
              <SelectItem value="failed">已失败</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="添加备注"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button 
            className="w-full" 
            onClick={handleStatusUpdate}
            disabled={!newStatus || updateOrderStatus.isPending}
          >
            {updateOrderStatus.isPending ? "更新中..." : "确认更新"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
