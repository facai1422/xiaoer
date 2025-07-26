import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Copy, ChevronUp, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RechargeOrder {
  id: string;
  order_number: string;
  amount: number;
  status: string;
  created_at: string;
  payment_method: string;
}

export const TransactionList = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [orders, setOrders] = useState<RechargeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchRechargeOrders();
  }, []);

  const fetchRechargeOrders = async () => {
    try {
      setLoading(true);
      console.log('🔄 钱包页面 - 开始获取充值订单...');

      // 获取当前用户
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.log('❌ 用户未登录或认证失败:', userError);
        setOrders([]);
        return;
      }

      console.log('✅ 用户已登录，auth.users.id:', user.id);

      // 获取用户档案ID（这是recharge_orders表实际存储的user_id）
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !userProfile) {
        console.log('⚠️ 未找到用户档案:', profileError);
        setOrders([]);
        return;
      }

      console.log('✅ 找到用户档案ID:', userProfile.id);

      // 使用正确的user_id查询充值订单
      const { data: ordersData, error: ordersError } = await supabase
        .from('recharge_orders')
        .select('id, order_number, amount, status, created_at, payment_method')
        .eq('user_id', userProfile.id) // 使用user_profiles.id
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersError) {
        console.error('❌ 获取充值订单失败:', ordersError);
        toast.error('获取充值订单失败');
        setOrders([]);
        return;
      }

      console.log('✅ 钱包页面充值订单查询成功，数量:', ordersData?.length || 0);
      setOrders(ordersData || []);

    } catch (error) {
      console.error('获取充值订单异常:', error);
      toast.error('获取充值订单失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">已完成</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">处理中</Badge>;
      case 'proof_uploaded':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs">已上传凭证</Badge>;
      case 'transferred':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-xs">已转账</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">已取消</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
  };

  const handleRefresh = () => {
    fetchRechargeOrders();
  };

  return (
    <Card className={`p-3 md:p-4 ${isMobile ? 'max-w-full mx-2' : 'max-w-xl mx-auto'}`}>
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>余额充值记录</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {loading ? (
        <div className="space-y-3 md:space-y-4 py-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 md:h-16 bg-gray-100 animate-pulse rounded"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          <p className={`${isMobile ? 'text-sm' : 'text-base'}`}>暂无充值记录</p>
          <p className="text-xs text-gray-400 mt-1">您还没有创建任何充值订单</p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {orders.slice(0, showAll ? undefined : 3).map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-800`}>
                    {order.order_number}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => handleCopy(order.order_number)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                {getStatusBadge(order.status)}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-green-600`}>
                    +{order.amount.toFixed(2)} USDT
                  </div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
                    {order.payment_method || 'USDT'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {orders.length > 3 && (
        <Button 
          variant="ghost" 
          className="w-full mt-4"
          size={isMobile ? "sm" : "default"}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              收起记录
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              展开更多记录 ({orders.length - 3} 条)
            </>
          )}
        </Button>
      )}
    </Card>
  );
};
