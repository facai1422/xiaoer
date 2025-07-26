import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RefreshCw, Eye, Check, X, Search, Image } from "lucide-react";

interface RechargeOrder {
  id: string;
  order_number: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  payment_method: string;
  transaction_hash?: string;
  phone_number?: string;
  user_id: string;
  target_account?: string;
  recharge_amount?: number;
  user_name?: string;
  name?: string;
  // 关联数据
  user_email?: string;
  user_username?: string;
  user_phone?: string;
  order_type_display?: string;
}

const RechargeOrderManagement = () => {
  const [orders, setOrders] = useState<RechargeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<RechargeOrder | null>(null);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // 获取钱包充值订单数据（只显示 order_type = 'wallet' 的订单）
      const { data: ordersData, error } = await supabase
        .from('recharge_orders')
        .select('*')
        .eq('order_type', 'wallet')  // 只显示钱包充值订单
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取充值订单失败:', error);
        toast.error('获取充值订单失败');
        return;
      }

      console.log('订单数据:', ordersData);

      // 获取用户信息 - 只从user_profiles表获取
      const userIds = [...new Set(ordersData?.map(order => order.user_id) || [])];
      const userProfiles: Record<string, {email?: string, username?: string, phone?: string}> = {};
      
      if (userIds.length > 0) {
        // 只从user_profiles表获取用户信息
        const { data: profiles, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_id, email, username, phone')
          .in('user_id', userIds);
        
        if (!profileError && profiles) {
          profiles?.forEach(profile => {
            userProfiles[profile.user_id] = {
              email: profile.email || undefined,
              username: profile.username || undefined,
              phone: profile.phone || undefined
            };
          });
        }
        
        console.log('用户信息:', userProfiles);
      }

      // 组合数据
      const enrichedOrders = ordersData?.map(order => {
        const userProfile = userProfiles[order.user_id] || {};
        
        // 根据payment_method和其他字段推断订单类型
        let orderTypeDisplay = '普通充值';
        if (order.phone_number) {
          orderTypeDisplay = '话费充值';
        } else if (order.payment_method) {
          const paymentMethodToProduct: Record<string, string> = {
            'TRC20': 'USDT充值',
            'USDT': 'USDT充值',
            'mobile': '话费充值',
            'electricity': '电费充值',
            'credit_card': '信用卡代还',
            'huabei': '花呗代还',
            'gas': '燃气缴费',
            'water': '水费缴费',
            'douyin': '抖币充值',
            'kuaishou': '快币充值',
            'netease': '网易游戏',
            'oil_card': '石化加油卡',
            'fangxin': '放心借',
          };
          orderTypeDisplay = paymentMethodToProduct[order.payment_method] || order.payment_method;
        }
        
        return {
          ...order,
          user_email: userProfile.email,
          user_username: userProfile.username,
          user_phone: userProfile.phone,
          order_type_display: orderTypeDisplay
        };
      }) || [];

      console.log('组合后的订单数据:', enrichedOrders);
      setOrders(enrichedOrders);

    } catch (error) {
      console.error('获取充值订单异常:', error);
      toast.error('获取充值订单失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    try {
      // 直接更新订单状态，数据库触发器会自动处理余额更新
      const { error } = await supabase
        .from('recharge_orders')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('审核订单失败:', error);
        toast.error('审核订单失败: ' + error.message);
        return;
      }

      toast.success('订单已确认，用户余额已自动更新');
      fetchOrders();
      setShowOrderDialog(false);
    } catch (error) {
      console.error('审核订单异常:', error);
      toast.error('审核订单失败');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('recharge_orders')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('拒绝订单失败:', error);
        toast.error('拒绝订单失败');
        return;
      }

      toast.success('订单已拒绝');
      fetchOrders();
      setShowOrderDialog(false);
    } catch (error) {
      console.error('拒绝订单异常:', error);
      toast.error('拒绝订单失败');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">已确认</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">待处理</Badge>;
      case 'proof_uploaded':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">处理中</Badge>;
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

  const filteredOrders = orders.filter(order => {
    const userEmail = order.user_email || '';
    const userName = order.user_username || '';
    const orderType = order.order_type_display || '';
    
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orderType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewProof = (order: RechargeOrder) => {
    setSelectedOrder(order);
    setShowProofDialog(true);
  };

  const handleViewOrder = (order: RechargeOrder) => {
    setSelectedOrder(order);
    setShowOrderDialog(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">加载充值订单中...</p>
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
        <h1 className="text-2xl font-bold text-gray-800">充值订单管理</h1>
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

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索订单号、用户邮箱、产品名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="transferred">已转账</SelectItem>
                <SelectItem value="proof_uploaded">已上传凭证</SelectItem>
                <SelectItem value="confirmed">已确认</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 订单统计 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <p className="text-sm text-gray-600">待审核</p>
              <p className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.status === 'proof_uploaded').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">已确认</p>
              <p className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'confirmed').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">已取消</p>
              <p className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.status === 'cancelled').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">总金额</p>
              <p className="text-2xl font-bold text-purple-600">
                {orders.filter(o => o.status === 'confirmed').reduce((sum, o) => sum + o.amount, 0).toFixed(2)} USDT
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 订单列表 */}
      <Card>
        <CardHeader>
          <CardTitle>订单列表 ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">暂无符合条件的订单</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-800">
                        {order.order_number}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex gap-2">
                      {order.transaction_hash && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProof(order)}
                        >
                          <Image className="w-4 h-4 mr-2" />
                          查看凭证
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        查看详情
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">用户账号</p>
                      <p className="text-sm font-medium">
                        {order.user_email || order.user_username || '未知用户'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">订单类型</p>
                      <p className="text-sm font-medium">
                        {order.order_type_display || '普通充值'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">充值金额</p>
                      <p className="text-lg font-bold text-green-600">
                        {order.amount.toFixed(2)} USDT
                      </p>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 交易凭证查看对话框 */}
      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>交易凭证</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedOrder?.transaction_hash ? (
              <div className="text-center">
                {(() => {
                  try {
                    const fileInfo = JSON.parse(selectedOrder.transaction_hash);
                    
                    // 检查是否有URL字段（新的存储桶方案）
                    if (fileInfo.url) {
                      return (
                        <>
                          <img
                            src={fileInfo.url}
                            alt="交易凭证"
                            className="max-w-full h-auto rounded-lg border shadow-sm"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.png';
                            }}
                          />
                          <p className="text-sm text-gray-600 mt-3">
                            订单号: {selectedOrder.order_number}
                          </p>
                        </>
                      );
                    }
                    
                    // 兼容旧的base64方案
                    if (fileInfo.data) {
                      return (
                        <>
                          <img
                            src={fileInfo.data}
                            alt="交易凭证"
                            className="max-w-full h-auto rounded-lg border shadow-sm"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.png';
                            }}
                          />
                          <p className="text-sm text-gray-600 mt-3">
                            订单号: {selectedOrder.order_number}
                          </p>
                        </>
                      );
                    }
                    
                    return (
                      <div className="text-center py-8">
                        <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">交易凭证数据格式不支持</p>
                      </div>
                    );
                  } catch {
                    return (
                      <div className="text-center py-8">
                        <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">交易凭证格式错误</p>
                      </div>
                    );
                  }
                })()}
              </div>
            ) : (
              <div className="text-center py-8">
                <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">暂无交易凭证</p>
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowProofDialog(false)}>
              关闭
            </Button>
            {selectedOrder?.transaction_hash && (
              <Button
                onClick={() => {
                  try {
                    const fileInfo = JSON.parse(selectedOrder.transaction_hash);
                    window.open(fileInfo.data || fileInfo.url, '_blank');
                  } catch {
                    toast.error('无法打开交易凭证');
                  }
                }}
                className="bg-blue-500 hover:bg-blue-600"
              >
                查看原图
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 订单详情对话框 */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* 基本信息 */}
              <div className="space-y-2 border-b pb-4">
                <h3 className="font-semibold text-gray-800">基本信息</h3>
                <div className="flex justify-between">
                  <span className="text-gray-600">订单号</span>
                  <span className="font-medium">{selectedOrder.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">状态</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">创建时间</span>
                  <span className="text-sm">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">更新时间</span>
                  <span className="text-sm">{new Date(selectedOrder.updated_at).toLocaleString()}</span>
                </div>
              </div>

              {/* 用户信息 */}
              <div className="space-y-2 border-b pb-4">
                <h3 className="font-semibold text-gray-800">用户信息</h3>
                <div className="flex justify-between">
                  <span className="text-gray-600">用户邮箱</span>
                  <span className="font-medium">
                    {selectedOrder.user_email || '未设置'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">用户名</span>
                  <span className="font-medium">
                    {selectedOrder.user_username || '未设置'}
                  </span>
                </div>
                {selectedOrder.user_phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">联系电话</span>
                    <span className="font-medium">{selectedOrder.user_phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">用户ID</span>
                  <span className="text-xs font-mono">{selectedOrder.user_id}</span>
                </div>
              </div>

              {/* 产品信息 */}
              <div className="space-y-2 border-b pb-4">
                <h3 className="font-semibold text-gray-800">产品信息</h3>
                <div className="flex justify-between">
                  <span className="text-gray-600">订单类型</span>
                  <span className="font-medium">
                    {selectedOrder.order_type_display || '普通充值'}
                  </span>
                </div>
                {selectedOrder.target_account && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">充值账号</span>
                    <span className="font-medium">{selectedOrder.target_account}</span>
                  </div>
                )}
                {selectedOrder.phone_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">充值手机号</span>
                    <span className="font-medium">{selectedOrder.phone_number}</span>
                  </div>
                )}
              </div>

              {/* 支付信息 */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800">支付信息</h3>
                <div className="flex justify-between">
                  <span className="text-gray-600">充值金额</span>
                  <span className="font-medium text-green-600">{selectedOrder.amount.toFixed(2)} USDT</span>
                </div>
                {selectedOrder.recharge_amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">实际到账</span>
                    <span className="font-medium text-green-600">{selectedOrder.recharge_amount.toFixed(2)} USDT</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">支付方式</span>
                  <span className="font-medium">{selectedOrder.payment_method || 'USDT'}</span>
                </div>
                {selectedOrder.user_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">备注</span>
                    <span className="font-medium text-sm">{selectedOrder.user_name}</span>
                  </div>
                )}
              </div>

              {selectedOrder.status === 'proof_uploaded' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => handleRejectOrder(selectedOrder.id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    拒绝
                  </Button>
                  <Button
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    onClick={() => handleApproveOrder(selectedOrder.id)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    确认
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RechargeOrderManagement; 