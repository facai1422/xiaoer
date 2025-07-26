import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Users, Activity, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BalanceRecharge {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

interface User {
  id: string;
  created_at: string;
}

export const Stats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['home-stats'],
    queryFn: async () => {
      try {
        console.log('📊 HomeStats: 开始查询用户和业务数据...');
        
        // 修复：查询真实的users表，而不是stats_user表
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*') as { data: User[] | null; error: Error | null };
        
        if (usersError) {
          console.warn('⚠️ users表查询失败，降级到admin_profiles');
          const { data: adminsData } = await supabase
            .from('admin_profiles')
            .select('*');
          
          const totalUsers = adminsData?.length || 0;
          console.log(`📊 HomeStats降级: ${totalUsers} 个管理员`);
          
          return {
            userStats: { 
              total_users: totalUsers, 
              new_users_today: 0 
            },
            financialStats: { 
              pending_distribution_amount: 0, 
              recharging_amount: 0 
            }
          };
        }
        
        const totalUsers = usersData?.length || 0;
        
        // 计算今日新用户
        const today = new Date().toISOString().split('T')[0];
        const todayUsers = usersData?.filter(user => {
          const userDate = new Date(user.created_at || '').toISOString().split('T')[0];
          return userDate === today;
        }).length || 0;
        
        console.log(`✅ HomeStats用户数据: ${totalUsers} 个用户，今日新增 ${todayUsers} 个`);
        
        // 查询业务数据（修复：查询真实的业务表）
        const [rechargesRes, withdrawalsRes] = await Promise.all([
          supabase.from('recharge_orders').select('*').then((res) => res.data as BalanceRecharge[] || []),
          supabase.from('withdrawal_requests').select('*').then((res) => res.data as Withdrawal[] || [])
        ]);
        
        // 计算业务数据
        const completedRecharges = rechargesRes.filter((r: BalanceRecharge) => r.status === 'completed');
        const pendingRecharges = rechargesRes.filter((r: BalanceRecharge) => r.status === 'pending');
        
        const totalRechargeAmount = completedRecharges.reduce((sum: number, r: BalanceRecharge) => sum + (Number(r.amount) || 0), 0);
        const pendingAmount = pendingRecharges.reduce((sum: number, r: BalanceRecharge) => sum + (Number(r.amount) || 0), 0);
        
        console.log(`💰 业务数据: ${completedRecharges.length} 笔完成充值，${pendingRecharges.length} 笔待处理`);
        console.log(`💰 充值总额: ${totalRechargeAmount} USDT，待处理: ${pendingAmount} USDT`);
        
        return {
          userStats: { 
            total_users: totalUsers, 
            new_users_today: todayUsers 
          },
          financialStats: { 
            pending_distribution_amount: pendingAmount, 
            recharging_amount: totalRechargeAmount 
          }
        };
        
      } catch (error) {
        console.error('❌ HomeStats查询失败:', error);
        
        // 返回默认值而不是抛出错误
        console.log('🔄 使用默认数据');
        return {
          userStats: { total_users: 0, new_users_today: 0 },
          financialStats: { pending_distribution_amount: 0, recharging_amount: 0 }
        };
      }
    },
    retry: false,
    staleTime: 30000 // Cache data for 30 seconds
  });

  const statItems = [
    {
      title: "平台用户",
      value: stats?.userStats?.total_users || 0,
      change: `今日新增 ${stats?.userStats?.new_users_today || 0}`,
      icon: Users,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500"
    },
    {
      title: "待处理订单",
      value: stats?.financialStats?.pending_distribution_amount || 0,
      change: "实时更新",
      icon: Activity,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-500"
    },
    {
      title: "交易总额",
      value: stats?.financialStats?.recharging_amount || 0,
      change: "累计交易金额",
      icon: TrendingUp,
      bgColor: "bg-green-50",
      iconColor: "text-green-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {statItems.map((item) => (
        <Card key={item.title} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{item.title}</p>
              {isLoading ? (
                <Skeleton className="h-8 w-20 mt-2" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 mt-2">{item.value}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">{item.change}</p>
            </div>
            <div className={`p-3 rounded-full ${item.bgColor}`}>
              <item.icon className={`h-6 w-6 ${item.iconColor}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
