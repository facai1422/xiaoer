import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Smartphone, Signal, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getOrderDetail } from "@/services/businessOrderService";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { queryPhoneBalance, formatBalance, getOperatorColor } from "@/services/phoneBalanceService";

interface OrderInfo {
  id: string;
  order_number: string;
  name: string | null;
  phone_number: string;
  target_account: string;
  amount: number;
  actual_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  payment_method: string;
  payment_channel: string;
  user_name: string;
  metadata: Json;
}

// 定义metadata的类型接口
interface OrderMetadata {
  name?: string;
  cardNumber?: string;
  bankName?: string;
  qrCode?: string;
  account?: string;
  gameType?: string;
  phone?: string;
  company?: string;
  customerName?: string;
  exchange_rate?: number;
  discount?: string;
  [key: string]: string | number | boolean | undefined;
}

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phoneBalanceInfo, setPhoneBalanceInfo] = useState<{
    balance: string;
    operator: string;
    province: string;
    city: string;
  } | null>(null);
  const [isQueryingPhoneBalance, setIsQueryingPhoneBalance] = useState(false);
  const [phoneBalanceError, setPhoneBalanceError] = useState<string>("");

  useEffect(() => {
    if (orderId) {
      loadOrderDetail();
    }
  }, [orderId]);

  // 查询手机号余额
  const handleQueryPhoneBalance = async (phoneNumber: string) => {
    if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
      toast.error("请输入有效的手机号码");
      return;
    }

    setIsQueryingPhoneBalance(true);
    setPhoneBalanceInfo(null);
    setPhoneBalanceError("");

    try {
      const result = await queryPhoneBalance(phoneNumber);
      
      if (result.code === 0 && result.data) {
        setPhoneBalanceInfo({
          balance: result.data.balance,
          operator: result.data.operator,
          province: result.data.province,
          city: result.data.city
        });
        toast.success("余额查询成功");
      } else {
        setPhoneBalanceError(result.message || "查询失败");
        toast.error(result.message || "查询失败");
      }
    } catch (error) {
      setPhoneBalanceError("查询失败，请稍后重试");
      toast.error("查询失败，请稍后重试");
    } finally {
      setIsQueryingPhoneBalance(false);
    }
  };

  const loadOrderDetail = async () => {
    try {
      setIsLoading(true);
      
      // 检查登录状态
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("请先登录");
        navigate("/login");
        return;
      }

      const orderData = await getOrderDetail(orderId!);
      
      // RLS策略已经确保用户只能查看自己的订单，无需额外权限检查
      setOrder(orderData);
    } catch (error) {
      console.error("加载订单详情失败:", error);
      
      // 如果是权限问题或订单不存在，给出友好提示
      if (error?.message?.includes('PGRST116') || error?.message?.includes('permission') || error?.message?.includes('access')) {
        toast.error("无权查看此订单");
      } else {
        toast.error("加载订单详情失败");
      }
      navigate("/orders");
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
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
      case '成功':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'pending':
      case 'proof_uploaded':
      case 'transferred':
      case '处理中':
        return <Clock className="w-16 h-16 text-yellow-500" />;
      case 'failed':
      case 'cancelled':
      case '失败':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Package className="w-16 h-16 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '充值成功';
      case 'confirmed':
        return '充值成功';
      case 'pending':
        return '待处理';
      case 'processing':
        return '处理中';
      case 'proof_uploaded':
        return '处理中';
      case 'transferred':
        return '已转账';
      case 'grabbed':
        return '已抢单';
      case 'failed':
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
      case '成功':
        return 'text-green-600';
      case 'pending':
      case 'proof_uploaded':
      case 'transferred':
      case 'grabbed':
      case '处理中':
        return 'text-yellow-600';
      case 'failed':
      case 'cancelled':
      case '失败':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // 根据业务类型获取账号字段名称
  const getAccountFieldLabel = (businessType: string) => {
    switch (businessType) {
      case '电费充值':
      case 'electricity':
        return '充值户号';
      case '话费充值':
      case 'mobile':
        return '充值手机号';
      case '燃气充值':
      case 'gas':
        return '燃气户号';
      case '水费充值':
      case 'water':
        return '水费户号';
      default:
        return '充值账号';
    }
  };

  // 根据业务类型获取名称字段标签
  const getNameFieldLabel = (businessType: string) => {
    switch (businessType) {
      case '电费充值':
      case 'electricity':
        return '地区';
      case '燃气充值':
      case 'gas':
        return '燃气公司';
      case '信用卡还款':
        return '开户银行';
      case '花呗还款':
        return '支付宝账户';
      default:
        return '账号名称';
    }
  };

  // 从metadata获取显示值
  const getDisplayValue = (order: OrderInfo, field: string) => {
    const metadata = order.metadata as OrderMetadata;
    
    // 对于地区字段，优先显示regionName而不是region代码
    if (field === 'region' && metadata?.regionName) {
      return metadata.regionName;
    }
    
    // 其他情况返回原值
    return order.user_name;
  };

  const getPaymentChannelName = (channel: string) => {
    switch (channel) {
      case 'balance':
        return '余额支付';
      case 'default':
        return 'USDT支付';
      case 'usdt':
        return 'USDT支付';
      case 'alipay':
        return '支付宝';
      case 'wechat':
        return '微信支付';
      case 'bank':
        return '银行卡';
      default:
        return channel || 'USDT支付';
    }
  };

  // 计算汇率
  const calculateExchangeRate = (order: OrderInfo) => {
    if (order.amount > 0 && order.actual_amount > 0) {
      return (order.amount / order.actual_amount).toFixed(2);
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">订单不存在</p>
          <Button 
            className="mt-4"
            onClick={() => navigate('/orders')}
          >
            返回订单列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
        <h1 className="text-lg font-semibold ml-4">订单详情</h1>
      </div>

      {/* 订单状态 */}
      <div className="p-4">
        <Card className="p-6">
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center">
              {getStatusIcon(order.status)}
              <h2 className={`text-2xl font-semibold mt-4 ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </h2>
            </div>
            <p className="text-gray-500 mt-2">订单号: {order.order_number}</p>
          </div>
        </Card>
      </div>

      {/* 订单信息 */}
      <div className="px-4 pb-4">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">订单信息</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">业务类型</span>
              <span className="font-medium">{order.name || order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{getAccountFieldLabel(order.name || order.payment_method)}</span>
              <span className="font-medium">{order.target_account}</span>
            </div>
            {(order.user_name || (order.metadata as OrderMetadata)?.regionName) && (
              <div className="flex justify-between">
                <span className="text-gray-600">{getNameFieldLabel(order.name || order.payment_method)}</span>
                <span className="font-medium">{getDisplayValue(order, 'region')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">充值金额</span>
              <span className="font-medium">¥{order.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">实付金额</span>
              <span className="font-medium text-lg text-blue-600">{order.actual_amount.toFixed(2)} USDT</span>
            </div>
            {/* 显示汇率信息 - 优先使用metadata中的汇率，否则计算汇率 */}
            {(() => {
              const metadata = order.metadata as OrderMetadata;
              const exchangeRate = metadata?.exchange_rate || calculateExchangeRate(order);
              if (exchangeRate) {
                return (
                  <div className="flex justify-between">
                    <span className="text-gray-600">汇率</span>
                    <span className="font-medium text-green-600">1 USDT = ¥{exchangeRate}</span>
                  </div>
                );
              }
              return null;
            })()}
            {order.metadata && typeof order.metadata === 'object' && (order.metadata as OrderMetadata)?.discount && (
              <div className="flex justify-between">
                <span className="text-gray-600">优惠信息</span>
                <span className="font-medium text-green-600">{(order.metadata as OrderMetadata).discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">支付方式</span>
              <span className="font-medium">{getPaymentChannelName(order.payment_channel)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 业务表单信息 */}
      {order.metadata && typeof order.metadata === 'object' && (
        <div className="px-4 pb-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">表单信息</h3>
            <div className="space-y-3">
              {(() => {
                const metadata = order.metadata as OrderMetadata;
                return (
                  <>
                    {/* 信用卡代还表单信息 */}
                    {(order.payment_method === '信用卡还款' || order.payment_method?.includes('信用卡')) && (
                      <>
                        {metadata?.name && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">持卡人姓名</span>
                            <span className="font-medium">{metadata.name}</span>
                          </div>
                        )}
                        {metadata?.cardNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">信用卡号</span>
                            <span className="font-medium">{metadata.cardNumber}</span>
                          </div>
                        )}
                        {metadata?.bankName && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">开户银行</span>
                            <span className="font-medium">{metadata.bankName}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* 花呗代还表单信息 */}
                    {(order.payment_method === '花呗还款' || order.payment_method?.includes('花呗')) && (
                      <>
                        {metadata?.name && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">支付宝姓名</span>
                            <span className="font-medium">{metadata.name}</span>
                          </div>
                        )}
                        {metadata?.qrCode && (
                          <div className="space-y-2">
                            <span className="text-gray-600 block">花呗二维码</span>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              {/* 检查是否为图片URL */}
                              {(metadata.qrCode.startsWith('http') || metadata.qrCode.startsWith('data:image') || metadata.qrCode.startsWith('blob:')) ? (
                                <div className="text-center">
                                  <img 
                                    src={metadata.qrCode} 
                                    alt="花呗二维码" 
                                    className="max-w-full h-auto max-h-64 mx-auto rounded-lg border shadow-sm"
                                    onError={(e) => {
                                      // 如果图片加载失败，隐藏图片显示错误信息
                                      const imgElement = e.currentTarget as HTMLImageElement;
                                      const parent = imgElement.parentElement;
                                      if (parent) {
                                        parent.innerHTML = `
                                          <div class="text-center py-4">
                                            <div class="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                              </svg>
                                            </div>
                                            <p class="text-sm text-gray-500">二维码图片</p>
                                          </div>
                                        `;
                                      }
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="text-center py-4">
                                  <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                  <p className="text-sm text-gray-500">二维码图片</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* 抖音/快手币充值表单信息 */}
                    {(order.payment_method?.includes('抖') || order.payment_method?.includes('快')) && (
                      <>
                        {metadata?.account && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">账号</span>
                            <span className="font-medium">{metadata.account}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* 网易游戏表单信息 */}
                    {order.payment_method?.includes('网易') && (
                      <>
                        {metadata?.gameType && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">游戏类型</span>
                            <span className="font-medium">{metadata.gameType}</span>
                          </div>
                        )}
                        {metadata?.account && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">游戏账号</span>
                            <span className="font-medium">{metadata.account}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* 话费充值表单信息 */}
                    {(order.payment_method === '话费充值' || order.payment_method?.includes('话费')) && (
                      <>
                        {metadata?.phone && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">充值手机号</span>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{metadata.phone}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleQueryPhoneBalance(metadata.phone)}
                                  disabled={isQueryingPhoneBalance}
                                  className="h-6 px-2 text-xs"
                                >
                                  {isQueryingPhoneBalance ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <RefreshCw className="w-3 h-3" />
                                  )}
                                  <span className="ml-1">{isQueryingPhoneBalance ? '查询中' : '查询余额'}</span>
                                </Button>
                              </div>
                            </div>
                            
                            {/* 余额信息显示 */}
                            {phoneBalanceInfo && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                                <div className="flex items-center mb-2">
                                  <Smartphone className="w-4 h-4 text-blue-500 mr-2" />
                                  <span className="text-sm font-medium text-blue-700">号码信息</span>
                                </div>
                                
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">当前余额:</span>
                                    <span className="font-bold text-green-600">
                                      {formatBalance(phoneBalanceInfo.balance)}
                                    </span>
                                  </div>
                                  
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">运营商:</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getOperatorColor(phoneBalanceInfo.operator)}`}>
                                      {phoneBalanceInfo.operator}
                                    </span>
                                  </div>
                                  
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">归属地:</span>
                                    <span className="text-gray-800">
                                      {phoneBalanceInfo.province} {phoneBalanceInfo.city}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center text-xs text-gray-500 mt-2">
                                    <Signal className="w-3 h-3 mr-1" />
                                    <span>余额信息仅供参考</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* 余额查询错误显示 */}
                            {phoneBalanceError && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                                <div className="text-sm text-red-600 text-center">
                                  <span>{phoneBalanceError}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* 燃气缴费表单信息 */}
                    {order.payment_method?.includes('燃气') && (
                      <>
                        {metadata?.account && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">燃气户号</span>
                            <span className="font-medium">{metadata.account}</span>
                          </div>
                        )}
                        {metadata?.company && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">燃气公司</span>
                            <span className="font-medium">{metadata.company}</span>
                          </div>
                        )}
                        {metadata?.customerName && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">户主姓名</span>
                            <span className="font-medium">{metadata.customerName}</span>
                          </div>
                        )}
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </Card>
        </div>
      )}

      {/* 时间信息 */}
      <div className="px-4 pb-4">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">时间信息</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">创建时间</span>
              <span className="text-sm">{formatDate(order.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">更新时间</span>
              <span className="text-sm">{formatDate(order.updated_at)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 操作按钮 */}
      <div className="px-4 pb-8">
        <div className="space-y-3">
          <Button 
            className="w-full"
            onClick={() => navigate('/orders')}
          >
            返回订单列表
          </Button>
          {order.status === 'pending' && (
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => toast.info("请耐心等待，订单正在处理中")}
            >
              联系客服
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
