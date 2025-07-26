
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { OrderStats as OrderStatsType } from "@/types/payment";

export const OrderStats = () => {
  const { data: stats } = useQuery({
    queryKey: ['channel-orders-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayStats, error: todayError } = await supabase
        .from('channel_orders')
        .select('status, count(*), sum(amount), sum(usdt_amount)')
        .gte('created_at', today.toISOString())
        .order('status')
        .returns<OrderStatsType[]>();

      if (todayError) throw todayError;

      const { data: totalStats, error: totalError } = await supabase
        .from('channel_orders')
        .select('status, count(*), sum(amount), sum(usdt_amount)')
        .order('status')
        .returns<OrderStatsType[]>();

      if (totalError) throw totalError;

      return {
        today: todayStats,
        total: totalStats
      };
    }
  });

  const getStatusData = (data: any[] | null, status: string) => {
    const statusData = data?.find(item => item.status === status);
    return {
      count: statusData?.count || 0,
      amount: statusData?.sum?.amount || 0,
      usdtAmount: statusData?.sum?.usdt_amount || 0
    };
  };

  const getTotalData = (data: any[] | null) => {
    if (!data) return { count: 0, amount: 0, usdtAmount: 0 };
    return data.reduce((acc, item) => ({
      count: acc.count + (item.count || 0),
      amount: acc.amount + (item.sum?.amount || 0),
      usdtAmount: acc.usdtAmount + (item.sum?.usdt_amount || 0)
    }), { count: 0, amount: 0, usdtAmount: 0 });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4">
        <h3 className="font-medium text-sm text-gray-500 mb-4">今日订单统计</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>总订单数</span>
            <span className="font-medium">{getTotalData(stats?.today).count}</span>
          </div>
          <div className="flex justify-between">
            <span>总金额</span>
            <span className="font-medium">¥{getTotalData(stats?.today).amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>总USDT</span>
            <span className="font-medium">${getTotalData(stats?.today).usdtAmount.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium text-sm text-gray-500 mb-4">今日状态分布</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>待处理</span>
            <span className="font-medium">{getStatusData(stats?.today, 'pending').count}</span>
          </div>
          <div className="flex justify-between">
            <span>处理中</span>
            <span className="font-medium">{getStatusData(stats?.today, 'processing').count}</span>
          </div>
          <div className="flex justify-between">
            <span>已完成</span>
            <span className="font-medium">{getStatusData(stats?.today, 'completed').count}</span>
          </div>
          <div className="flex justify-between">
            <span>已失败</span>
            <span className="font-medium">{getStatusData(stats?.today, 'failed').count}</span>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium text-sm text-gray-500 mb-4">累计订单统计</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>总订单数</span>
            <span className="font-medium">{getTotalData(stats?.total).count}</span>
          </div>
          <div className="flex justify-between">
            <span>总金额</span>
            <span className="font-medium">¥{getTotalData(stats?.total).amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>总USDT</span>
            <span className="font-medium">${getTotalData(stats?.total).usdtAmount.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium text-sm text-gray-500 mb-4">累计状态分布</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>待处理</span>
            <span className="font-medium">{getStatusData(stats?.total, 'pending').count}</span>
          </div>
          <div className="flex justify-between">
            <span>处理中</span>
            <span className="font-medium">{getStatusData(stats?.total, 'processing').count}</span>
          </div>
          <div className="flex justify-between">
            <span>已完成</span>
            <span className="font-medium">{getStatusData(stats?.total, 'completed').count}</span>
          </div>
          <div className="flex justify-between">
            <span>已失败</span>
            <span className="font-medium">{getStatusData(stats?.total, 'failed').count}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
