
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import type { OrderStatus } from "@/types/payment";

interface BulkActionsProps {
  selectedOrders: string[];
  onComplete: () => void;
}

export const BulkActions = ({ selectedOrders, onComplete }: BulkActionsProps) => {
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();

  const updateOrdersMutation = useMutation({
    mutationFn: async () => {
      if (!status || selectedOrders.length === 0) return;

      const { error: ordersError } = await supabase
        .from('channel_orders')
        .update({ status })
        .in('id', selectedOrders);

      if (ordersError) throw ordersError;

      const historyRecords = selectedOrders.map(orderId => ({
        order_id: orderId,
        new_status: status,
        note,
        created_by: 'system' // TODO: 替换为实际用户ID
      }));

      const { error: historyError } = await supabase
        .from('channel_order_status_history')
        .insert(historyRecords);

      if (historyError) throw historyError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel-orders'] });
      toast.success(`成功更新 ${selectedOrders.length} 个订单状态`);
      onComplete();
      setStatus("");
      setNote("");
    },
    onError: (error) => {
      toast.error(`批量更新失败: ${error.message}`);
    }
  });

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-500">
        已选择 {selectedOrders.length} 个订单
      </span>
      <Select value={status} onValueChange={(value: OrderStatus) => setStatus(value)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="批量操作" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">待处理</SelectItem>
          <SelectItem value="processing">处理中</SelectItem>
          <SelectItem value="completed">已完成</SelectItem>
          <SelectItem value="failed">已失败</SelectItem>
        </SelectContent>
      </Select>
      <Input
        placeholder="添加批量操作备注"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-64"
      />
      <Button
        variant="default"
        disabled={!status || selectedOrders.length === 0 || updateOrdersMutation.isPending}
        onClick={() => updateOrdersMutation.mutate()}
      >
        {updateOrdersMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            处理中...
          </>
        ) : (
          "确认批量更新"
        )}
      </Button>
    </div>
  );
};
