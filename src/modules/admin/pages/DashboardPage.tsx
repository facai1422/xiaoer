import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/modules/admin/layout/AdminLayout";
import { getCompleteDashboardData } from "@/utils/dashboardQueries";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Coins,
  TrendingUp,
  ShoppingCart,
  Users,
  Building2,
  UserPlus,
  DollarSign
} from 'lucide-react';

interface DashboardStats {
  // 余额充值
  todayBalanceRecharge: number;
  yesterdayBalanceRecharge: number;
  totalBalanceRecharge: number;
  
  // 提现
  todayWithdrawal: number;
  yesterdayWithdrawal: number;
  totalWithdrawal: number;
  
  // 订单充值
  todayOrderRecharge: number;
  yesterdayOrderRecharge: number;
  totalOrderRecharge: number;
  
  // 返佣
  todayCommission: number;
  yesterdayCommission: number;
  totalCommission: number;
  
  // 交易订单数量
  todayTradeCount: number;
  yesterdayTradeCount: number;
  totalTradeCount: number;
  
  // 交易订单金额
  todayTradeAmount: number;
  yesterdayTradeAmount: number;
  totalTradeAmount: number;
  
  // 用户统计
  todayRegistrations: number;
  totalAgents: number;
  totalMerchants: number;
  totalUsers: number;
  
