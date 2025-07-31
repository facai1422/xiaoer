import { supabase } from '@/integrations/supabase/client';

/**
 * 过期订单管理服务
 */
export class OrderExpiryService {
  private static instance: OrderExpiryService;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  // 单例模式
  static getInstance(): OrderExpiryService {
    if (!OrderExpiryService.instance) {
      OrderExpiryService.instance = new OrderExpiryService();
    }
    return OrderExpiryService.instance;
  }

  /**
   * 开始监控过期订单
   * @param intervalMs 检查间隔（毫秒），默认60秒
   */
  startMonitoring(intervalMs: number = 60000) {
    if (this.isRunning) {
      console.log('订单过期监控已在运行中');
      return;
    }

    console.log('开始监控过期订单，检查间隔:', intervalMs / 1000, '秒');
    this.isRunning = true;
    
    // 立即执行一次
    this.checkAndCloseExpiredOrders();
    
    // 设置定时器
    this.intervalId = setInterval(() => {
      this.checkAndCloseExpiredOrders();
    }, intervalMs);
  }

  /**
   * 停止监控过期订单
   */
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('已停止监控过期订单');
  }

  /**
   * 检查并关闭过期订单
   */
  async checkAndCloseExpiredOrders(): Promise<number> {
    try {
      const now = new Date().toISOString();
      
      // 查找所有过期的pending订单
      const { data: expiredOrders, error: selectError } = await supabase
        .from('recharge_orders')
        .select('id, order_number, user_id, amount, expires_at')
        .eq('status', 'pending')
        .not('expires_at', 'is', null)
        .lt('expires_at', now);

      if (selectError) {
        console.error('查询过期订单失败:', selectError);
        return 0;
      }

      if (!expiredOrders || expiredOrders.length === 0) {
        // console.log('没有过期订单需要处理');
        return 0;
      }

      console.log(`发现 ${expiredOrders.length} 个过期订单，准备关闭`);

      // 批量更新订单状态为过期
      const orderIds = expiredOrders.map(order => order.id);
      const { error: updateError } = await supabase
        .from('recharge_orders')
        .update({
          status: 'expired',
          updated_at: now,
          admin_remark: '订单已过期自动关闭'
        })
        .in('id', orderIds);

      if (updateError) {
        console.error('更新过期订单状态失败:', updateError);
        return 0;
      }

      console.log(`已成功关闭 ${expiredOrders.length} 个过期订单`);
      
      // 记录每个关闭的订单
      expiredOrders.forEach(order => {
        console.log(`关闭过期订单: ${order.order_number}, 金额: ${order.amount} USDT`);
      });

      return expiredOrders.length;
    } catch (error) {
      console.error('检查过期订单时发生错误:', error);
      return 0;
    }
  }

  /**
   * 手动关闭特定订单
   */
  async closeOrder(orderId: string, reason: string = '手动关闭'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('recharge_orders')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
          admin_remark: reason
        })
        .eq('id', orderId);

      if (error) {
        console.error('关闭订单失败:', error);
        return false;
      }

      console.log(`订单 ${orderId} 已关闭，原因: ${reason}`);
      return true;
    } catch (error) {
      console.error('关闭订单时发生错误:', error);
      return false;
    }
  }

  /**
   * 获取用户的活跃订单
   */
  async getUserActiveOrders(userId: string) {
    try {
      const { data, error } = await supabase
        .from('recharge_orders')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .not('expires_at', 'is', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取用户活跃订单失败:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('获取用户活跃订单时发生错误:', error);
      return [];
    }
  }

  /**
   * 检查订单是否已过期
   */
  isOrderExpired(expiresAt: string): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt).getTime() < Date.now();
  }

  /**
   * 计算订单剩余时间（毫秒）
   */
  getOrderTimeLeft(expiresAt: string): number {
    if (!expiresAt) return 0;
    return Math.max(0, new Date(expiresAt).getTime() - Date.now());
  }

  /**
   * 获取监控状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      hasInterval: this.intervalId !== null
    };
  }
}

// 导出单例实例
export const orderExpiryService = OrderExpiryService.getInstance();

// 默认导出类
export default OrderExpiryService;