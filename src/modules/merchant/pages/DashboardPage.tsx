
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import MerchantLayout from "../layout/MerchantLayout";
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
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  dailyData: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    dailyData: []
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/merchant/login");
          return;
        }

        // Load merchant statistics - 使用正确的表名
        const { data: orders, error: ordersError } = await supabase
          .from('recharge_orders')
          .select('*')
          .eq('user_id', session.user.id);

        if (ordersError) throw ordersError;

        // Process statistics
        const totalOrders = orders?.length || 0;
        const totalRevenue = orders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
        const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;

        // Process daily data
        const dailyData = processDailyData(orders || []);

        setStats({
          totalOrders,
          totalRevenue,
          pendingOrders,
          dailyData
        });

      } catch (error) {
        console.error('Error loading stats:', error);
        toast.error("加载数据失败");
      }
    };

    loadStats();
  }, [navigate]);

  return (
    <MerchantLayout title="商户中心" showBack={false}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-sm text-gray-500">总订单数</h3>
          <p className="text-2xl font-bold">{stats.totalOrders}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm text-gray-500">总营收</h3>
          <p className="text-2xl font-bold">¥{stats.totalRevenue.toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm text-gray-500">待处理订单</h3>
          <p className="text-2xl font-bold">{stats.pendingOrders}</p>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">收入趋势</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="收入" />
              <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="订单数" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </MerchantLayout>
  );
};

// Helper function to process daily data
const processDailyData = (orders: any[]) => {
  const dailyMap = new Map();
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  // Initialize daily data for the past 7 days
  for (let d = new Date(sevenDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    dailyMap.set(dateStr, { date: dateStr, orders: 0, revenue: 0 });
  }

  // Aggregate order data
  orders.forEach(order => {
    const dateStr = new Date(order.created_at).toISOString().split('T')[0];
    if (dailyMap.has(dateStr)) {
      const dayData = dailyMap.get(dateStr);
      dayData.orders += 1;
      dayData.revenue += order.amount || 0;
    }
  });

  return Array.from(dailyMap.values());
};

export default DashboardPage;
