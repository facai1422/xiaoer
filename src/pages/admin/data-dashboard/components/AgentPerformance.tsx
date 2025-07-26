
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// 模拟生成代理业绩数据
const generateAgentPerformanceData = () => {
  const agents = [
    { id: "1", name: "广州代理A" },
    { id: "2", name: "深圳代理B" },
    { id: "3", name: "上海代理C" },
    { id: "4", name: "北京代理D" },
    { id: "5", name: "成都代理E" },
  ];

  return agents.map(agent => ({
    id: agent.id,
    name: agent.name,
    profit: Math.floor(Math.random() * 5000) + 2000,
    processingEfficiency: Math.floor(Math.random() * 50) + 30, // 分钟
    successRate: Math.floor(Math.random() * 15) + 85, // 百分比
    trend: Math.random() > 0.5 ? "up" : "down",
    orderVolume: Math.floor(Math.random() * 200) + 50,
  }));
};

// 模拟生成分润趋势数据
const generateProfitTrendData = () => {
  const days = 30;
  const result = [];
  
  for (let i = 1; i <= days; i++) {
    result.push({
      day: i,
      actual: Math.floor(Math.random() * 1000) + 500,
      predicted: Math.floor(Math.random() * 1000) + 500,
    });
  }
  
  return result;
};

// 模拟生成团队贡献占比数据
const generateTeamContributionData = () => {
  return [
    { name: "广州团队", value: 35, color: "#8884d8" },
    { name: "深圳团队", value: 25, color: "#82ca9d" },
    { name: "上海团队", value: 20, color: "#ffc658" },
    { name: "北京团队", value: 15, color: "#ff8042" },
    { name: "其他团队", value: 5, color: "#0088fe" },
  ];
};

const AgentPerformance = () => {
  const [timeFrame, setTimeFrame] = useState("week");
  const [sortBy, setSortBy] = useState("profit");

  // 获取代理业绩数据
  const { data: agentPerformance, isLoading: isLoadingAgents } = useQuery({
    queryKey: ["agent-performance", timeFrame],
    queryFn: async () => {
      try {
        // 实际项目中应该从数据库获取
        // 这里先使用模拟数据
        return generateAgentPerformanceData();
      } catch (error) {
        console.error("Error fetching agent performance:", error);
        toast.error("获取代理绩效数据失败");
        return [];
      }
    }
  });

  // 获取分润趋势数据
  const { data: profitTrend, isLoading: isLoadingTrend } = useQuery({
    queryKey: ["profit-trend", timeFrame],
    queryFn: async () => {
      try {
        return generateProfitTrendData();
      } catch (error) {
        console.error("Error fetching profit trend:", error);
        toast.error("获取分润趋势数据失败");
        return [];
      }
    }
  });

  // 获取团队贡献占比数据
  const { data: teamContribution, isLoading: isLoadingContribution } = useQuery({
    queryKey: ["team-contribution", timeFrame],
    queryFn: async () => {
      try {
        return generateTeamContributionData();
      } catch (error) {
        console.error("Error fetching team contribution:", error);
        toast.error("获取团队贡献数据失败");
        return [];
      }
    }
  });

  // 根据选择的字段排序代理数据
  const sortedAgentPerformance = [...(agentPerformance || [])].sort((a, b) => {
    if (sortBy === "profit") return b.profit - a.profit;
    if (sortBy === "efficiency") return a.processingEfficiency - b.processingEfficiency;
    if (sortBy === "successRate") return b.successRate - a.successRate;
    return 0;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">代理绩效看板</h2>
        <p className="text-gray-500 mb-6">
          监控代理的关键绩效指标，包括分润排名、处理效率和成功率
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">时间范围:</span>
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="选择时间范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">今日</SelectItem>
                <SelectItem value="week">本周</SelectItem>
                <SelectItem value="month">本月</SelectItem>
                <SelectItem value="quarter">本季度</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">排序:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profit">分润金额</SelectItem>
                <SelectItem value="efficiency">处理效率</SelectItem>
                <SelectItem value="successRate">成功率</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>分润趋势</CardTitle>
            <CardDescription>实际vs预测分润</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoadingTrend ? (
              <div className="h-80 flex items-center justify-center">加载中...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={profitTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#8884d8" name="实际分润" />
                  <Line type="monotone" dataKey="predicted" stroke="#82ca9d" name="预测分润" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>团队贡献占比</CardTitle>
            <CardDescription>按区域团队分布</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoadingContribution ? (
              <div className="h-80 flex items-center justify-center">加载中...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={teamContribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {teamContribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>处理效率对比</CardTitle>
            <CardDescription>代理处理时间(分钟)</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoadingAgents ? (
              <div className="h-80 flex items-center justify-center">加载中...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sortedAgentPerformance.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="processingEfficiency" name="处理时间(分钟)" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>排名</TableHead>
              <TableHead>代理名称</TableHead>
              <TableHead className="text-right">分润金额(USDT)</TableHead>
              <TableHead className="text-right">处理效率(分钟)</TableHead>
              <TableHead className="text-right">订单成功率</TableHead>
              <TableHead className="text-right">订单量</TableHead>
              <TableHead>趋势</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingAgents ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : sortedAgentPerformance?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  暂无代理绩效数据
                </TableCell>
              </TableRow>
            ) : (
              sortedAgentPerformance?.map((agent, index) => (
                <TableRow key={agent.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell className="text-right">{agent.profit.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{agent.processingEfficiency}</TableCell>
                  <TableCell className="text-right">{agent.successRate}%</TableCell>
                  <TableCell className="text-right">{agent.orderVolume}</TableCell>
                  <TableCell>
                    {agent.trend === "up" ? (
                      <Badge className="bg-green-500">上升</Badge>
                    ) : (
                      <Badge className="bg-red-500">下降</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AgentPerformance;
