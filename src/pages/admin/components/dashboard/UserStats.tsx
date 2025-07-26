import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface UserStatsProps {
  date: Date;
}

interface User {
  id: string;
  created_at: string;
}

interface AdminProfile {
  id: string;
  role: string;
  created_at: string;
}

export const UserStats = ({ date }: UserStatsProps) => {
  const navigate = useNavigate();

  const { data: userStats, isLoading: loadingUserStats } = useQuery({
    queryKey: ['dashboard', 'userStats', date],
    queryFn: async () => {
      try {
        console.log('📊 UserStats: 开始查询真实用户数据...');
        
        // 修复：查询真实的users表
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*') as { data: User[] | null; error: Error | null };
        
        if (usersError) {
          console.warn('⚠️ users表查询失败:', usersError.message);
          // 降级到admin_profiles
          const { data: adminsData } = await supabase
            .from('admin_profiles')
            .select('*') as { data: AdminProfile[] | null; error: Error | null };
          
          return {
            total_users: adminsData?.length || 0,
            new_users_today: 0,
            new_users_yesterday: 0,
            total_merchants: 0,
            new_merchants_today: 0,
            new_merchants_yesterday: 0
          };
        }
        
        const totalUsers = usersData?.length || 0;
        console.log(`✅ users表查询成功: ${totalUsers} 个用户`);
        
        // 计算今日和昨日新用户
        const todayStart = format(date, 'yyyy-MM-dd');
        const yesterday = new Date(date);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStart = format(yesterday, 'yyyy-MM-dd');
        
        const todayUsers = usersData?.filter(user => {
          const userDate = format(new Date(user.created_at || ''), 'yyyy-MM-dd');
          return userDate === todayStart;
        }).length || 0;
        
        const yesterdayUsers = usersData?.filter(user => {
          const userDate = format(new Date(user.created_at || ''), 'yyyy-MM-dd');
          return userDate === yesterdayStart;
        }).length || 0;
        
        // 查询管理员中的商户数据
        const { data: adminData } = await supabase
          .from('admin_profiles')
          .select('*') as { data: AdminProfile[] | null; error: Error | null };
        
        const merchants = adminData?.filter(admin => admin.role === 'merchant') || [];
        const totalMerchants = merchants.length;
        
        const todayMerchants = merchants.filter(merchant => {
          const merchantDate = format(new Date(merchant.created_at || ''), 'yyyy-MM-dd');
          return merchantDate === todayStart;
        }).length;
        
        const yesterdayMerchants = merchants.filter(merchant => {
          const merchantDate = format(new Date(merchant.created_at || ''), 'yyyy-MM-dd');
          return merchantDate === yesterdayStart;
        }).length;
        
        const result = {
          total_users: totalUsers,
          new_users_today: todayUsers,
          new_users_yesterday: yesterdayUsers,
          total_merchants: totalMerchants,
          new_merchants_today: todayMerchants,
          new_merchants_yesterday: yesterdayMerchants
        };
        
        console.log('📊 UserStats结果:', result);
        return result;
        
      } catch (error) {
        console.error('❌ UserStats查询失败:', error);
        if ((error as Error).message?.includes('permission denied')) {
          toast.error("无权访问管理员功能");
          navigate('/admin/login');
          throw new Error("Unauthorized access");
        }
        
        // 返回默认值
        return {
          total_users: 0,
          new_users_today: 0,
          new_users_yesterday: 0,
          total_merchants: 0,
          new_merchants_today: 0,
          new_merchants_yesterday: 0
        };
      }
    },
    retry: false,
    staleTime: 30000 // Cache data for 30 seconds
  });

  const formatUserStats = [
    { label: "总用户数", value: loadingUserStats ? <Skeleton className="h-6 w-24" /> : userStats?.total_users || 0 },
    { label: "今日新增", value: loadingUserStats ? <Skeleton className="h-6 w-24" /> : userStats?.new_users_today || 0 },
    { label: "昨日新增", value: loadingUserStats ? <Skeleton className="h-6 w-24" /> : userStats?.new_users_yesterday || 0 },
    { label: "总商户数", value: loadingUserStats ? <Skeleton className="h-6 w-24" /> : userStats?.total_merchants || 0 },
    { label: "今日新增商户", value: loadingUserStats ? <Skeleton className="h-6 w-24" /> : userStats?.new_merchants_today || 0 },
    { label: "昨日新增商户", value: loadingUserStats ? <Skeleton className="h-6 w-24" /> : userStats?.new_merchants_yesterday || 0 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {formatUserStats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="text-sm text-gray-600">{stat.label}</div>
            <div className="text-lg font-medium mt-1">{stat.value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};
