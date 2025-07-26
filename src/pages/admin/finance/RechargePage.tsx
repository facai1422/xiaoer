import React, { useState, useEffect } from 'react';
import { adminSupabase } from '@/utils/adminSupabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';


interface RechargeOrder {
  id: string;
  order_number: string;
  user_id: string;
  amount: number;
  actual_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_username?: string;
  user_phone?: string;
}

export default function RechargePage() {
  const [orders, setOrders] = useState<RechargeOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRechargeOrders();
  }, []);

  const fetchRechargeOrders = async () => {
    try {
      setLoading(true);
      // 只获取钱包充值订单（order_type = 'wallet'）
      const { data: ordersData, error } = await adminSupabase
        .from('recharge_orders')
        .select('*')
        .eq('order_type', 'wallet')  // 只显示钱包充值订单
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('财务管理 - 钱包充值订单:', ordersData?.length || 0, '个');

      // 获取用户信息 - 从user_profiles表获取
      const userIds = [...new Set(ordersData?.map(order => order.user_id) || [])];
      const userProfiles: Record<string, {email?: string, username?: string, phone?: string}> = {};
      
      if (userIds.length > 0) {
        // 从user_profiles表获取用户信息
        const { data: profiles, error: profileError } = await adminSupabase
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
        
        return {
          ...order,
          user_email: userProfile.email,
          user_username: userProfile.username,
          user_phone: userProfile.phone
        };
      }) || [];

      console.log('组合后的订单数据:', enrichedOrders);
      setOrders(enrichedOrders);
    } catch (error) {
      console.error('Error fetching wallet recharge orders:', error);
      toast.error('获取钱包充值订单失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'completed':
      case 'confirmed':
        return '已完成';
      case 'rejected':
        return '已拒绝';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: zhCN
      });
    } catch (error) {
      return '未知时间';
    }
  };

  const handleViewDetails = (orderId: string) => {
    navigate(`/admin/finance/recharge/${orderId}`);
  };

  const handleApprove = async (orderId: string) => {
    try {
      setProcessingId(orderId);
      console.log('开始确认充值订单:', orderId);
      
      // 直接更新订单状态为确认
      const { error } = await adminSupabase
        .from('recharge_orders')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) {
        console.error('确认订单失败:', error);
        throw new Error('确认订单失败');
      }
      
      toast.success('充值订单已确认');
      // 刷新订单列表
      fetchRechargeOrders();
    } catch (error: unknown) {
      console.error('Error approving recharge order:', error);
      const errorMessage = error instanceof Error ? error.message : '确认充值订单失败';
      toast.error(`确认充值订单失败: ${errorMessage}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (orderId: string) => {
    try {
      setProcessingId(orderId);
      const { error } = await adminSupabase
        .from('recharge_orders')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      toast.success('充值订单已拒绝');
      fetchRechargeOrders();
    } catch (error: unknown) {
      console.error('Error rejecting recharge order:', error);
      const errorMessage = error instanceof Error ? error.message : '拒绝充值订单失败';
      toast.error(`拒绝充值订单失败: ${errorMessage}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">充值订单管理</h1>
        
        <div className="mb-4 flex justify-between">
          <Button onClick={fetchRechargeOrders} disabled={loading}>
            {loading ? '加载中...' : '刷新订单'}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">加载中...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">暂无充值订单</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="font-bold mr-2">订单号:</span>
                        <span>{order.order_number}</span>
                        <span className={`ml-auto px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="font-bold mr-2">用户ID:</span>
                        <span className="text-sm">{order.user_id}</span>
                      </div>
                      {order.user_email && (
                        <div className="mb-2">
                          <span className="font-bold mr-2">用户邮箱:</span>
                          <span className="text-sm">{order.user_email}</span>
                        </div>
                      )}
                      {order.user_username && (
                        <div className="mb-2">
                          <span className="font-bold mr-2">用户名:</span>
                          <span className="text-sm">{order.user_username}</span>
                        </div>
                      )}
                      <div className="mb-2">
                        <span className="font-bold mr-2">充值金额:</span>
                        <span className="text-lg font-bold text-green-600">{order.amount} CNY</span>
                        <span className="ml-2 text-sm text-gray-500">≈ {order.actual_amount} USDT</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-bold mr-2">支付方式:</span>
                        <span>{order.payment_method}</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-bold mr-2">创建时间:</span>
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 mt-4 md:mt-0 md:ml-4">
                      <Button 
                        onClick={() => handleViewDetails(order.id)}
                        variant="outline"
                        className="w-full"
                      >
                        查看详情
                      </Button>
                      
                      {order.status === 'pending' && (
                        <>
                          <Button 
                            onClick={() => handleApprove(order.id)}
                            disabled={processingId === order.id}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            {processingId === order.id ? '处理中...' : '确认充值'}
                          </Button>
                          
                          <Button 
                            onClick={() => handleReject(order.id)}
                            disabled={processingId === order.id}
                            variant="destructive"
                            className="w-full"
                          >
                            拒绝
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
} 