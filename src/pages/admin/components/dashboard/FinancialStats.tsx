import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { adminSupabase } from "@/utils/adminSupabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface FinancialStatsProps {
  date: Date;
}

interface RechargeOrder {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

export const FinancialStats = ({ date }: FinancialStatsProps) => {
  const navigate = useNavigate();

  const { data: financialStats, isLoading: loadingFinancialStats } = useQuery({
    queryKey: ['dashboard', 'financialStats', date],
    queryFn: async () => {
      try {
        console.log('📊 FinancialStats: 开始查询真实业务数据...');
        
        // 修复：查询真实的业务表
        const [rechargesRes, withdrawalsRes] = await Promise.all([
          adminSupabase.from('recharge_orders').select('*').then((res) => res.data as RechargeOrder[] || []),
          adminSupabase.from('withdrawal_requests').select('*').then((res) => res.data as WithdrawalRequest[] || [])
        ]);
        
        // 计算完成的充值和提现
        const completedRecharges = rechargesRes.filter((r: RechargeOrder) => r.status === 'completed');
        const completedWithdrawals = withdrawalsRes.filter((w: WithdrawalRequest) => w.status === 'completed');
        const pendingRecharges = rechargesRes.filter((r: RechargeOrder) => r.status === 'pending');
        
        // 计算今日数据
        const todayStart = format(date, 'yyyy-MM-dd');
        const todayRecharges = completedRecharges.filter((r: RechargeOrder) => {
          const rechargeDate = format(new Date(r.created_at || ''), 'yyyy-MM-dd');
          return rechargeDate === todayStart;
        });
        
        const todayWithdrawals = completedWithdrawals.filter((w: WithdrawalRequest) => {
          const withdrawalDate = format(new Date(w.created_at || ''), 'yyyy-MM-dd');
          return withdrawalDate === todayStart;
        });
        
        // 计算金额
        const totalRechargeAmount = completedRecharges.reduce((sum: number, r: RechargeOrder) => sum + (Number(r.amount) || 0), 0);
        const totalWithdrawalAmount = completedWithdrawals.reduce((sum: number, w: WithdrawalRequest) => sum + (Number(w.amount) || 0), 0);
        const pendingAmount = pendingRecharges.reduce((sum: number, r: RechargeOrder) => sum + (Number(r.amount) || 0), 0);
        const todayRechargeAmount = todayRecharges.reduce((sum: number, r: RechargeOrder) => sum + (Number(r.amount) || 0), 0);
        const todayWithdrawalAmount = todayWithdrawals.reduce((sum: number, w: WithdrawalRequest) => sum + (Number(w.amount) || 0), 0);
        
        const result = {
          total_recharge_amount: Math.round(totalRechargeAmount * 100) / 100,
          total_withdrawal_amount: Math.round(totalWithdrawalAmount * 100) / 100,
          pending_distribution_amount: Math.round(pendingAmount * 100) / 100,
          today_recharge_amount: Math.round(todayRechargeAmount * 100) / 100,
          today_withdrawal_amount: Math.round(todayWithdrawalAmount * 100) / 100,
          net_profit: Math.round((totalRechargeAmount - totalWithdrawalAmount) * 100) / 100
        };
        
        console.log('📊 FinancialStats结果:', result);
        return result;
        
      } catch (error) {
        console.error('❌ FinancialStats查询失败:', error);
        if ((error as Error).message?.includes('permission denied')) {
          toast.error("无权访问管理员功能");
          navigate('/admin/login');
          throw new Error("Unauthorized access");
        }
        
        // 返回默认值
        return {
          total_recharge_amount: 0,
          total_withdrawal_amount: 0,
          pending_distribution_amount: 0,
          today_recharge_amount: 0,
          today_withdrawal_amount: 0,
          net_profit: 0
        };
      }
    },
    retry: false,
    staleTime: 30000 // Cache data for 30 seconds
  });

  const formatFinancialStats = [
    { label: "总充值金额", value: loadingFinancialStats ? <Skeleton className="h-6 w-24" /> : `${financialStats?.total_recharge_amount || 0} USDT` },
    { label: "总提现金额", value: loadingFinancialStats ? <Skeleton className="h-6 w-24" /> : `${financialStats?.total_withdrawal_amount || 0} USDT` },
    { label: "待处理金额", value: loadingFinancialStats ? <Skeleton className="h-6 w-24" /> : `${financialStats?.pending_distribution_amount || 0} USDT` },
    { label: "今日充值", value: loadingFinancialStats ? <Skeleton className="h-6 w-24" /> : `${financialStats?.today_recharge_amount || 0} USDT` },
    { label: "今日提现", value: loadingFinancialStats ? <Skeleton className="h-6 w-24" /> : `${financialStats?.today_withdrawal_amount || 0} USDT` },
    { label: "净利润", value: loadingFinancialStats ? <Skeleton className="h-6 w-24" /> : `${financialStats?.net_profit || 0} USDT` },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {formatFinancialStats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="text-sm text-gray-600">{stat.label}</div>
            <div className="text-lg font-medium mt-1">{stat.value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};
