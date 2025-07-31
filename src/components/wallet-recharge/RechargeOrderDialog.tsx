import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface RechargeOrder {
  id: string;
  order_number: string;
  amount: number;
  actual_amount: number;
  payment_method: string;
  payment_address?: string;
  status: string;
  expires_at: string;
  created_at: string;
}

interface RechargeOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: RechargeOrder | null;
  paymentAddress?: string;
}

export const RechargeOrderDialog: React.FC<RechargeOrderDialogProps> = ({
  open,
  onOpenChange,
  order,
  paymentAddress
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 计算剩余时间
  const calculateTimeLeft = useCallback(() => {
    if (!order?.expires_at) return 0;
    
    const expiryTime = new Date(order.expires_at).getTime();
    const now = new Date().getTime();
    const remaining = Math.max(0, expiryTime - now);
    
    return remaining;
  }, [order?.expires_at]);

  // 倒计时效果
  useEffect(() => {
    if (!open || !order) return;

    const updateTimer = () => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining <= 0 && !isExpired) {
        setIsExpired(true);
        handleOrderExpiry();
      }
    };

    // 立即更新一次
    updateTimer();
    
    // 每秒更新
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [open, order, calculateTimeLeft, isExpired]);

  // 处理订单过期
  const handleOrderExpiry = async () => {
    if (!order) return;
    
    try {
      // 更新订单状态为过期
      const { error } = await supabase
        .from('recharge_orders')
        .update({ 
          status: 'expired',
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);
      
      if (error) {
        console.error('更新订单状态失败:', error);
      } else {
        toast.warning('订单已过期，请重新创建订单');
      }
    } catch (error) {
      console.error('处理订单过期失败:', error);
    }
  };

  // 手动关闭订单
  const handleCancelOrder = async () => {
    if (!order || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('recharge_orders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);
      
      if (error) {
        console.error('取消订单失败:', error);
        toast.error('取消订单失败');
      } else {
        toast.success('订单已取消');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('取消订单失败:', error);
      toast.error('取消订单失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 确认支付完成
  const handleConfirmPayment = async () => {
    if (!order || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // 这里可以添加支付验证逻辑
      toast.success('已提交支付确认，等待系统验证');
      onOpenChange(false);
    } catch (error) {
      console.error('确认支付失败:', error);
      toast.error('确认支付失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label}已复制到剪贴板`);
    }).catch(() => {
      toast.error('复制失败');
    });
  };

  // 格式化时间显示
  const formatTimeLeft = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 获取状态显示
  const getStatusDisplay = () => {
    if (isExpired || timeLeft <= 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          已过期
        </Badge>
      );
    }
    
    switch (order?.status) {
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            等待支付
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-500">
            <CheckCircle className="w-3 h-3" />
            已完成
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            已取消
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {order?.status || '未知'}
          </Badge>
        );
    }
  };

  if (!order) return null;

  const isActive = order.status === 'pending' && !isExpired && timeLeft > 0;
  const showPaymentAddress = paymentAddress || order.payment_address;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>充值订单</span>
            {getStatusDisplay()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 倒计时显示 */}
          {isActive && (
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-lg font-mono font-bold text-blue-700">
                  {formatTimeLeft(timeLeft)}
                </span>
                <span className="text-sm text-blue-600">剩余时间</span>
              </div>
              <div className="text-xs text-blue-600 text-center mt-1">
                请在倒计时结束前完成支付
              </div>
            </Card>
          )}

          {/* 过期提示 */}
          {(isExpired || timeLeft <= 0) && order.status === 'pending' && (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">订单已过期</span>
              </div>
              <div className="text-xs text-red-600 text-center mt-1">
                请重新创建充值订单
              </div>
            </Card>
          )}

          {/* 订单信息 */}
          <Card className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">订单号</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm">{order.order_number}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(order.order_number, '订单号')}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">充值金额</span>
              <span className="font-bold text-lg text-blue-600">
                {order.actual_amount} USDT
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">支付方式</span>
              <span className="text-sm">{order.payment_method}</span>
            </div>

            {showPaymentAddress && (
              <div className="space-y-2">
                <span className="text-sm text-gray-600">支付地址</span>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                  <span className="font-mono text-xs flex-1 break-all">
                    {showPaymentAddress}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(showPaymentAddress, '支付地址')}
                    className="h-6 w-6 p-0 flex-shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* 支付说明 */}
          {isActive && (
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2">支付说明</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 请在倒计时结束前完成转账</li>
                <li>• 转账金额必须与订单金额一致</li>
                <li>• 转账完成后点击"已完成支付"</li>
                <li>• 系统将在1-5分钟内到账</li>
              </ul>
            </Card>
          )}

          {/* 操作按钮 */}
          <div className="flex space-x-2">
            {isActive ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelOrder}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  取消订单
                </Button>
                <Button
                  onClick={handleConfirmPayment}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  {isSubmitting ? '处理中...' : '已完成支付'}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                关闭
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RechargeOrderDialog;