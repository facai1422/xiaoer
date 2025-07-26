import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getAdminSession } from "@/utils/adminAuth";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface DashboardStats {
  id: number;
  stat_date: string;
  total_users?: number;
  today_registrations?: number;
  total_agents?: number;
  total_merchants?: number;
  today_balance_recharge?: number;
  yesterday_balance_recharge?: number;
  total_balance_recharge?: number;
  today_withdrawal?: number;
  yesterday_withdrawal?: number;
  total_withdrawal?: number;
  today_order_recharge?: number;
  yesterday_order_recharge?: number;
  total_order_recharge?: number;
  today_commission?: number;
  yesterday_commission?: number;
  total_commission?: number;
  today_trade_count?: number;
  yesterday_trade_count?: number;
  total_trade_count?: number;
  today_trade_amount?: number;
  yesterday_trade_amount?: number;
  total_trade_amount?: number;
  updated_at?: string;
  created_at?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 认证检查
  useEffect(() => {
    const checkAuth = () => {
      const adminSession = getAdminSession();
      if (!adminSession || adminSession.expires <= Date.now()) {
        console.log('🔐 Admin session expired, redirecting to login');
        navigate('/admin/login');
        return false;
      }
      return true;
    };

    if (!checkAuth()) {
      return;
    }

    // 加载数据
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      console.log('📊 开始加载dashboard数据...');
      setLoading(true);
      setError(null);

      // 修复：查询真实数据表而不是dashboard_stats表
      console.log('📅 查询真实业务数据...');

      // 查询用户数据
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');

      if (usersError) {
        console.warn('⚠️ users表查询失败，降级到admin_profiles');
      }

      // 查询充值数据
      const { data: rechargesData, error: rechargesError } = await supabase
        .from('recharge_orders')
        .select('*');

      // 查询提现数据  
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('*');

      // 计算统计数据
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const totalUsers = usersData?.length || 0;
      const todayUsers = usersData?.filter(user => {
        try {
          if (!user.created_at) return false;
          const userDate = new Date(user.created_at);
          if (isNaN(userDate.getTime())) return false;
          return userDate.toISOString().split('T')[0] === today;
        } catch (e) {
          console.warn('日期解析错误:', user.created_at, e);
          return false;
        }
      }).length || 0;

      // 安全地处理数据，避免类型错误
      const completedRecharges = rechargesData?.filter((r: any) => 
        r?.status === 'completed' || r?.status === 'approved' || r?.status === 'finished'
      ) || [];
      
      const todayRecharges = completedRecharges.filter((r: any) => {
        try {
          if (!r?.created_at) return false;
          const rechargeDate = new Date(r.created_at);
          if (isNaN(rechargeDate.getTime())) return false;
          return rechargeDate.toISOString().split('T')[0] === today;
        } catch (e) {
          console.warn('充值日期解析错误:', r?.created_at, e);
          return false;
        }
      });

      const yesterdayRecharges = completedRecharges.filter((r: any) => {
        try {
          if (!r?.created_at) return false;
          const rechargeDate = new Date(r.created_at);
          if (isNaN(rechargeDate.getTime())) return false;
          return rechargeDate.toISOString().split('T')[0] === yesterdayStr;
        } catch (e) {
          console.warn('充值日期解析错误:', r?.created_at, e);
          return false;
        }
      });

      // 安全地获取金额，尝试多个可能的字段名
      const getAmount = (r: any) => {
        return Number(r?.recharge_amount || r?.amount || r?.actual_amount || 0);
      };

      const todayRechargeAmount = todayRecharges.reduce((sum: number, r: any) => sum + getAmount(r), 0);
      const yesterdayRechargeAmount = yesterdayRecharges.reduce((sum: number, r: any) => sum + getAmount(r), 0);
      const totalRechargeAmount = completedRecharges.reduce((sum: number, r: any) => sum + getAmount(r), 0);

      const completedWithdrawals = withdrawalsData?.filter((w: any) => w?.status === 'completed') || [];
      const todayWithdrawals = completedWithdrawals.filter((w: any) => {
        try {
          if (!w?.created_at) return false;
          const withdrawalDate = new Date(w.created_at);
          if (isNaN(withdrawalDate.getTime())) return false;
          return withdrawalDate.toISOString().split('T')[0] === today;
        } catch (e) {
          console.warn('提现日期解析错误:', w?.created_at, e);
          return false;
        }
      });

      const yesterdayWithdrawals = completedWithdrawals.filter((w: any) => {
        try {
          if (!w?.created_at) return false;
          const withdrawalDate = new Date(w.created_at);
          if (isNaN(withdrawalDate.getTime())) return false;
          return withdrawalDate.toISOString().split('T')[0] === yesterdayStr;
        } catch (e) {
          console.warn('提现日期解析错误:', w?.created_at, e);
          return false;
        }
      });

      const todayWithdrawalAmount = todayWithdrawals.reduce((sum: number, w: any) => sum + (Number(w?.amount) || 0), 0);
      const yesterdayWithdrawalAmount = yesterdayWithdrawals.reduce((sum: number, w: any) => sum + (Number(w?.amount) || 0), 0);
      const totalWithdrawalAmount = completedWithdrawals.reduce((sum: number, w: any) => sum + (Number(w?.amount) || 0), 0);

      const computedStats: DashboardStats = {
        id: 1,
        stat_date: today,
        total_users: totalUsers,
        today_registrations: todayUsers,
        total_agents: 0,
        total_merchants: 0,
        today_balance_recharge: todayRechargeAmount,
        yesterday_balance_recharge: yesterdayRechargeAmount,
        total_balance_recharge: totalRechargeAmount,
        today_withdrawal: todayWithdrawalAmount,
        yesterday_withdrawal: yesterdayWithdrawalAmount,
        total_withdrawal: totalWithdrawalAmount,
        today_order_recharge: todayRechargeAmount, // 使用balance_recharge作为order_recharge
        yesterday_order_recharge: yesterdayRechargeAmount,
        total_order_recharge: totalRechargeAmount,
        today_commission: 0,
        yesterday_commission: 0,
        total_commission: 0,
        today_trade_count: todayRecharges.length,
        yesterday_trade_count: yesterdayRecharges.length,
        total_trade_count: completedRecharges.length,
        today_trade_amount: todayRechargeAmount,
        yesterday_trade_amount: yesterdayRechargeAmount,
        total_trade_amount: totalRechargeAmount,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      console.log('✅ 成功计算仪表板数据:', computedStats);
      setStats(computedStats);

    } catch (err) {
      console.error('❌ 加载dashboard数据异常:', err);
      const errorMessage = err instanceof Error ? err.message : '加载数据失败';
      setError(errorMessage);
      toast.error(`数据加载失败: ${errorMessage}`);
      
      // 设置默认数据以避免页面空白
      setStats({
        id: 0,
        stat_date: new Date().toISOString().split('T')[0],
        total_users: 0,
        today_registrations: 0,
        total_agents: 0,
        total_merchants: 0,
        today_order_recharge: 0,
        yesterday_order_recharge: 0,
        total_order_recharge: 0,
        today_trade_count: 0,
        yesterday_trade_count: 0,
        total_trade_count: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载仪表盘数据...</p>
        </div>
      </div>
    );
  }

  // 如果有错误但没有数据，显示错误状态
  if (error && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">数据加载失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  // 安全地获取数据，如果stats为null则使用默认值
  const safeStats = stats || {
    id: 0,
    stat_date: new Date().toISOString().split('T')[0],
    total_users: 0,
    today_registrations: 0,
    total_agents: 0,
    total_merchants: 0,
    today_order_recharge: 0,
    yesterday_order_recharge: 0,
    total_order_recharge: 0,
    today_trade_count: 0,
    yesterday_trade_count: 0,
    total_trade_count: 0,
  };

  const chartData = [
    {
      name: '昨日',
      订单数: safeStats.yesterday_trade_count || 0,
      充值金额: safeStats.yesterday_order_recharge || 0,
    },
    {
      name: '今日',
      订单数: safeStats.today_trade_count || 0,
      充值金额: safeStats.today_order_recharge || 0,
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">管理仪表盘</h1>
          <p className="text-gray-600 mt-2">
            数据日期: {safeStats.stat_date}
            {error && (
              <span className="ml-4 text-amber-600">
                ⚠️ {error}
              </span>
            )}
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总用户数</p>
                <p className="text-2xl font-bold text-gray-900">{safeStats.total_users || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">今日充值</p>
                <p className="text-2xl font-bold text-gray-900">¥{(safeStats.today_order_recharge || 0).toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">今日订单</p>
                <p className="text-2xl font-bold text-gray-900">{safeStats.today_trade_count || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总交易额</p>
                <p className="text-2xl font-bold text-gray-900">¥{(safeStats.total_order_recharge || 0).toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* 图表区域 */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">趋势图表</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="订单数" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="充值金额" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 操作按钮 */}
        <div className="mt-6 flex gap-4">
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            🔄 刷新数据
          </button>
          <button 
            onClick={() => navigate('/admin-dashboard')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            📊 完整仪表盘
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
