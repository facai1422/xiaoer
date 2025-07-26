import { useState, useEffect } from "react";
import { toast } from "sonner";
import { adminSupabase } from "@/utils/adminSupabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, DollarSign, TrendingUp, TrendingDown, Users, BarChart3, PieChart, Calendar } from "lucide-react";

interface FinancialStats {
  totalUsers: number;
  totalBalance: number;
  totalRecharge: number;
  totalWithdrawal: number;
  todayRecharge: number;
  todayWithdrawal: number;
  monthlyRecharge: number;
  monthlyWithdrawal: number;
  pendingRecharge: number;
  pendingWithdrawal: number;
}

interface RechargeData {
  date: string;
  amount: number;
  count: number;
}

interface WithdrawalData {
  date: string;
  amount: number;
  count: number;
}

const FinancialReportPage = () => {
  const [stats, setStats] = useState<FinancialStats>({
    totalUsers: 0,
    totalBalance: 0,
    totalRecharge: 0,
    totalWithdrawal: 0,
    todayRecharge: 0,
    todayWithdrawal: 0,
    monthlyRecharge: 0,
    monthlyWithdrawal: 0,
    pendingRecharge: 0,
    pendingWithdrawal: 0
  });
  const [rechargeData, setRechargeData] = useState<RechargeData[]>([]);
  const [withdrawalData, setWithdrawalData] = useState<WithdrawalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("7days");

  useEffect(() => {
    fetchFinancialData();
  }, [selectedPeriod]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      // 获取日期范围
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      
             const startDate = new Date();
       switch (selectedPeriod) {
         case '7days':
           startDate.setDate(today.getDate() - 7);
           break;
         case '30days':
           startDate.setDate(today.getDate() - 30);
           break;
         case '3months':
           startDate.setMonth(today.getMonth() - 3);
           break;
         default:
           startDate.setDate(today.getDate() - 7);
       }
       const startDateStr = startDate.toISOString().split('T')[0];

      // 1. 获取用户统计
      const { data: usersData, error: usersError } = await adminSupabase
        .from('user_profiles')
        .select('balance');

      if (usersError) {
        console.error('获取用户数据失败:', usersError);
      }

      const totalUsers = usersData?.length || 0;
      const totalBalance = usersData?.reduce((sum, user) => sum + (user.balance || 0), 0) || 0;

      // 2. 获取充值统计
      const { data: rechargeOrders, error: rechargeError } = await adminSupabase
        .from('recharge_orders')
        .select('amount, actual_amount, status, created_at')
        .gte('created_at', startDateStr);

      if (rechargeError) {
        console.error('获取充值数据失败:', rechargeError);
      }

      // 计算充值统计
      const confirmedRecharges = rechargeOrders?.filter(order => order.status === 'confirmed') || [];
      const totalRecharge = confirmedRecharges.reduce((sum, order) => sum + (order.actual_amount || order.amount || 0), 0);
      
      const todayRecharges = confirmedRecharges.filter(order => 
        order.created_at.startsWith(todayStr)
      );
      const todayRecharge = todayRecharges.reduce((sum, order) => sum + (order.actual_amount || order.amount || 0), 0);

      const monthlyRecharges = confirmedRecharges.filter(order => 
        order.created_at >= monthStart
      );
      const monthlyRecharge = monthlyRecharges.reduce((sum, order) => sum + (order.actual_amount || order.amount || 0), 0);

      const pendingRecharges = rechargeOrders?.filter(order => 
        order.status === 'pending' || order.status === 'proof_uploaded'
      ) || [];
      const pendingRecharge = pendingRecharges.reduce((sum, order) => sum + (order.actual_amount || order.amount || 0), 0);

      // 3. 获取提现统计
      const { data: withdrawalRequests, error: withdrawalError } = await adminSupabase
        .from('withdrawal_requests')
        .select('amount, status, created_at')
        .gte('created_at', startDateStr);

      if (withdrawalError) {
        console.error('获取提现数据失败:', withdrawalError);
      }

      const approvedWithdrawals = withdrawalRequests?.filter(request => 
        request.status === 'approved' || request.status === 'completed'
      ) || [];
      const totalWithdrawal = approvedWithdrawals.reduce((sum, request) => sum + (request.amount || 0), 0);

      const todayWithdrawals = approvedWithdrawals.filter(request => 
        request.created_at.startsWith(todayStr)
      );
      const todayWithdrawal = todayWithdrawals.reduce((sum, request) => sum + (request.amount || 0), 0);

      const monthlyWithdrawals = approvedWithdrawals.filter(request => 
        request.created_at >= monthStart
      );
      const monthlyWithdrawal = monthlyWithdrawals.reduce((sum, request) => sum + (request.amount || 0), 0);

      const pendingWithdrawals = withdrawalRequests?.filter(request => 
        request.status === 'pending'
      ) || [];
      const pendingWithdrawal = pendingWithdrawals.reduce((sum, request) => sum + (request.amount || 0), 0);

      // 4. 生成图表数据
      const rechargeDailyData: RechargeData[] = [];
      const withdrawalDailyData: WithdrawalData[] = [];

      const daysCount = selectedPeriod === '7days' ? 7 : selectedPeriod === '30days' ? 30 : 90;
      
      for (let i = daysCount - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // 充值数据
        const dayRecharges = confirmedRecharges.filter(order => 
          order.created_at.startsWith(dateStr)
        );
        const dayRechargeAmount = dayRecharges.reduce((sum, order) => sum + (order.actual_amount || order.amount || 0), 0);
        rechargeDailyData.push({
          date: dateStr,
          amount: dayRechargeAmount,
          count: dayRecharges.length
        });

        // 提现数据
        const dayWithdrawals = approvedWithdrawals.filter(request => 
          request.created_at.startsWith(dateStr)
        );
        const dayWithdrawalAmount = dayWithdrawals.reduce((sum, request) => sum + (request.amount || 0), 0);
        withdrawalDailyData.push({
          date: dateStr,
          amount: dayWithdrawalAmount,
          count: dayWithdrawals.length
        });
      }

      // 更新状态
      setStats({
        totalUsers,
        totalBalance,
        totalRecharge,
        totalWithdrawal,
        todayRecharge,
        todayWithdrawal,
        monthlyRecharge,
        monthlyWithdrawal,
        pendingRecharge,
        pendingWithdrawal
      });

      setRechargeData(rechargeDailyData);
      setWithdrawalData(withdrawalDailyData);

    } catch (error) {
      console.error('获取财务数据异常:', error);
      toast.error('获取财务数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">加载财务报表中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">财务报表</h1>
          <p className="text-gray-600 mt-1">查看平台财务统计和报表</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="选择周期" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7天</SelectItem>
              <SelectItem value="30days">30天</SelectItem>
              <SelectItem value="3months">3个月</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFinancialData}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* 总览统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">总用户数</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">总余额</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalBalance.toFixed(2)} USDT</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-600">总充值</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.totalRecharge.toFixed(2)} USDT</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">总提现</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalWithdrawal.toFixed(2)} USDT</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 今日统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            今日统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">今日充值</p>
              <p className="text-xl font-bold text-green-600">{stats.todayRecharge.toFixed(2)} USDT</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">今日提现</p>
              <p className="text-xl font-bold text-red-600">{stats.todayWithdrawal.toFixed(2)} USDT</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">今日净流入</p>
              <p className="text-xl font-bold text-blue-600">
                {(stats.todayRecharge - stats.todayWithdrawal).toFixed(2)} USDT
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">资金流动率</p>
              <p className="text-xl font-bold text-purple-600">
                {stats.totalBalance > 0 ? 
                  ((stats.todayRecharge + stats.todayWithdrawal) / stats.totalBalance * 100).toFixed(2) : '0.00'
                }%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 月度统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            本月统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-gray-600">本月充值</p>
              <p className="text-xl font-bold text-emerald-600">{stats.monthlyRecharge.toFixed(2)} USDT</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">本月提现</p>
              <p className="text-xl font-bold text-orange-600">{stats.monthlyWithdrawal.toFixed(2)} USDT</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600">本月净流入</p>
              <p className="text-xl font-bold text-indigo-600">
                {(stats.monthlyRecharge - stats.monthlyWithdrawal).toFixed(2)} USDT
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 待处理统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            待处理事项
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">待处理充值</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pendingRecharge.toFixed(2)} USDT</p>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <p className="text-sm text-gray-600">待处理提现</p>
              <p className="text-xl font-bold text-pink-600">{stats.pendingWithdrawal.toFixed(2)} USDT</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 趋势图表数据 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 充值趋势 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">充值趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {rechargeData.map((data, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm text-gray-600">{data.date}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">{data.amount.toFixed(2)} USDT</div>
                    <div className="text-xs text-gray-500">{data.count} 笔</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 提现趋势 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">提现趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {withdrawalData.map((data, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="text-sm text-gray-600">{data.date}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-red-600">{data.amount.toFixed(2)} USDT</div>
                    <div className="text-xs text-gray-500">{data.count} 笔</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 重要指标 */}
      <Card>
        <CardHeader>
          <CardTitle>重要财务指标</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="text-sm font-medium text-gray-600 mb-2">资金利用率</h4>
              <p className="text-2xl font-bold">
                {stats.totalBalance > 0 ? 
                  ((stats.totalRecharge - stats.totalWithdrawal) / stats.totalBalance * 100).toFixed(2) : '0.00'
                }%
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="text-sm font-medium text-gray-600 mb-2">平均用户余额</h4>
              <p className="text-2xl font-bold">
                {stats.totalUsers > 0 ? (stats.totalBalance / stats.totalUsers).toFixed(2) : '0.00'} USDT
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="text-sm font-medium text-gray-600 mb-2">净资金流入</h4>
              <p className="text-2xl font-bold">
                {(stats.totalRecharge - stats.totalWithdrawal).toFixed(2)} USDT
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReportPage; 