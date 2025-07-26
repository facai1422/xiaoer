import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Order {
  id: string;
  order_number: string;
  business_type_id: string | null;
  name: string | null;
  phone_number: string;
  target_account: string;
  amount: number;
  actual_amount: number;
  status: string;
  created_at: string;
  payment_method: string;
  payment_channel: string;
}

const Orders = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 简单的用户检查和订单加载
    const checkAndLoadOrders = async () => {
      if (!loading && !user) {
        navigate("/login");
        return;
      }
      
      if (user) {
        loadOrders();
      }
    };

    checkAndLoadOrders();
  }, [user, loading, navigate]);

  const loadOrders = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const result = await supabase
          .from('recharge_orders')
          .select('*')
          .eq('order_type', 'business')
          .order('created_at', { ascending: false });

        if (result.error) {
          console.error('查询订单失败:', result.error);
          setOrders([]);
        } else {
          setOrders((result.data || []) as Order[]);
        }
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('加载订单异常:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
      case '成功':
        return 'bg-green-100 text-green-600';
      case 'pending':
      case '处理中':
        return 'bg-yellow-100 text-yellow-600';
      case 'failed':
      case 'cancelled':
      case '失败':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return '成功';
      case 'pending':
        return '处理中';
      case 'failed':
      case 'cancelled':
        return '失败';
      default:
        return status;
    }
  };

  const getBusinessTypeName = (order: Order) => {
    if (order.name) return order.name;
    if (order.payment_method) {
      return order.payment_method.replace(/充值$/, '');
    }
    return '业务订单';
  };

  if (loading || (!loading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{loading ? '验证登录状态...' : '跳转到登录页...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 头部 */}
      <div className="bg-white p-4 flex items-center shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </Button>
        <h1 className="text-lg font-semibold ml-4">业务订单</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadOrders}
          className="ml-auto"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* 订单列表 */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <Card 
              key={order.id} 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/order/${order.id}`)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{getBusinessTypeName(order)}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">订单号: {order.order_number}</p>
                  <p className="text-sm text-gray-600">账号: {order.target_account || order.phone_number}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-lg">¥{order.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">
                    实付: {order.actual_amount.toFixed(2)} USDT
                  </p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无业务订单记录</p>
            <Button 
              className="mt-4"
              onClick={() => navigate('/dashboard')}
            >
              去下单
            </Button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Orders;
