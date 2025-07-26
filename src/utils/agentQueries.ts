import { supabase } from "@/integrations/supabase/client";

// 基础团队成员类型
export interface TeamMember {
  id: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  balance: number | null;
  total_recharge: number | null;
  referral_count: number | null;
  level: number;
  children?: TeamMember[];
}

// 获取代理信息
export const getAgentProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('agent_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('获取代理档案错误:', error);
      // 如果表不存在，返回null而不是抛出错误
      if (error.code === '42P01') {
        console.log('agent_profiles表不存在');
        return null;
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('getAgentProfile异常:', error);
    return null;
  }
};

// 获取用户的推荐信息
export const getUserReferralInfo = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('invite_code, referrer_id, referral_count')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('获取用户推荐信息失败:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('获取用户推荐信息异常:', error);
    throw error;
  }
};

// 获取团队成员（直推）
export const getDirectReferrals = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        username,
        email,
        phone,
        created_at,
        balance,
        total_recharge,
        referral_count
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('获取直推成员失败:', error);
      // 如果表不存在或字段不存在，返回空数组
      if (error.code === '42P01' || error.code === '42703') {
        console.log('user_profiles表或字段不存在，返回空数组');
        return [];
      }
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('getDirectReferrals异常:', error);
    return [];
  }
};

// 基础团队成员类型
interface BaseTeamMember {
  id: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  balance: number | null;
  total_recharge: number | null;
  referral_count: number | null;
  level: number;
}

// 团队成员类型定义（限制递归深度）
export interface TeamMember extends BaseTeamMember {
  children?: TeamMember[];
}

