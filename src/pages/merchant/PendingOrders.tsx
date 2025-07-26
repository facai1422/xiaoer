
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { orderModel } from "@/db/models/order";

interface PendingOrder {
  id: number;
  order_no: string;
  phone_number: string;
  amount: number;
  area: string;
  operator: string;
  status: string;
  count_down: string;
  created_at: string;
}

const PendingOrders = () => {
  const [searchPhone, setSearchPhone] = useState("");
  const [searchOrderNo, setSearchOrderNo] = useState("");
  const [searchRegion, setSearchRegion] = useState("");

  // 模拟待处理订单数据
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([
    {
      id: 130,
      order_no: "ORD2025021411130",
      phone_number: "13502003172",
      amount: 100,
      area: "天津天津",
      operator: "移动",
      status: "待充值",
      count_down: "02:59:56",
      created_at: "2025-02-16 22:34:49"
    }
  ]);

  const handleSearch = () => {
    // 实现搜索逻辑
    console.log("Searching...");
  };

  const handleReset = () => {
    setSearchPhone("");
    setSearchOrderNo("");
    setSearchRegion("");
  };

  const handleConfirmPayment = async (orderId: number) => {
    try {
      // 更新订单状态为已完成
      await orderModel.updateStatus(orderId, 'completed');
      
      // 更新本地状态
      setPendingOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? {...order, status: '充值成功'} 
            : order
        )
      );
      
      toast.success("确认到账成功");
    } catch (error) {
      console.error('确认到账失败:', error);
      toast.error("确认到账失败，请重试");
    }
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <Button variant="ghost" className="text-blue-500">无骚扰话费</Button>
        <Button variant="ghost">固网宽带</Button>
        <Button variant="ghost">订单池</Button>
        <Button variant="ghost" className="text-blue-500">待处理 ({pendingOrders.length})</Button>
        <Button variant="ghost">待确认 (0)</Button>
        <Button variant="ghost">已确认 (2)</Button>
        <Button variant="ghost">确认失败 (0)</Button>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="请输入手机号码"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="max-w-xs"
          />
          <Input
            placeholder="请输入订单编号"
            value={searchOrderNo}
            onChange={(e) => setSearchOrderNo(e.target.value)}
            className="max-w-xs"
          />
          <Input
            placeholder="请输入地区"
            value={searchRegion}
            onChange={(e) => setSearchRegion(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleSearch} className="bg-blue-500 hover:bg-blue-600">
            <Search className="w-4 h-4 mr-2" />
            搜索
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            重置
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>充值号码</TableHead>
              <TableHead>充值金额(元)</TableHead>
              <TableHead>实充金额(元)</TableHead>
              <TableHead>号码余额</TableHead>
              <TableHead>运营商</TableHead>
              <TableHead>订单状态</TableHead>
              <TableHead>充值凭证</TableHead>
              <TableHead>订单号</TableHead>
              <TableHead>分配时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  {order.phone_number}
                  <div className="text-xs text-gray-500">机主姓名：刘</div>
                </TableCell>
                <TableCell className="text-red-500">{order.amount}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  当前余额：7.2
                  <div>
                    <Button variant="link" className="text-blue-500 p-0 h-auto">
                      更新(10)次
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  {order.operator}
                  <div className="text-xs">{order.area}</div>
                </TableCell>
                <TableCell>
                  <div className="text-orange-500">待充值</div>
                  <div className="text-xs text-red-500">({order.count_down})</div>
                  <Button variant="link" className="text-blue-500 p-0 h-auto">
                    加时
                  </Button>
                </TableCell>
                <TableCell>USDT</TableCell>
                <TableCell>{order.order_no}</TableCell>
                <TableCell>{order.created_at}</TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      className="w-full bg-green-500 hover:bg-green-600"
                      onClick={() => handleConfirmPayment(order.id)}
                    >
                      确认到账
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      一键复制
                    </Button>
                    <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-600">
                      订单信息
                    </Button>
                    <Button size="sm" variant="destructive" className="w-full">
                      移除订单
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PendingOrders;
