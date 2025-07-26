
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
import { Loader2 } from "lucide-react";

interface BulkActionsProps {
  selectedOrders: string[];
  onComplete: () => void;
}

export const BulkActions = ({ selectedOrders, onComplete }: BulkActionsProps) => {
  const [status, setStatus] = useState<string>("");
  const [note, setNote] = useState("");

  const handleBulkUpdate = async () => {
    try {
      // 从 localStorage 获取订单并更新
      const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      const updatedOrders = savedOrders.map((order: any) => 
        selectedOrders.includes(order.id) 
          ? { ...order, status } 
          : order
      );
      
      localStorage.setItem("orders", JSON.stringify(updatedOrders));
      toast.success(`成功更新 ${selectedOrders.length} 个订单状态`);
      onComplete();
      setStatus("");
      setNote("");
    } catch (error) {
      toast.error("批量更新失败");
    }
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-500">
        已选择 {selectedOrders.length} 个订单
      </span>
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="批量操作" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">待充值</SelectItem>
          <SelectItem value="processing">充值中</SelectItem>
          <SelectItem value="completed">已完成</SelectItem>
          <SelectItem value="cancelled">已取消</SelectItem>
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
        disabled={!status || selectedOrders.length === 0}
        onClick={handleBulkUpdate}
      >
        确认批量更新
      </Button>
    </div>
  );
};
