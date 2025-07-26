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
import { transactionModel } from "@/db/models/transaction";

interface PaymentData {
  id: string;
  type: string;
  operator: string;
  amount: number;
  availableCount: number;
}

const PaymentOrders = () => {
  const [searchPhone, setSearchPhone] = useState("");
  const [searchOrderNo, setSearchOrderNo] = useState("");
  const [searchRegion, setSearchRegion] = useState("");
  const [orderQuantities, setOrderQuantities] = useState<Record<string, string>>({});

  // 模拟表格数据
  const paymentData: PaymentData[] = [
    { id: "1", type: "话费 - 无骚扰话费", operator: "移动", amount: 100, availableCount: 10 },
    { id: "2", type: "话费 - 无骚扰话费", operator: "联通", amount: 100, availableCount: 1 },
    { id: "3", type: "话费 - 无骚扰话费", operator: "移动", amount: 200, availableCount: 4 },
    { id: "4", type: "话费 - 无骚扰话费", operator: "联通", amount: 200, availableCount: 1 },
    { id: "5", type: "话费 - 无骚扰话费", operator: "移动", amount: 300, availableCount: 1 },
    { id: "6", type: "话费 - 无骚扰话费", operator: "移动", amount: 400, availableCount: 1 },
    { id: "7", type: "话费 - 无骚扰话费", operator: "电信", amount: 500, availableCount: 1 },
    { id: "8", type: "话费 - 无骚扰话费", operator: "移动", amount: 500, availableCount: 7 },
  ];

  const handleSearch = () => {
    // 实现搜索逻辑
    console.log("Searching...");
  };

  const handleReset = () => {
    setSearchPhone("");
    setSearchOrderNo("");
    setSearchRegion("");
  };

  const handleQuantityChange = (id: string, value: string) => {
    // 验证输入数量不超过可用数量
    const row = paymentData.find(item => item.id === id);
    if (row) {
      const inputValue = parseInt(value) || 0;
      if (inputValue > row.availableCount) {
        toast.error(`输入数量不能超过可用数量 ${row.availableCount}`);
        return;
      }
    }
    
    setOrderQuantities(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleAcceptOrders = () => {
    const hasOrders = Object.values(orderQuantities).some(quantity => quantity && parseInt(quantity) > 0);
    
    if (!hasOrders) {
      toast.error("请至少输入一个有效的订单数量");
      return;
    }

    // 验证所有输入的数量是否合法
    let isValid = true;
    const ordersToProcess: {id: string, quantity: number}[] = [];

    Object.entries(orderQuantities).forEach(([id, quantity]) => {
      if (!quantity) return;
      
      const numQuantity = parseInt(quantity);
      const row = paymentData.find(item => item.id === id);
      
      if (row && numQuantity > 0) {
        if (numQuantity > row.availableCount) {
          toast.error(`订单 ${row.amount}元 的接单数量超过可用数量`);
          isValid = false;
          return;
        }
        ordersToProcess.push({id, quantity: numQuantity});
      }
    });

    if (!isValid) return;

    try {
      // 更新订单状态为处理中
      ordersToProcess.forEach(order => {
        orderModel.updateStatus(parseInt(order.id), 'processing');
      });

      // 更新商户交易记录
      const merchantId = 1; // 实际应该从登录状态获取
      ordersToProcess.forEach(order => {
        const row = paymentData.find(item => item.id === order.id);
        if (row) {
          transactionModel.create({
            user_id: merchantId,
            type: 'order_accept',
            amount: row.amount * order.quantity,
            balance: 0, // 实际余额应该从商户账户获取
            description: `接单：${row.amount}元 x ${order.quantity}个`
          });
        }
      });

      toast.success("接单成功");
      setOrderQuantities({});

    } catch (error) {
      console.error('接单处理失败:', error);
      toast.error("接单处理失败，请重试");
    }
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <Button variant="ghost" className="text-blue-500">无骚扰话费</Button>
        <Button variant="ghost">固网宽带</Button>
        <Button variant="ghost">订单池</Button>
        <Button variant="ghost">待处理 (0)</Button>
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

        <div className="text-red-500 text-sm mb-4">
          在对应充值金额中，输入订单数量，系统将自动的实时配单金额订单！
          <br />
          所分配订单需要按充值时间内完成，一旦超时未处理将会自动回归号码池中
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>类型</TableHead>
              <TableHead>运营商</TableHead>
              <TableHead>充值金额(¥)</TableHead>
              <TableHead>特价池(个)</TableHead>
              <TableHead className="text-right">操作数量</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.operator}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>{row.availableCount}</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    placeholder="请输入数量"
                    className="w-32 inline-block"
                    value={orderQuantities[row.id] || ""}
                    onChange={(e) => handleQuantityChange(row.id, e.target.value)}
                    min="0"
                    max={row.availableCount}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-end mt-4">
          <Button 
            onClick={handleAcceptOrders} 
            className="bg-red-500 hover:bg-red-600 text-white px-8"
          >
            接单
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentOrders;