  // 图表数据
  dailyData: Array<{
    date: string;
    recharge: number;
    withdrawal: number;
    commission: number;
    trades: number;
  }>;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  bgColor, 
  iconColor, 
  textColor = "text-white",
  subtitle 
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  iconColor: string;
  textColor?: string;
  subtitle?: string;
}) => (
  <div className={`${bgColor} rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-2xl relative overflow-hidden group`}>
    {/* 背景装饰 */}
    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full transform translate-x-8 -translate-y-8"></div>
    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full transform -translate-x-6 translate-y-6"></div>
    
    {/* 内容 */}
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconColor} bg-white/20 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${textColor} group-hover:text-white transition-colors duration-300`}>
            {typeof value === 'number' ? value.toFixed(2) : value}
          </div>
          {subtitle && (
            <div className="text-white/80 text-xs mt-1">{subtitle}</div>
          )}
        </div>
      </div>
      <h3 className={`text-sm font-medium ${textColor} group-hover:text-white transition-colors duration-300`}>
        {title}
      </h3>
    </div>
    
    {/* 悬停动画效果 */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
  </div>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    todayBalanceRecharge: 0,
    yesterdayBalanceRecharge: 0,
    totalBalanceRecharge: 0,
    todayWithdrawal: 0,
    yesterdayWithdrawal: 0,
    totalWithdrawal: 0,
    todayOrderRecharge: 0,
    yesterdayOrderRecharge: 0,
    totalOrderRecharge: 0,
    todayCommission: 0,
    yesterdayCommission: 0,
    totalCommission: 0,
    todayTradeCount: 0,
    yesterdayTradeCount: 0,
    totalTradeCount: 0,
    todayTradeAmount: 0,
    yesterdayTradeAmount: 0,
    totalTradeAmount: 0,
    todayRegistrations: 0,
    totalAgents: 0,
    totalMerchants: 0,
    totalUsers: 0,
    dailyData: []
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getCompleteDashboardData();
        setStats({
          ...data.stats,
          dailyData: data.dailyData
        });
      } catch (error) {
        console.error('Error loading stats:', error);
        toast.error("加载数据失败");
      }
    };

    loadStats();
  }, [navigate]);

  return (
    <AdminLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">管理员仪表盘</h1>
          <p className="text-gray-600">实时监控平台运营数据</p>
        </div>
        
        {/* 余额充值统计 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <Wallet className="w-5 h-5 mr-2" />
            余额充值统计
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="今日余额充值"
              value={stats.todayBalanceRecharge}
              subtitle="USDT"
              icon={Wallet}
              bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
              iconColor="bg-blue-400"
            />
            <StatCard
              title="昨日余额充值"
              value={stats.yesterdayBalanceRecharge}
              subtitle="USDT"
              icon={Wallet}
              bgColor="bg-gradient-to-br from-indigo-500 to-indigo-600"
              iconColor="bg-indigo-400"
            />
            <StatCard
              title="历史总充值"
              value={stats.totalBalanceRecharge}
              subtitle="USDT"
              icon={Wallet}
              bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
              iconColor="bg-purple-400"
            />
          </div>
        </div>

        {/* 提现统计 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <ArrowUpFromLine className="w-5 h-5 mr-2" />
            提现统计
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="今日提现金额"
              value={stats.todayWithdrawal}
              subtitle="USDT"
              icon={ArrowUpFromLine}
              bgColor="bg-gradient-to-br from-green-500 to-green-600"
              iconColor="bg-green-400"
            />
            <StatCard
              title="昨日提现金额"
              value={stats.yesterdayWithdrawal}
              subtitle="USDT"
              icon={ArrowUpFromLine}
              bgColor="bg-gradient-to-br from-emerald-500 to-emerald-600"
              iconColor="bg-emerald-400"
            />
            <StatCard
              title="历史总提现"
              value={stats.totalWithdrawal}
              subtitle="USDT"
              icon={ArrowUpFromLine}
              bgColor="bg-gradient-to-br from-teal-500 to-teal-600"
              iconColor="bg-teal-400"
            />
          </div>
        </div>

        {/* 订单充值统计 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            订单充值统计
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="今日订单充值"
              value={stats.todayOrderRecharge}
              subtitle="笔"
              icon={ShoppingCart}
              bgColor="bg-gradient-to-br from-orange-500 to-orange-600"
              iconColor="bg-orange-400"
            />
            <StatCard
              title="昨日订单充值"
              value={stats.yesterdayOrderRecharge}
              subtitle="笔"
              icon={ShoppingCart}
              bgColor="bg-gradient-to-br from-amber-500 to-amber-600"
              iconColor="bg-amber-400"
            />
            <StatCard
              title="历史总订单充值"
              value={stats.totalOrderRecharge}
              subtitle="笔"
              icon={ShoppingCart}
              bgColor="bg-gradient-to-br from-yellow-500 to-yellow-600"
              iconColor="bg-yellow-400"
            />
          </div>
        </div>

        {/* 返佣统计 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <Coins className="w-5 h-5 mr-2" />
            返佣统计
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="今日返佣金额"
              value={stats.todayCommission}
              subtitle="USDT"
              icon={Coins}
              bgColor="bg-gradient-to-br from-red-500 to-red-600"
              iconColor="bg-red-400"
            />
            <StatCard
              title="昨日返佣金额"
              value={stats.yesterdayCommission}
              subtitle="USDT"
              icon={Coins}
              bgColor="bg-gradient-to-br from-rose-500 to-rose-600"
              iconColor="bg-rose-400"
            />
            <StatCard
              title="历史总返佣"
              value={stats.totalCommission}
              subtitle="USDT"
              icon={Coins}
              bgColor="bg-gradient-to-br from-pink-500 to-pink-600"
              iconColor="bg-pink-400"
            />
          </div>
        </div>

        {/* 交易订单数量统计 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            交易订单数量统计
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="今日交易订单数"
              value={stats.todayTradeCount}
              subtitle="笔"
              icon={TrendingUp}
              bgColor="bg-gradient-to-br from-cyan-500 to-cyan-600"
              iconColor="bg-cyan-400"
            />
            <StatCard
              title="昨日交易订单数"
              value={stats.yesterdayTradeCount}
              subtitle="笔"
              icon={TrendingUp}
              bgColor="bg-gradient-to-br from-sky-500 to-sky-600"
              iconColor="bg-sky-400"
            />
            <StatCard
              title="历史总交易订单"
              value={stats.totalTradeCount}
              subtitle="笔"
              icon={TrendingUp}
              bgColor="bg-gradient-to-br from-blue-600 to-blue-700"
              iconColor="bg-blue-500"
            />
          </div>
        </div>

        {/* 交易订单金额统计 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            交易订单金额统计
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="今日交易金额"
              value={stats.todayTradeAmount}
              subtitle="USDT"
              icon={DollarSign}
              bgColor="bg-gradient-to-br from-violet-500 to-violet-600"
              iconColor="bg-violet-400"
            />
            <StatCard
              title="昨日交易金额"
              value={stats.yesterdayTradeAmount}
              subtitle="USDT"
              icon={DollarSign}
              bgColor="bg-gradient-to-br from-fuchsia-500 to-fuchsia-600"
              iconColor="bg-fuchsia-400"
            />
            <StatCard
              title="历史总交易金额"
              value={stats.totalTradeAmount}
              subtitle="USDT"
              icon={DollarSign}
              bgColor="bg-gradient-to-br from-purple-600 to-purple-700"
              iconColor="bg-purple-500"
            />
          </div>
        </div>

        {/* 用户统计 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            用户统计
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="今日注册人数"
              value={stats.todayRegistrations}
              subtitle="人"
              icon={UserPlus}
              bgColor="bg-gradient-to-br from-lime-500 to-lime-600"
              iconColor="bg-lime-400"
            />
            <StatCard
              title="平台代理人数"
              value={stats.totalAgents}
              subtitle="人"
              icon={Users}
              bgColor="bg-gradient-to-br from-green-600 to-green-700"
              iconColor="bg-green-500"
            />
            <StatCard
              title="平台商户人数"
              value={stats.totalMerchants}
              subtitle="人"
              icon={Building2}
              bgColor="bg-gradient-to-br from-teal-600 to-teal-700"
              iconColor="bg-teal-500"
            />
            <StatCard
              title="平台总人数"
              value={stats.totalUsers}
              subtitle="人"
              icon={Users}
              bgColor="bg-gradient-to-br from-gray-600 to-gray-700"
              iconColor="bg-gray-500"
            />
          </div>
        </div>

        {/* 趋势图表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 shadow-lg rounded-2xl bg-white/80 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">充值提现趋势</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyData}>
                  <defs>
                    <linearGradient id="rechargeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="withdrawalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="recharge" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#rechargeGradient)" 
                    name="充值金额"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="withdrawal" 
                    stroke="#10B981" 
                    fillOpacity={1} 
                    fill="url(#withdrawalGradient)" 
                    name="提现金额"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 shadow-lg rounded-2xl bg-white/80 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">返佣与交易趋势</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Line type="monotone" dataKey="commission" stroke="#F59E0B" strokeWidth={3} name="返佣金额" />
                  <Line type="monotone" dataKey="trades" stroke="#EF4444" strokeWidth={3} name="交易订单数" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
