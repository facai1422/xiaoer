
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface PendingItemsProps {
  date: Date;
}

export const PendingItems = ({ date }: PendingItemsProps) => {
  const navigate = useNavigate();

  const { data: pendingItems, isLoading: loadingPendingItems } = useQuery({
    queryKey: ['dashboard', 'pendingItems', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stats_pending_items')
        .select('*')
        .eq('date', format(date, 'yyyy-MM-dd'))
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching pending items:', error);
        if (error.code === 'PGRST301' || error.message?.includes('permission denied')) {
          toast.error("无权访问管理员功能");
          navigate('/admin/login');
          throw new Error("Unauthorized access");
        }
        toast.error("加载待处理事项失败");
        throw error;
      }

      return data ?? {
        balance_recharge_pending: 0,
        balance_withdrawal_pending: 0,
        merchant_withdrawal_pending: 0,
        merchant_address_pending: 0,
        phone_orders_pending: 0,
        electricity_orders_pending: 0,
        oil_card_orders_pending: 0,
        online_orders_pending: 0
      };
    },
    retry: false,
    staleTime: 30000 // Cache data for 30 seconds
  });

  const formatPendingItems = [
    { label: "余额充值待处理", value: loadingPendingItems ? <Skeleton className="h-6 w-16" /> : `${pendingItems?.balance_recharge_pending || 0} 个` },
    { label: "余额提现待处理", value: loadingPendingItems ? <Skeleton className="h-6 w-16" /> : `${pendingItems?.balance_withdrawal_pending || 0} 个` },
    { label: "商家提现待处理", value: loadingPendingItems ? <Skeleton className="h-6 w-16" /> : `${pendingItems?.merchant_withdrawal_pending || 0} 个` },
    { label: "商家地址待审核", value: loadingPendingItems ? <Skeleton className="h-6 w-16" /> : `${pendingItems?.merchant_address_pending || 0} 个` },
    { label: "话费订单待处理", value: loadingPendingItems ? <Skeleton className="h-6 w-16" /> : `${pendingItems?.phone_orders_pending || 0} 个` },
    { label: "电费订单待处理", value: loadingPendingItems ? <Skeleton className="h-6 w-16" /> : `${pendingItems?.electricity_orders_pending || 0} 个` },
    { label: "油卡订单待处理", value: loadingPendingItems ? <Skeleton className="h-6 w-16" /> : `${pendingItems?.oil_card_orders_pending || 0} 个` },
    { label: "在线订单待处理", value: loadingPendingItems ? <Skeleton className="h-6 w-16" /> : `${pendingItems?.online_orders_pending || 0} 个` },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <h2 className="text-lg font-medium p-4 md:p-6 pb-4">待处理事项</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 md:px-6 pb-6">
        {formatPendingItems.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="text-sm text-gray-600">{stat.label}</div>
            <div className="text-lg font-medium mt-1">{stat.value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};
