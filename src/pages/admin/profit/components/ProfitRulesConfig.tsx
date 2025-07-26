
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface Agent {
  id: string;
  nickname: string;
  base_rate: number; // 上级汇率
  custom_rate: number; // 代理自定义汇率
  max_adjustment: number; // 允许的最大调整幅度
  profit_example: string; // 分润示例
  level: string; // 代理等级
}

const profitFormSchema = z.object({
  agentId: z.string(),
  baseRate: z.coerce.number().min(0),
  customRate: z.coerce.number().min(0),
  maxAdjustment: z.coerce.number().min(0).max(100),
});

const ProfitRulesConfig = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const form = useForm<z.infer<typeof profitFormSchema>>({
    resolver: zodResolver(profitFormSchema),
    defaultValues: {
      agentId: "",
      baseRate: 7.0,
      customRate: 6.8,
      maxAdjustment: 5,
    },
  });

  // 模拟获取代理分润列表
  const { data: agents, isLoading } = useQuery({
    queryKey: ["agents-profit"],
    queryFn: async () => {
      try {
        // 实际项目中应该从数据库获取
        // 这里先使用模拟数据
        return [
          {
            id: "1",
            nickname: "省级代理A",
            base_rate: 7.2,
            custom_rate: 7.0,
            max_adjustment: 5,
            profit_example: "订单100CNY, 分润约2.78USDT",
            level: "省级代理"
          },
          {
            id: "2",
            nickname: "市级代理B",
            base_rate: 7.0,
            custom_rate: 6.8,
            max_adjustment: 3,
            profit_example: "订单100CNY, 分润约2.86USDT",
            level: "市级代理"
          },
          {
            id: "3",
            nickname: "区级代理C",
            base_rate: 6.8,
            custom_rate: 6.5,
            max_adjustment: 2,
            profit_example: "订单100CNY, 分润约4.41USDT",
            level: "区级代理"
          }
        ] as Agent[];
      } catch (error) {
        console.error("Error fetching agents profit:", error);
        toast.error("获取代理分润列表失败");
        return [];
      }
    }
  });

  const handleEditProfit = (agent: Agent) => {
    setSelectedAgent(agent);
    form.setValue("agentId", agent.id);
    form.setValue("baseRate", agent.base_rate);
    form.setValue("customRate", agent.custom_rate);
    form.setValue("maxAdjustment", agent.max_adjustment);
    setIsEditDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof profitFormSchema>) => {
    // 实际项目中应该更新数据库
    toast.success(`已更新代理 ${selectedAgent?.nickname} 的分润规则`);
    setIsEditDialogOpen(false);
  };

  // 计算分润示例
  const calculateProfitExample = (baseRate: number, customRate: number) => {
    const orderAmount = 100; // CNY
    const profit = orderAmount * (baseRate - customRate) / baseRate;
    return profit.toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">分润规则配置</h2>
        <p className="text-gray-500 mb-6">
          配置代理的分润规则,包括汇率差计算逻辑和分润公式
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>分润计算公式</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono">
              分润USDT = 订单金额（CNY） × (代理汇率 - 上级汇率) / 当前USDT兑CNY汇率
            </p>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">示例计算:</p>
              <ul className="list-disc pl-5 mt-2 text-sm">
                <li>上级汇率：1 USDT = 7.0 CNY</li>
                <li>代理设置汇率：1 USDT = 6.8 CNY</li>
                <li>订单金额：100 CNY</li>
                <li>分润 = 100 × (7.0 - 6.8) / 7.0 ≈ 2.86 USDT</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>代理名称</TableHead>
              <TableHead>代理级别</TableHead>
              <TableHead className="text-right">上级汇率</TableHead>
              <TableHead className="text-right">代理自定义汇率</TableHead>
              <TableHead className="text-right">最大调整幅度</TableHead>
              <TableHead>分润示例</TableHead>
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
            ) : agents?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  暂无代理分润数据
                </TableCell>
              </TableRow>
            ) : (
              agents?.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">{agent.nickname}</TableCell>
                  <TableCell>{agent.level}</TableCell>
                  <TableCell className="text-right">{agent.base_rate}</TableCell>
                  <TableCell className="text-right">{agent.custom_rate}</TableCell>
                  <TableCell className="text-right">{agent.max_adjustment}%</TableCell>
                  <TableCell>{agent.profit_example}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleEditProfit(agent)}>
                      编辑规则
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑分润规则</DialogTitle>
            <DialogDescription>
              修改代理 {selectedAgent?.nickname} 的分润规则。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="baseRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>上级汇率 (1 USDT = ? CNY)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>代理自定义汇率 (1 USDT = ? CNY)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxAdjustment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>最大调整幅度 (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm">
                  示例: 订单100CNY, 分润约 
                  <span className="font-bold">
                    {calculateProfitExample(
                      form.watch("baseRate"), 
                      form.watch("customRate")
                    )}
                  </span> 
                  USDT
                </p>
              </div>
              <DialogFooter>
                <Button type="submit">保存设置</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfitRulesConfig;
