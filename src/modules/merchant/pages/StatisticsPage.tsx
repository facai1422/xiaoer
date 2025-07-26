
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import MerchantLayout from "../layout/MerchantLayout";

const StatisticsPage = () => {
  const [timeRange, setTimeRange] = useState("week");

  const data = [
    { name: "周一", value: 2400 },
    { name: "周二", value: 1398 },
    { name: "周三", value: 9800 },
    { name: "周四", value: 3908 },
    { name: "周五", value: 4800 },
    { name: "周六", value: 3800 },
    { name: "周日", value: 4300 }
  ];

  const pieData = [
    { name: "话费充值", value: 400 },
    { name: "电费充值", value: 300 },
    { name: "油卡充值", value: 300 },
    { name: "其他", value: 200 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <MerchantLayout title="数据统计">
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button 
            variant={timeRange === "week" ? "default" : "outline"}
            onClick={() => setTimeRange("week")}
          >
            本周
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            onClick={() => setTimeRange("month")}
          >
            本月
          </Button>
          <Button
            variant={timeRange === "year" ? "default" : "outline"}
            onClick={() => setTimeRange("year")}
          >
            本年
          </Button>
        </div>

        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">营收趋势</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">业务分布</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </MerchantLayout>
  );
};

export default StatisticsPage;
