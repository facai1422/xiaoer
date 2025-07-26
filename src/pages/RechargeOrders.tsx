import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Eye, Upload, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RechargeOrder {
  id: string;
  order_number: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  payment_method: string;
  payment_proof?: string;
  phone_number?: string;
  order_type?: string;
  actual_amount: number;
}

const RechargeOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<RechargeOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      console.log('🔄 开始获取充值订单...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('⚠️ 用户未登录');
        toast.error("请先登录");
        setLoading(false); // 确保设置loading状态
        navigate("/login");
        return;
      }

      console.log('✅ 用户已登录，ID:', session.user.id);

      // 获取用户的钱包充值订单 - 修复user_id映射问题
      // 首先获取用户档案ID
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (profileError || !userProfile) {
        console.error("❌ 未找到用户档案:", profileError);
        // 即使没有找到用户档案，也要设置空数组并结束loading
        setOrders([]);
        toast.info("暂无充值记录");
        return;
      }

      console.log('✅ 找到用户档案ID:', userProfile.id);

      const { data, error } = await supabase
        .from('recharge_orders')
        .select('*')
        .eq('user_id', userProfile.id) // 使用user_profiles.id
        .or('order_type.eq.wallet,order_type.is.null') // 获取钱包充值订单（包括旧数据）
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ 获取订单失败:", error);
        toast.error("获取订单失败");
        setOrders([]);
      } else {
        console.log('✅ 获取订单成功，数量:', data?.length || 0);
        setOrders(data || []);
        if (!data || data.length === 0) {
          toast.info("暂无充值记录");
        }
      }
    } catch (error) {
      console.error("💥 获取订单异常:", error);
      toast.error("获取订单失败");
      setOrders([]);
    } finally {
      console.log('🏁 结束加载状态');
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">已确认</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">待处理</Badge>;
      case 'proof_uploaded':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">已上传凭证</Badge>;
      case 'transferred':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">已转账</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-300">已取消</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">已完成</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'proof_uploaded':
        return 'text-blue-600';
      case 'transferred':
        return 'text-purple-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">加载充值订单中...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">钱包订单</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>

        {/* 订单统计 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">总订单数</p>
                <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">已确认</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'confirmed' || o.status === 'completed').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">处理中</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'pending' || o.status === 'proof_uploaded' || o.status === 'transferred').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">总金额</p>
                <p className="text-2xl font-bold text-purple-600">
                  {orders.filter(o => o.status === 'confirmed' || o.status === 'completed').reduce((sum, o) => sum + o.actual_amount, 0).toFixed(2)} USDT
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 订单列表 */}
        <Card>
          <CardHeader>
            <CardTitle>订单列表</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">暂无充值订单</p>
                <p className="text-gray-500 text-sm mt-2">您还没有创建任何充值订单</p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate('/wallet-recharge')}
                >
                  立即充值
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-800">
                          订单号: {order.order_number}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopy(order.order_number)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">充值金额</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-lg">
                              {order.order_type === 'wallet' 
                                ? `${order.actual_amount.toFixed(2)} USDT` 
                                : `¥${order.amount.toFixed(2)}`
                              }
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {order.payment_method}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">支付方式</p>
                        <p className="text-sm font-medium">{order.payment_method || 'USDT'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">创建时间</p>
                        <p className="text-sm">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {order.phone_number && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">手机号码</p>
                        <p className="text-sm font-medium">{order.phone_number}</p>
                      </div>
                    )}

                    {order.payment_proof && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">交易凭证</p>
                        <p className="text-sm text-green-600">✓ 已上传</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        更新时间: {new Date(order.updated_at).toLocaleString()}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/recharge-orders/${order.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        查看详情
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RechargeOrders; 