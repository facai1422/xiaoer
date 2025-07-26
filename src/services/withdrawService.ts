import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type WithdrawalRequest = Database['public']['Tables']['withdrawal_requests']['Insert'];
type UserPayment = Database['public']['Tables']['user_payments']['Row'];
type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserTransaction = Database['public']['Tables']['user_transactions']['Insert'];

export interface WithdrawParams {
  userId: string;
  amount: number;
  accountId: string;
}

// 主要的提现方法
export const createWithdrawOrder = async ({ userId, amount, accountId }: WithdrawParams) => {
  try {
    console.log('🔄 开始创建提现订单:', { userId, amount, accountId });
    console.log('🌍 环境信息:', {
      nodeEnv: import.meta.env.NODE_ENV || 'unknown',
      isDev: import.meta.env.DEV,
      isProduction: import.meta.env.PROD,
      userAgent: navigator?.userAgent || 'Unknown',
      location: window?.location?.hostname || 'Unknown'
    });
    
    // 添加Supabase客户端状态检查
    console.log('🔌 Supabase客户端状态:', {
      url: import.meta.env.VITE_SUPABASE_URL || 'Unknown',
      keySet: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      auth: !!supabase.auth,
      isConnected: true
    });

    // 获取当前用户会话状态
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('👤 用户会话状态:', {
      hasSession: !!sessionData?.session,
      hasUser: !!sessionData?.session?.user,
      userId: sessionData?.session?.user?.id,
      sessionError: sessionError
    });

    if (sessionError) {
      console.error('❌ 获取用户会话失败:', sessionError);
      toast.error('用户会话验证失败，请重新登录');
      return false;
    }

    if (!sessionData?.session) {
      console.error('❌ 用户未登录');
      toast.error('请先登录后再进行提现操作');
      return false;
    }

    // 使用会话中的用户ID，确保一致性
    const actualUserId = sessionData.session.user.id;
    if (actualUserId !== userId) {
      console.warn('⚠️ 用户ID不匹配:', { provided: userId, actual: actualUserId });
    }

    // 检查用户余额
    console.log('💰 开始检查用户余额...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('balance')
      .eq('user_id', actualUserId)
      .single();

    if (profileError) {
      console.error('❌ 获取用户信息失败:', profileError);
      console.error('📋 详细错误信息:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
      });
      
      if (profileError.code === '42P01') {
        toast.error("用户资料表不存在，请联系管理员");
      } else if (profileError.code === 'PGRST116') {
        toast.error("用户资料不存在，请先完善个人信息");
      } else if (profileError.code === '42501') {
        toast.error("数据库权限不足，请联系管理员");
      } else {
        toast.error(`获取用户信息失败: ${profileError.message}`);
      }
      return false;
    }

    const userProfile = profile as UserProfile;
    const userBalance = userProfile?.balance || 0;
    console.log('💰 用户当前余额:', userBalance);

    if (userBalance < amount) {
      toast.error(`余额不足，当前余额：${userBalance.toFixed(2)} USDT`);
      return false;
    }

    // 获取提现账户信息
    console.log('🔍 获取提现账户信息...');
    const { data: paymentAccount, error: accountError } = await supabase
      .from('user_payments')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accountError) {
      console.error('❌ 获取提现账户失败:', accountError);
      console.error('📋 详细错误信息:', {
        code: accountError.code,
        message: accountError.message,
        details: accountError.details,
        hint: accountError.hint
      });
      
      if (accountError.code === '42P01') {
        toast.error("提现账户表不存在，请联系管理员");
      } else if (accountError.code === 'PGRST116') {
        toast.error("提现账户不存在，请先添加提现账户");
      } else if (accountError.code === '42501') {
        toast.error("数据库权限不足，请联系管理员");
      } else {
        toast.error(`获取提现账户失败: ${accountError.message}`);
      }
      return false;
    }

    if (!paymentAccount) {
      toast.error("提现账户不存在，请先添加提现账户");
      return false;
    }

    const account = paymentAccount as UserPayment;
    console.log('✅ 提现账户信息:', account);

    // 创建提现申请数据
    const withdrawalData: WithdrawalRequest = {
      user_id: actualUserId, // 使用会话中的真实用户ID
      amount: amount,
      payment_method: account.type || 'withdrawal',
      payment_account: account.account_number,
      payment_name: account.account_name,
      status: 'pending',
      fee: 0
    };

    console.log('📝 创建提现订单数据:', withdrawalData);

    // 创建提现订单
    console.log('📝 向数据库插入提现订单...');
    const { data: order, error: orderError } = await supabase
      .from('withdrawal_requests')
      .insert(withdrawalData)
      .select()
      .single();

    if (orderError) {
      console.error('❌ 创建提现订单失败:', orderError);
      console.error('📋 详细错误信息:', {
        code: orderError.code,
        message: orderError.message,
        details: orderError.details,
        hint: orderError.hint
      });
      
      if (orderError.code === '42P01') {
        toast.error("提现订单表不存在，请联系管理员");
      } else if (orderError.code === '42501') {
        toast.error("数据库权限不足，请联系管理员配置RLS策略");
      } else if (orderError.code === 'PGRST301') {
        toast.error("提现功能暂时不可用，请联系管理员");
      } else if (orderError.code === '23503') {
        toast.error("用户数据关联错误，请联系管理员");
      } else {
        toast.error(`创建提现订单失败: ${orderError.message}`);
      }
      return false;
    }

    console.log('✅ 提现订单创建成功:', order);

    // 注意：交易记录由数据库触发器自动创建，无需手动创建
    // 触发器: sync_withdrawal_to_transaction 会自动处理
    console.log('📊 交易记录将由数据库触发器自动创建');

    // 更新用户余额
    console.log('💳 更新用户余额...');
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        balance: userBalance - amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', actualUserId);

    if (updateError) {
      console.error('❌ 更新用户余额失败:', updateError);
      
      // 如果余额更新失败，回滚提现申请
      console.log('🔄 回滚提现申请...');
      await supabase
        .from('withdrawal_requests')
        .delete()
        .eq('id', order.id);
        
      toast.error(`更新余额失败，提现申请已取消: ${updateError.message}`);
      return false;
    }

    console.log('🎉 提现申请提交成功');
    toast.success(`提现申请已提交！金额：${amount.toFixed(2)} USDT，请等待审核`);
    return true;
  } catch (error) {
    console.error('💥 提现申请异常:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    toast.error(`提现申请失败：${errorMessage}`);
    return false;
  }
};

// 默认导出，确保兼容性
export default createWithdrawOrder;
