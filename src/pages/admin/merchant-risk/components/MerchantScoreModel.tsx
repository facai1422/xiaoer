
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Merchant {
  id: string;
  name: string;
  score: number;
  successRate: number;
  complaintRate: number;
  refundRate: number;
  status: "active" | "restricted" | "suspended";
}

const MerchantScoreModel = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [weights, setWeights] = useState({
    successRate: 40,
    complaintRate: 30,
    refundRate: 30
  });

  // 模拟获取商户列表
  const { data: merchants, isLoading } = useQuery({
    queryKey: ["merchants-scoring"],
    queryFn: async () => {
      try {
        // 实际项目中应该从数据库获取
        // 这里先使用模拟数据
        return [
          {
            id: "1",
            name: "优质商户A",
            score: 92,
            successRate: 98.5,
            complaintRate: 0.8,
            refundRate: 1.2,
            status: "active"
          },
          {
            id: "2",
            name: "普通商户B",
            score: 78,
            successRate: 92.3,
            complaintRate: 2.5,
            refundRate: 3.8,
            status: "active"
          },
          {
            id: "3",
            name: "风险商户C",
            score: 55,
            successRate: 85.7,
            complaintRate: 5.2,
            refundRate: 8.3,
            status: "restricted"
          },
          {
            id: "4",
            name: "问题商户D",
            score: 32,
            successRate: 72.4,
            complaintRate: 9.8,
            refundRate: 12.5,
            status: "suspended"
          }
        ] as Merchant[];
      } catch (error) {
        console.error("Error fetching merchants:", error);
        toast.error("获取商户列表失败");
        return [];
      }
    }
  });

  const filteredMerchants = merchants?.filter(merchant => 
    merchant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">正常</Badge>;
      case "restricted":
        return <Badge className="bg-yellow-500">受限</Badge>;
      case "suspended":
        return <Badge className="bg-red-500">暂停</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const handleWeightChange = (type: keyof typeof weights, value: number[]) => {
    setWeights(prev => ({
      ...prev,
      [type]: value[0]
    }));
  };

  const saveModelSettings = () => {
    // 实际项目中应该将配置保存到数据库
    toast.success("评分模型设置已保存");
    setIsSettingsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">商户评分模型</h2>
        <p className="text-gray-500 mb-6">
          根据订单成功率、投诉率、退单率动态评分，辅助商户风险管理
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="relative max-w-sm">
          <Input 
            placeholder="搜索商户" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">配置评分模型</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>评分模型配置</DialogTitle>
              <DialogDescription>
                调整各指标在评分计算中的权重
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>订单成功率权重: {weights.successRate}%</Label>
                  <span className="text-sm text-muted-foreground">
                    当前值：{weights.successRate}%
                  </span>
                </div>
                <Slider 
                  value={[weights.successRate]} 
                  min={10} 
                  max={70} 
                  step={5} 
                  onValueChange={(value) => handleWeightChange("successRate", value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>投诉率权重: {weights.complaintRate}%</Label>
                  <span className="text-sm text-muted-foreground">
                    当前值：{weights.complaintRate}%
                  </span>
                </div>
                <Slider 
                  value={[weights.complaintRate]} 
                  min={10} 
                  max={50} 
                  step={5} 
                  onValueChange={(value) => handleWeightChange("complaintRate", value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>退单率权重: {weights.refundRate}%</Label>
                  <span className="text-sm text-muted-foreground">
                    当前值：{weights.refundRate}%
                  </span>
                </div>
                <Slider 
                  value={[weights.refundRate]} 
                  min={10} 
                  max={50} 
                  step={5} 
                  onValueChange={(value) => handleWeightChange("refundRate", value)}
                />
              </div>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm">总权重: {weights.successRate + weights.complaintRate + weights.refundRate}% (建议保持在100%)</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={saveModelSettings}>保存配置</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>评分规则说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted p-3 rounded-md">
              <h4 className="font-medium mb-2">商户评分区间</h4>
              <ul className="space-y-1 text-sm">
                <li><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>优质商户：80-100分</li>
                <li><span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>普通商户：60-79分</li>
                <li><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>风险商户：0-59分</li>
              </ul>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <h4 className="font-medium mb-2">计算因子权重</h4>
              <ul className="space-y-1 text-sm">
                <li>订单成功率：{weights.successRate}%</li>
                <li>投诉率：{weights.complaintRate}%</li>
                <li>退单率：{weights.refundRate}%</li>
              </ul>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <h4 className="font-medium mb-2">自动风控措施</h4>
              <ul className="space-y-1 text-sm">
                <li>低于60分：限制日提交量</li>
                <li>低于40分：暂停服务</li>
                <li>连续3日上升：优先处理</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>商户名称</TableHead>
              <TableHead className="text-right">综合评分</TableHead>
              <TableHead className="text-right">订单成功率</TableHead>
              <TableHead className="text-right">投诉率</TableHead>
              <TableHead className="text-right">退单率</TableHead>
              <TableHead>商户状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : filteredMerchants?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  未找到符合条件的商户
                </TableCell>
              </TableRow>
            ) : (
              filteredMerchants?.map((merchant) => (
                <TableRow key={merchant.id}>
                  <TableCell className="font-medium">{merchant.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={getScoreColor(merchant.score)}>
                        {merchant.score}
                      </span>
                      <div className="w-20">
                        <Progress 
                          value={merchant.score} 
                          className={`h-2 ${getScoreProgressColor(merchant.score)}`}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{merchant.successRate}%</TableCell>
                  <TableCell className="text-right">{merchant.complaintRate}%</TableCell>
                  <TableCell className="text-right">{merchant.refundRate}%</TableCell>
                  <TableCell>{getStatusBadge(merchant.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">详情</Button>
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

export default MerchantScoreModel;
