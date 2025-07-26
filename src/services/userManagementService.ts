import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'] & {
  email?: string;
  status?: 'active' | 'frozen' | 'disabled';
  usdt_address?: string;
  superior_email?: string;
  transaction_count?: number;
  total_amount?: number;
};

export type UserTransaction = Database['public']['Tables']['user_transactions']['Row'];
export type UserWithdrawalAddress = Database['public']['Tables']['user_withdrawal_addresses']['Row'];

export interface UserRiskData {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  lastActivity: string;
  totalTransactions: number;
  totalAmount: number;
  suspiciousCount: number;
  accountAge: number;
}

export class UserManagementService {
  
  // 获取所有用户列表
  static async getUsers() {
    try {
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_transactions(count),
          user_withdrawal_addresses(address)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 转换数据格式
      const transformedUsers = users?.map(user => {
        const transactionCount = Array.isArray(user.user_transactions) 
          ? user.user_transactions.length 
          : 0;
        
        const usdtAddress = Array.isArray(user.user_withdrawal_addresses) && user.user_withdrawal_addresses.length > 0
          ? user.user_withdrawal_addresses[0].address
          : '';

        return {
          ...user,
          email: `user_${user.id.slice(0, 8)}@example.com`, // 模拟邮箱
          status: user.online_status ? 'active' : 'disabled' as 'active' | 'frozen' | 'disabled',
          usdt_address: usdtAddress,
          superior_email: 'admin@example.com', // 默认上级
          transaction_count: transactionCount,
          total_amount: 0, // 将在下面计算
        };
      }) || [];

      // 获取每个用户的交易金额总计
      for (const user of transformedUsers) {
        const { data: transactions } = await supabase
          .from('user_transactions')
          .select('amount')
          .eq('user_id', user.id);
        
        user.total_amount = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
      }

      return { data: transformedUsers, error: null };
    } catch (error) {
      console.error('获取用户列表失败:', error);
      return { data: null, error };
    }
  }

  // 获取用户风险监控数据
  static async getUserRiskData(): Promise<{ data: UserRiskData[] | null, error: Error | null }> {
    try {
      const { data: users, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (userError) throw userError;

      if (!users) return { data: [], error: null };

      const riskData: UserRiskData[] = [];

      for (const user of users) {
        // 获取用户交易数据
        const { data: transactions } = await supabase
          .from('user_transactions')
          .select('*')
          .eq('user_id', user.id);

        // 计算账户年龄（天数）
        const accountAge = Math.floor(
          (new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        // 计算交易统计
        const totalTransactions = transactions?.length || 0;
        const totalAmount = transactions?.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 0;

        // 计算可疑行为数量（简单规则）
        let suspiciousCount = 0;
        if (accountAge < 7 && totalTransactions > 10) suspiciousCount += 1; // 新账户频繁交易
        if (totalAmount > 50000) suspiciousCount += 1; // 大额交易
        if (totalTransactions > 100) suspiciousCount += 1; // 交易过于频繁

        // 计算风险评分
        let riskScore = 0;
        if (accountAge < 30) riskScore += 20; // 新账户
        if (totalTransactions > 100) riskScore += 15; // 交易频繁
        riskScore += suspiciousCount * 5; // 每个可疑行为 +5 分

        // 确定风险等级
        let riskLevel: 'low' | 'medium' | 'high' = 'low';
        if (riskScore > 70) riskLevel = 'high';
        else if (riskScore > 30) riskLevel = 'medium';

        // 获取最后活动时间
        const lastActivity = transactions && transactions.length > 0
          ? transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : user.updated_at;

        riskData.push({
          id: user.id,
          email: `user_${user.id.slice(0, 8)}@example.com`,
          nickname: user.username || user.full_name || `用户${user.id.slice(0, 6)}`,
          avatar: user.avatar_url || undefined,
          riskLevel,
          riskScore: Math.min(riskScore, 100), // 最高100分
          lastActivity,
          totalTransactions,
          totalAmount,
          suspiciousCount,
          accountAge
        });
      }

      return { data: riskData, error: null };
    } catch (error) {
      console.error('获取用户风险数据失败:', error);
      return { data: null, error };
    }
  }

  // 更新用户余额
  static async updateUserBalance(userId: string, amount: number, type: 'add' | 'subtract', description?: string) {
    try {
      // 获取当前余额
      const { data: user, error: getUserError } = await supabase
        .from('user_profiles')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (getUserError) throw getUserError;

      const currentBalance = user.balance || 0;
      const newBalance = type === 'add' ? currentBalance + amount : currentBalance - amount;

      if (newBalance < 0) {
        throw new Error('余额不足');
      }

      // 更新用户余额
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // 记录交易记录
      const { error: transactionError } = await supabase
        .from('user_transactions')
        .insert({
          user_id: userId,
          amount: type === 'add' ? amount : -amount,
          balance: newBalance,
          type: type === 'add' ? 'deposit' : 'withdrawal',
          description: description || `管理员${type === 'add' ? '增加' : '减少'}余额`,
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      return { success: true, newBalance };
    } catch (error) {
      console.error('更新用户余额失败:', error);
      return { success: false, error };
    }
  }

  // 冻结/解冻用户账户
  static async toggleUserStatus(userId: string, freeze: boolean) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          status: freeze ? 'frozen' : 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('更新用户状态失败:', error);
      return { success: false, error };
    }
  }

  // 删除用户账户
  static async deleteUser(userId: string) {
    try {
      // 注意：实际应用中可能需要软删除而不是硬删除
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('删除用户失败:', error);
      return { success: false, error };
    }
  }

  // 更新用户密码（这里只是示例，实际需要通过认证系统）
  static async updateUserPasswords(userId: string, loginPassword?: string, tradePassword?: string) {
    try {
      // 注意：这里只是演示，实际应用中密码更新需要通过Supabase Auth
      console.log('更新用户密码:', { userId, loginPassword: !!loginPassword, tradePassword: !!tradePassword });
      
      // 可以在用户配置表中记录密码修改历史
      const { error } = await supabase
        .from('user_profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('更新用户密码失败:', error);
      return { success: false, error };
    }
  }

  // 获取用户统计数据
  static async getUserStats() {
    try {
      // 总用户数
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // 活跃用户数
      const { count: activeUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('online_status', true);

      // 冻结用户数
      const { count: frozenUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('online_status', false);

      // 总余额
      const { data: balances } = await supabase
        .from('user_profiles')
        .select('balance');

      const totalBalance = balances?.reduce((sum, user) => sum + (user.balance || 0), 0) || 0;

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        frozenUsers: frozenUsers || 0,
        totalBalance
      };
    } catch (error) {
      console.error('获取用户统计失败:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        frozenUsers: 0,
        totalBalance: 0
      };
    }
  }
} 