import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BusinessOrderData {
  userId: string;
  businessType: string;
  targetAccount: string;
  amount: number;
  actualAmount: number;
  accountName?: string;
  region?: string;
  metadata?: Record<string, string | number | boolean>;
}



// 创建业务订单
export const createBusinessOrder = async (orderData: BusinessOrderData) => {
  try {
    console.log('🔄 开始创建业务订单:', {
      authUserId: orderData.userId,
      businessType: orderData.businessType,
      amount: orderData.actualAmount
    });

    // 1. 获取用户档案ID（recharge_orders.user_id应该是user_profiles.id，不是auth.users.id）
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, balance')
      .eq('user_id', orderData.userId)
      .single();

    if (profileError || !userProfile) {
      console.error('❌ 未找到用户档案:', profileError);
      throw new Error('用户档案不存在，请先完善个人信息');
    }

    console.log('✅ 找到用户档案，user_profiles.id:', userProfile.id);

    // 2. 检查余额
    const currentBalance = userProfile.balance || 0;
    
    if (currentBalance < orderData.actualAmount) {
      throw new Error(`余额不足，当前余额: ${currentBalance.toFixed(2)} USDT，所需金额: ${orderData.actualAmount.toFixed(2)} USDT`);
    }

    // 3. 生成订单号
    const orderNumber = `BO${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // 4. 创建订单（使用user_profiles.id作为user_id，确保外键约束正常工作）
    const { data: order, error: orderError } = await supabase
      .from('recharge_orders')
      .insert({
        user_id: userProfile.id, // 使用user_profiles.id而不是auth.users.id
        order_number: orderNumber,
        name: orderData.businessType,
        phone_number: orderData.targetAccount,
        target_account: orderData.targetAccount,
        amount: orderData.amount,
        actual_amount: orderData.actualAmount,
        recharge_amount: orderData.amount,
        payment_method: orderData.businessType,
        payment_channel: 'balance',
        status: 'pending',
        user_name: orderData.accountName || '',
        metadata: orderData.metadata || null,
        order_type: 'business',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (orderError) {
      console.error("创建订单失败:", orderError);
      throw new Error("创建订单失败");
    }

    console.log('✅ 业务订单创建成功，订单号:', orderNumber);

    // 5. 扣除用户余额 (业务充值 - 使用钱包余额购买服务)
    console.log('💳 业务充值 - 扣除钱包余额:', { 
      当前余额: currentBalance, 
      扣除金额: orderData.actualAmount, 
      业务类型: orderData.businessType
    });
    
    const newBalance = currentBalance - orderData.actualAmount;
    
    // 安全检查
    if (newBalance < 0) {
      throw new Error(`余额不足！当前余额: ${currentBalance}，需要: ${orderData.actualAmount}`);
    }
    
    const { error: balanceError } = await supabase
      .from('user_profiles')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userProfile.id)
      .eq('balance', currentBalance); // 乐观锁防止并发问题

    if (balanceError) {
      // 如果扣款失败，删除订单
      await supabase
        .from('recharge_orders')
        .delete()
        .eq('id', order.id);
      
      console.error("扣除余额失败:", balanceError);
      throw new Error("扣除余额失败");
    }

    console.log('✅ 余额扣除成功，新余额:', newBalance);

    // 6. 安全更新users表余额（只更新存在的记录）
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderData.userId);

    if (userUpdateError) {
      console.error("更新users表余额失败:", userUpdateError);
      // 用户余额更新失败不应该阻止交易记录创建，只记录错误
    }

    // 7. 创建交易记录 (业务充值 - 扣除余额)
    const { error: txError } = await supabase
      .from('user_transactions')
      .insert({
        user_id: orderData.userId, // 这里使用auth.users.id
        amount: -orderData.actualAmount, // 负数表示扣除
        type: 'debit', // 借记(扣除余额)
        description: `💳 业务充值 - ${orderData.businessType} (${orderData.targetAccount})`,
        status: 'completed',
        balance: newBalance,
        balance_before: currentBalance,
        balance_after: newBalance,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (txError) {
      console.error("❌ 创建交易记录失败:", txError);
      throw new Error(`创建交易记录失败: ${txError.message}`); // 交易记录很重要，失败应该抛出错误
    }

    console.log('✅ 交易记录创建成功');

    // 8. 触发前端余额刷新
    try {
      // 发布余额更新事件
      window.dispatchEvent(new CustomEvent('balanceUpdated', { 
        detail: { newBalance, userId: orderData.userId }
      }));
    } catch (e) {
      console.log('触发余额刷新事件失败:', e);
    }

    console.log('🎉 业务订单处理完成:', {
      订单号: orderNumber,
      业务类型: orderData.businessType,
      扣除金额: orderData.actualAmount,
      剩余余额: newBalance
    });

    toast.success("订单创建成功！");
    return order;
  } catch (error) {
    console.error("❌ 创建业务订单失败:", error);
    const errorMessage = error instanceof Error ? error.message : "创建订单失败";
    toast.error(errorMessage);
    throw error;
  }
};

// 获取订单详情
export const getOrderDetail = async (orderId: string) => {
  try {
    const { data, error } = await supabase
      .from('recharge_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error("获取订单详情失败:", error);
      throw new Error("获取订单详情失败");
    }

    return data;
  } catch (error) {
    console.error("获取订单详情失败:", error);
    throw error;
  }
}; 