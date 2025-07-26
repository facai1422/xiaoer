import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Users, Activity, TrendingUp } from "lucide-react";

interface BusinessStatsProps {
  date: Date;
}

interface User {
  id: string;
  created_at: string;
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

export const BusinessStats = ({ date }: BusinessStatsProps) => {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats', date],
    queryFn: async () => {
      try {
        console.log('📊 BusinessStats: 开始查询用户和业务数据...');
        
        // 修复：查询真实的users表，而不是stats_user表
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*') as { data: User[] | null; error: Error | null };
        
        if (usersError) {
          console.warn('⚠️ users表查询失败，可能表不存在:', usersError.message);
          // 降级到admin_profiles表
          const { data: adminsData } = await supabase
            .from('admin_profiles')
            .select('*');
          
          const fallbackUsers = adminsData?.length || 0;
          console.log(`📊 降级使用admin_profiles表: ${fallbackUsers} 个管理员`);
          
          return {
            userStats: { 
              total_users: fallbackUsers, 
              new_users_today: 0 
            },
            financialStats: { 
              pending_distribution_amount: 0, 
              recharging_amount: 0 
            }
          };
        }
        
        const totalUsers = usersData?.length || 0;
        console.log(`✅ users表查询成功: ${totalUsers} 个用户`);
        
        // 计算今日新注册用户
        const todayStart = format(date, 'yyyy-MM-dd');
        const todayUsers = usersData?.filter(user => {
          const userDate = format(new Date(user.created_at || ''), 'yyyy-MM-dd');
          return userDate === todayStart;
        }).length || 0;
        
        console.log(`📊 今日新增用户: ${todayUsers} 个`);
        
        // 查询业务数据（修复：查询真实的业务表）
        const [rechargesRes, withdrawalsRes] = await Promise.all([
          supabase.from('recharge_orders').select('*').then((res) => res.data as RechargeOrder[] || []),
          supabase.from('withdrawal_requests').select('*').then((res) => res.data as WithdrawalRequest[] || [])
        ]);
        
        // 计算业务数据
        const completedRecharges = rechargesRes.filter((r: RechargeOrder) => r.status === 'completed');
        const pendingRecharges = rechargesRes.filter((r: RechargeOrder) => r.status === 'pending');
        
        const totalRechargeAmount = completedRecharges.reduce((sum: number, r: RechargeOrder) => sum + (Number(r.amount) || 0), 0);
        const pendingAmount = pendingRecharges.reduce((sum: number, r: RechargeOrder) => sum + (Number(r.amount) || 0), 0);
        
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
        console.error('❌ BusinessStats查询失败:', error);
        if ((error as Error).message?.includes('permission denied')) {
          toast.error("无权访问管理员功能");
          navigate('/admin/login');
          throw new Error("Unauthorized access");
        }
        
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-6 w-[120px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statItems.map((item) => (
        <Card 
          key={item.title} 
          className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-xl ${item.bgColor}`}>
              <item.icon className={`w-8 h-8 ${item.iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-600 text-lg mb-1">{item.title}</h3>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-gray-900">
                  {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                </span>
                <span className="text-sm text-green-500 mt-1">{item.change}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