// 获取多级团队成员
export const getTeamMembers = async (userId: string, maxLevel: number = 10): Promise<TeamMember[]> => {
  // 递归获取团队成员
  const getTeamRecursive = async (referrerId: string, currentLevel: number): Promise<TeamMember[]> => {
    if (currentLevel > maxLevel) return [];
    
    try {
      const { data: members, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          username,
          email,
          phone,
          created_at,
          balance,
          total_recharge,
          referral_count
        `)
        .eq('referrer_id', referrerId);
        
      if (error) {
        console.error(`获取第${currentLevel}级团队成员失败:`, error);
        // 如果表不存在或字段不存在，返回空数组
        if (error.code === '42P01' || error.code === '42703') {
          console.log('user_profiles表或字段不存在，返回空数组');
          return [];
        }
        return [];
      }
        
      if (!members) return [];
      
      // 为每个成员添加级别信息并递归获取其下级
      const membersWithLevel = await Promise.all(
        members.map(async (member) => {
          const children = await getTeamRecursive(member.id, currentLevel + 1);
          return {
            ...member,
            level: currentLevel,
            children: children.length > 0 ? children : undefined
          };
        })
      );
      
      return membersWithLevel;
    } catch (error) {
      console.error(`getTeamRecursive异常 (level ${currentLevel}):`, error);
      return [];
    }
  };
  
  try {
    return await getTeamRecursive(userId, 1);
  } catch (error) {
    console.error('getTeamMembers异常:', error);
    return [];
  }
};

// 计算团队总人数
export const getTeamStats = (members: TeamMember[]): { directCount: number; totalCount: number } => {
  let totalCount = members.length;
  const directCount = members.length;
  
  const countChildren = (memberList: TeamMember[]) => {
    memberList.forEach(member => {
      if (member.children && member.children.length > 0) {
        totalCount += member.children.length;
        countChildren(member.children);
      }
    });
  };
  
  countChildren(members);
  
  return { directCount, totalCount };
};

// 获取佣金统计（从代理档案表）
export const getCommissionStats = async (userId: string) => {
  try {
    const { data: agentProfile, error } = await supabase
      .from('agent_profiles')
      .select('total_commission, commission_rate')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('获取代理档案佣金统计错误:', error);
      // 如果表不存在，返回默认值
      if (error.code === '42P01') {
        console.log('agent_profiles表不存在，返回默认佣金统计');
        return {
          available: 0,
          pending: 0,
          withdrawn: 0,
          total: 0,
          commissionRate: 0
        };
      }
      throw error;
    }
    
    // 获取用户交易记录来计算可提现和已提现金额
    const { data: transactions, error: txError } = await supabase
      .from('user_transactions')
      .select('type, amount, status')
      .eq('user_id', userId)
      .in('type', ['commission', 'commission_withdrawal']);
      
    if (txError) {
      console.error('获取交易记录错误:', txError);
      // 如果交易表不存在，使用代理档案的总佣金
      if (txError.code === '42P01') {
        console.log('user_transactions表不存在，使用代理档案数据');
        const total = agentProfile?.total_commission || 0;
        return {
          available: total,
          pending: 0,
          withdrawn: 0,
          total: total,
          commissionRate: agentProfile?.commission_rate || 0
        };
      }
      throw txError;
    }
    
    let available = 0;
    let withdrawn = 0;
    
    transactions?.forEach(tx => {
      if (tx.type === 'commission' && tx.status === 'completed') {
        available += tx.amount;
      } else if (tx.type === 'commission_withdrawal' && tx.status === 'completed') {
        withdrawn += tx.amount;
        available -= tx.amount;
      }
    });
    
    const total = agentProfile?.total_commission || 0;
    const pending = total - available - withdrawn;
    
    return {
      available: Math.max(0, available),
      pending: Math.max(0, pending),
      withdrawn: Math.max(0, withdrawn),
      total: Math.max(0, total),
      commissionRate: agentProfile?.commission_rate || 0
    };
  } catch (error) {
    console.error('getCommissionStats异常:', error);
    // 返回默认值而不是抛出错误
    return {
      available: 0,
      pending: 0,
      withdrawn: 0,
      total: 0,
      commissionRate: 0
    };
  }
};

// 计算各级佣金
export const calculateLevelCommissions = async (userId: string, commissionRates: { level: number; rate: number }[]) => {
  const teamMembers = await getTeamMembers(userId);
  
  const levelStats = commissionRates.map(rate => {
    // 统计每个级别的成员数和总充值
    let memberCount = 0;
    let totalRecharge = 0;
    
    const countLevel = (members: TeamMember[], targetLevel: number) => {
      members.forEach(member => {
        if (member.level === targetLevel) {
          memberCount++;
          totalRecharge += member.total_recharge || 0;
        }
        if (member.children) {
          countLevel(member.children, targetLevel);
        }
      });
    };
    
    countLevel(teamMembers, rate.level);
    
    return {
      level: rate.level,
      rate: rate.rate,
      memberCount,
      totalCommission: totalRecharge * rate.rate
    };
  });
  
  return levelStats;
};

// 创建或更新代理档案
export const createOrUpdateAgentProfile = async (userId: string, name: string, phone?: string) => {
  try {
    // 直接操作方式创建代理档案
    const { data: existing } = await supabase
      .from('agent_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (existing) {
      // 更新现有记录
      const { data, error } = await supabase
        .from('agent_profiles')
        .update({
          name,
          contact_phone: phone,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) {
        console.error('更新代理档案失败:', error);
        throw error;
      }
      return data;
    } else {
      // 创建新记录
      const { data, error } = await supabase
        .from('agent_profiles')
        .insert({
          user_id: userId,
          name,
          contact_phone: phone,
          commission_rate: 0.1, // 默认10%佣金率
          level: 1,
          is_active: true,
          total_commission: 0
        })
        .select()
        .single();
        
      if (error) {
        console.error('创建代理档案失败:', error);
        throw error;
      }
      return data;
    }
  } catch (error) {
    console.error('创建代理档案异常:', error);
    // 如果表不存在，不抛出错误，只是记录日志
    if (error.code === '42P01') {
      console.log('agent_profiles表不存在，跳过代理档案创建');
      return null;
    }
    throw error;
  }
}; 