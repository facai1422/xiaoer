
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface OrderTrend {
  date: string;
  count: number;
  amount: number;
}

interface StoredOrder {
  id: string;
  createTime: string;
  amount: number;
}

export const OrderTrends = () => {
  const [data] = useState<OrderTrend[]>(() => {
    // 从 localStorage 获取订单数据并处理
    const orders = JSON.parse(localStorage.getItem("orders") || "[]") as StoredOrder[];
    const groupedByDate = orders.reduce((acc: Record<string, OrderTrend>, order) => {
      const date = format(new Date(order.createTime), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { date, count: 0, amount: 0 };
      }
      acc[date].count += 1;
      acc[date].amount += order.amount;
      return acc;
    }, {});

    return Object.values(groupedByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  });

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-4">订单趋势</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="count"
              stroke="#8884d8"
              name="订单数量"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="amount"
              stroke="#82ca9d"
              name="订单金额"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
