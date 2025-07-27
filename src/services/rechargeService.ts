import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// 定义充值订单类型
export interface RechargeOrder {
  userId: string;
  phone: string;
  amount: number;
  type: string;
  name?: string;
  metadata?: Record<string, string | number | boolean>;
}

// 创建充值订单
export const createRechargeOrder = async (data: RechargeOrder) => {
  try {
    console.log('🔄 开始创建充值订单:', data);
    
    // 验证必需字段
    if (!data.userId) {
      throw new Error('用户ID不能为空');
    }
    if (!data.amount || data.amount <= 0) {
      throw new Error('充值金额必须大于0');
    }
    if (!data.type) {
      throw new Error('支付方式不能为空');
    }

    // 获取当前用户，确保用户ID有效
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('获取用户信息失败，请重新登录');
    }

    // 使用当前登录用户的ID，而不是传入的ID
    const userId = user.id;
    
    // 计算实际到账金额
    let actual_amount;
    
    if (data.type === 'USDT充值' || data.type.toLowerCase().includes('usdt')) {
      // USDT充值：1:1到账，不需要汇率转换
      actual_amount = Number(data.amount);
    } else {
      // RMB充值：需要按汇率转换为USDT
      const exchange_rate = 7.2; // RMB到USDT的汇率
      actual_amount = Number(parseFloat((data.amount / exchange_rate).toFixed(2)));
    }
    
    const orderNumber = `RO${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // 首先获取用户档案的正确ID
    try {
      
      // 获取用户档案ID，这是recharge_orders外键引用的字段
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, user_id')
        .eq('user_id', userId)
        .single();

      let profileId = null;

      if (profileError || !userProfile) {
        console.log('用户档案不存在，创建新档案:', profileError);
        
        // 创建用户档案
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            email: user.email || '',
            username: user.email?.split('@')[0] || `用户${userId.substring(0, 8)}`,
            full_name: user.email?.split('@')[0] || `用户${userId.substring(0, 8)}`,
            balance: 0,
            status: 'active',
            invite_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (createError || !newProfile) {
          console.error('创建用户档案失败:', createError);
          throw new Error('无法创建用户档案');
        }

        profileId = newProfile.id;
        console.log('新用户档案创建成功，ID:', profileId);
      } else {
        profileId = userProfile.id;
        console.log('找到现有用户档案，ID:', profileId);
      }

      // 准备订单数据，使用正确的user_id (实际上是user_profiles.id)
      const orderData = {
        user_id: profileId, // 使用user_profiles.id而不是auth.users.id
        order_number: orderNumber,
        amount: Number(data.amount),
        actual_amount: actual_amount,
        payment_method: data.type,
        payment_channel: 'default',
        order_type: 'wallet',
        status: 'pending',
        phone_number: data.phone || '',
        user_name: user.email?.split('@')[0] || '用户',
        target_account: (data.metadata?.cardNumber as string) || data.phone || '',
        recharge_amount: Number(data.amount),
        metadata: data.metadata || null
      };

      const { data: order, error } = await supabase
        .from('recharge_orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        console.error("创建订单失败:", error);
        throw error;
      }

      // 🔒 安全修复：移除自动确认逻辑，所有充值订单都需要管理员审核
      // 所有充值订单创建后都保持 'pending' 状态，等待管理员审核
      console.log('✅ 充值订单创建成功，等待管理员审核确认:', order.order_number);

      toast.success("充值订单创建成功！");
      return order;
      
    } catch (directErr) {
      console.error('直接创建订单异常:', directErr);
      throw directErr;
    }
  } catch (error) {
    console.error("创建充值订单异常:", error);
    const errorMessage = error instanceof Error ? error.message : "创建充值订单失败";
    toast.error(`创建订单失败: ${errorMessage}`);
    throw error;
  }
};

// 更新交易状态
export const updateTransactionStatus = async (orderId: string, status: string, message?: string) => {
  try {
    // 先检查订单是否已经是完成状态
    const { data: existingOrder, error: checkError } = await supabase
      .from('recharge_orders')
      .select('status, user_id, amount')
      .eq('id', orderId)
      .single();

    if (checkError) {
      console.error("Error checking order status:", checkError);
      throw checkError;
    }

    // 如果订单已经是完成状态，不再处理
    if (existingOrder.status === 'completed' || existingOrder.status === 'confirmed') {
      toast.warning("订单已经处理完成，无需重复操作");
      return existingOrder;
    }

    // 更新订单状态
    const { data, error } = await supabase
      .from('recharge_orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error("Error updating transaction status:", error);
      throw error;
    }

    // 如果状态更新为成功，更新用户余额
    if ((status === 'completed' || status === 'confirmed') && data) {
      await updateUserBalance(data.user_id, data.amount);
    }

    toast.success(message || `订单状态已更新为 ${status}`);
    return data;
  } catch (error) {
    console.error("Error in updateTransactionStatus:", error);
    throw error;
  }
};

// 更新用户余额 - 专门用于钱包充值(增加余额)
const updateUserBalance = async (userId: string, amount: number) => {
  try {
    console.log('🔄 钱包余额充值 - 开始更新用户余额:', { userId, amount });
    
    // 安全检查：确保金额为正数(钱包充值只能增加余额)
    if (amount <= 0) {
      throw new Error(`钱包充值金额必须为正数，当前金额: ${amount}`);
    }
    
    // 获取当前余额 - 使用user_id字段查询user_profiles
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (userError) {
      console.error("Error fetching user balance:", userError);
      throw userError;
    }

    const currentBalance = userData.balance || 0;
    const newBalance = currentBalance + amount;
    
    console.log('💰 钱包充值余额计算:', { 
      当前余额: currentBalance, 
      充值金额: amount, 
      新余额: newBalance 
    });

    // 额外安全检查：确保新余额合理
    if (newBalance < 0) {
      throw new Error(`余额计算错误：新余额不能为负数 ${newBalance}`);
    }
    
    if (newBalance < currentBalance) {
      throw new Error(`钱包充值逻辑错误：新余额(${newBalance})不能小于当前余额(${currentBalance})`);
    }

    // 同时更新user_profiles表 - 加锁防止并发问题
    const { error: updateProfileError } = await supabase
      .from('user_profiles')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('balance', currentBalance); // 乐观锁：只有当余额未被其他操作修改时才更新

    if (updateProfileError) {
      console.error("❌ 更新用户余额失败:", updateProfileError);
      throw new Error(`更新用户余额失败: ${updateProfileError.message}`);
    }
    
    console.log('✅ user_profiles余额更新成功:', { 用户ID: userId, 新余额: newBalance });

    // 同时更新users表的余额（如果存在）
    const { error: updateUsersError } = await supabase
      .from('users')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateUsersError) {
      console.log('更新users表余额时出错:', updateUsersError);
      // 不抛出错误，继续执行
    }

    // 创建交易记录 - 钱包充值专用
    const { error: transactionError } = await supabase
      .from('user_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        type: 'credit', // 贷记(增加余额)
        description: '💰 钱包余额充值 - USDT',
        balance: newBalance,
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (transactionError) {
      console.error("❌ 创建钱包充值交易记录失败:", transactionError);
      // 抛出错误，确保交易记录完整性
      throw new Error(`创建交易记录失败: ${transactionError.message}`);
    } 
    
    console.log('✅ 钱包充值交易记录创建成功:', { 
      金额: amount, 
      余额: newBalance,
      描述: '钱包余额充值 - USDT'
    });

    // 触发前端余额刷新
    refreshUserBalance();
    
    console.log('🎉 钱包余额充值完成！', {
      用户ID: userId,
      充值金额: amount,
      最终余额: newBalance
    });
    
    return { success: true, newBalance, amount };
  } catch (error) {
    console.error("💥 钱包余额充值失败:", error);
    throw new Error(`钱包余额充值失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

// 获取支付地址 - 最简化版本
export const getPaymentAddresses = async () => {
  try {
    const { data } = await supabase
      .from('platform_payment_addresses')
      .select('id, address, type, network, currency, is_active')
      .eq('is_active', true);

    return (data || []).map((item: any) => ({
      id: item.id,
      type: item.type || 'USDT',
      address: item.address,
      is_active: item.is_active || true
    }));
  } catch {
    return [];
  }
};

// 获取充值订单 - 修复user_id映射问题
export const getRechargeOrders = async (authUserId: string) => {
  try {
    console.log('📋 开始获取充值订单，auth.users.id:', authUserId);
    
    // 首先获取用户档案ID（这是recharge_orders表实际存储的user_id）
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', authUserId)
      .single();

    if (profileError || !userProfile) {
      console.log('⚠️ 未找到用户档案:', profileError);
      return []; // 返回空数组而不是抛出错误
    }

    const profileId = userProfile.id;
    console.log('✅ 找到用户档案ID:', profileId);

    // 使用正确的user_id查询充值订单
    const { data, error } = await supabase
      .from('recharge_orders')
      .select('*')
      .eq('user_id', profileId) // 使用user_profiles.id
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ 获取充值订单失败:", error);
      throw error;
    }

    console.log('📋 充值订单查询成功，找到订单数量:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("💥 获取充值订单异常:", error);
    throw error;
  }
};

// 确认充值订单（管理员操作）
export const approveRechargeOrder = async (orderId: string) => {
  try {
    console.log('开始确认充值订单:', orderId);
    
    // 获取当前管理员ID
    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id;
    
    // 调用RPC函数确认订单
    const { data, error } = await supabase.rpc('approve_recharge_order', { 
      order_id: orderId
    });
    
    if (error) {
      console.error("确认订单失败:", error);
      toast.error(`确认订单失败: ${error.message}`);
      throw error;
    }
    
    console.log('订单确认结果:', data);
    
    // 检查返回的数据类型并处理
    const result = data as { success?: boolean; message?: string } | boolean | null;
    if (result && typeof result === 'object' && result.success) {
      toast.success(result.message || "订单已确认");
      
      // 刷新用户余额 - 通知所有相关组件
      refreshUserBalance();
      
      return result;
    } else if (result && typeof result === 'object' && result.success === false) {
      toast.error(result.message || "确认订单失败");
      throw new Error(result.message || "确认订单失败");
    } else {
      // 如果返回true，表示成功但没有详细信息
      toast.success("订单已确认");
      refreshUserBalance();
      return { success: true, message: "订单已确认" };
    }
  } catch (error) {
    console.error("确认订单异常:", error);
    const errorMessage = error instanceof Error ? error.message : "确认订单失败";
    toast.error(errorMessage);
    throw error;
  }
};

// 刷新用户余额 - 通知所有相关组件更新余额
export const refreshUserBalance = async () => {
  try {
    // 获取当前用户ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // 获取最新用户余额
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('balance')
      .eq('user_id', user.id)
      .single();
    
    if (error || !profile) {
      console.error("获取用户余额失败:", error);
      return;
    }
    
    console.log('已刷新用户余额:', profile.balance);
    
    // 发布余额更新事件，通知所有订阅组件
    const event = new CustomEvent('balance-updated', { 
      detail: { balance: profile.balance }
    });
    window.dispatchEvent(event);
    
    return profile.balance;
  } catch (error) {
    console.error("刷新用户余额异常:", error);
  }
};
