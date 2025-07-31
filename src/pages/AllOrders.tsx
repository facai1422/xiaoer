import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, RefreshCw, ShoppingBag, Receipt, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InstantAuthCheck } from "@/components/auth/InstantAuthCheck";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Order {
  id: string;
  order_number: string;
  type: string;
  phone?: string;
  account?: string;
  amount: number;  // USDT金额
  actual_amount?: number;  // 实际充值金额（人民币）
  status: string;
  created_at: string;
  payment_method?: string;
  target_account?: string;
  phone_number?: string;
  metadata?: Record<string, any>;  // 存储汇率等额外信息
  transaction_hash?: string;  // 充值凭证
}

const AllOrders = () => {
  const navigate = useNavigate();
  const [rechargeOrders, setRechargeOrders] = useState<Order[]>([]);
  const [paymentOrders, setPaymentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("请先登录");
        setIsLoading(false); // 确保设置loading状态
        navigate("/login");
        return;
      }

      // 加载业务订单 - 修复user_id映射问题
      // 首先获取用户档案ID
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (profileError || !userProfile) {
        console.error("未找到用户档案:", profileError);
        setRechargeOrders([]);
        setPaymentOrders([]);
        setIsLoading(false); // 确保设置loading状态
        return;
      }

      const { data: businessData, error: businessError } = await supabase
        .from('recharge_orders')
        .select('*')
        .eq('user_id', userProfile.id) // 使用user_profiles.id
        .eq('order_type', 'business') // 只获取业务订单
        .order('created_at', { ascending: false });

      if (businessError) {
        console.error('加载业务订单失败:', businessError);
      } else if (businessData) {
        // 映射数据到Order接口
        const mappedOrders: Order[] = businessData.map(item => ({
          id: item.id,
          order_number: item.order_number,
          type: item.payment_method || 'business',
          phone: item.phone_number,
          amount: item.amount,
          status: item.status,
          created_at: item.created_at,
          payment_method: item.payment_method,
          target_account: item.target_account,
          phone_number: item.phone_number,
          actual_amount: item.actual_amount
        }));
        setRechargeOrders(mappedOrders);
      }
    } catch (error) {
      console.error('加载订单异常:', error);
      toast.error('加载订单失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getOrderTypeDisplay = (order: Order) => {
    // 首先检查是否是提现订单
    if (order.type === 'withdrawal' || order.payment_method === 'withdrawal') {
      return '钱包提现';
    }
    
    // 根据payment_method判断订单类型
    // 注意：钱包充值相关的订单（wallet, USDT, TRC20）已在加载时过滤
    if (order.payment_method === 'mobile') return '话费充值';
    if (order.payment_method === 'electricity') return '电费充值';
    if (order.payment_method === 'water') return '水费充值';
    if (order.payment_method === 'gas') return '燃气充值';
    if (order.payment_method === 'credit_card') return '信用卡代还';
    if (order.payment_method === 'huabei') return '花呗代还';
    
    return order.type || '其他业务';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string } } = {
      'pending': { text: '待处理', className: 'bg-yellow-100 text-yellow-600' },
      'processing': { text: '处理中', className: 'bg-blue-100 text-blue-600' },
      'completed': { text: '充值成功', className: 'bg-green-100 text-green-600' },
      'confirmed': { text: '充值成功', className: 'bg-green-100 text-green-600' },
      'grabbed': { text: '已抢单', className: 'bg-orange-100 text-orange-600' },
      'failed': { text: '失败', className: 'bg-red-100 text-red-600' },
      'cancelled': { text: '已取消', className: 'bg-gray-100 text-gray-600' },
      'proof_uploaded': { text: '处理中', className: 'bg-blue-100 text-blue-600' },
      'transferred': { text: '已转账', className: 'bg-indigo-100 text-indigo-600' }
    };

    const config = statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-600' };
    return (
      <span className={`text-xs px-2 py-1 rounded ${config.className}`}>
        {config.text}
      </span>
    );
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

  const handleViewDetails = (order: Order) => {
    // 跳转到订单详情页面
    navigate(`/orders/${order.id}`);
  };

  const renderOrderCard = (order: Order, isRecharge: boolean = true) => (
    <Card key={order.id} className="p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isRecharge ? (
              <Package className="w-4 h-4 text-blue-500" />
            ) : (
              <Receipt className="w-4 h-4 text-green-500" />
            )}
            <h3 className="font-medium">{getOrderTypeDisplay(order)}</h3>
          </div>
          <p className="text-sm text-gray-600">
            {order.phone_number || order.target_account || order.account || '—'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            订单号: {order.order_number}
          </p>
          <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
          
          {/* 显示汇率和USDT支付金额 */}
          {isRecharge && order.payment_method && order.payment_method !== 'USDT' && (
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500">
                汇率: 1 USDT = 7.2 RMB
              </p>
              <p className="text-xs text-gray-600">
                已支付: <span className="font-medium text-blue-600">{order.amount.toFixed(2)} USDT</span>
              </p>
            </div>
          )}
        </div>
        <div className="text-right">
          {/* 根据订单类型显示不同的金额 */}
          {isRecharge && order.payment_method && order.payment_method !== 'USDT' ? (
            <>
              <p className="font-medium text-lg mb-1">
                {order.payment_method === 'mobile' ? 
                  // 话费充值：USDT金额 × 7.2 ÷ 0.8 = 原始充值金额
                  (order.amount * 7.2 / 0.8).toFixed(0) : 
                  // 其他充值：直接显示USDT金额 × 汇率
                  (order.amount * 7.2).toFixed(0)
                } RMB
              </p>
              <p className="text-xs text-gray-500 mb-2">
                充值金额
              </p>
            </>
          ) : (
            <p className="font-medium text-lg mb-1">
              {order.amount.toFixed(2)} USDT
            </p>
          )}
          {getStatusBadge(order.status)}
        </div>
      </div>
      
      {/* 查看详情按钮 */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => handleViewDetails(order)}
        >
          查看详情
        </Button>
      </div>
    </Card>
  );

  const allOrders = [...rechargeOrders, ...paymentOrders].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'recharge':
        return rechargeOrders;
      case 'payment':
        return paymentOrders;
      default:
        return allOrders;
    }
  };

  const filteredOrders = getFilteredOrders();

  return (
    <InstantAuthCheck>
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
          <h1 className="text-lg font-semibold ml-4">我的订单</h1>
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

        {/* 标签页 */}
        <div className="bg-white px-4 pt-2 pb-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-1">
                <ShoppingBag className="w-4 h-4" />
                全部订单
              </TabsTrigger>
              <TabsTrigger value="recharge" className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                充值订单
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center gap-1">
                <Receipt className="w-4 h-4" />
                缴费订单
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 订单列表 */}
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const isRecharge = rechargeOrders.some(o => o.id === order.id);
              return renderOrderCard(order, isRecharge);
            })
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                {activeTab === 'recharge' ? '暂无充值订单' :
                 activeTab === 'payment' ? '暂无缴费订单' :
                 '暂无订单记录'}
              </p>
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </InstantAuthCheck>
  );
};

export default AllOrders; 