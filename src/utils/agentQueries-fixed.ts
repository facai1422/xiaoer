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
  const { data, error } = await supabase
    .from('agent_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
    
  if (error) throw error;
  return data;
};

// 获取用户的推荐信息
export const getUserReferralInfo = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('invite_code, referrer_id, referral_count')
    .eq('id', userId)
    .maybeSingle();
    
  if (error) throw error;
  return data;
};

// 获取团队成员（直推）
export const getDirectReferrals = async (userId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('users')
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
    
  if (error) throw error;
  return data || [];
};

// 获取多级团队成员
export const getTeamMembers = async (userId: string, maxLevel: number = 10): Promise<TeamMember[]> => {
  // 递归获取团队成员
  const getTeamRecursive = async (referrerId: string, currentLevel: number): Promise<any[]> => {
    if (currentLevel > maxLevel) return [];
    
    const { data: members, error } = await supabase
      .from('users')
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
      
    if (error || !members) return [];
    
    // 为每个成员添加级别信息并递归获取其下级
    const membersWithLevel = await Promise.all(
      members.map(async (member: any) => {
        const children = await getTeamRecursive(member.id, currentLevel + 1);
        return {
          ...member,
          level: currentLevel,
          children: children.length > 0 ? children : undefined
        };
      })
    );
    
    return membersWithLevel;
  };
  
  return getTeamRecursive(userId, 1);
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
  const { data: agentProfile, error } = await supabase
    .from('agent_profiles')
    .select('total_commission, commission_rate')
    .eq('user_id', userId)
    .maybeSingle();
    
  if (error) throw error;
  
  // 获取用户交易记录来计算可提现和已提现金额
  const { data: transactions, error: txError } = await supabase
    .from('user_transactions')
    .select('type, amount, status')
    .eq('user_id', userId)
    .in('type', ['commission', 'commission_withdrawal']);
    
  if (txError) throw txError;
  
  let available = 0;
  let withdrawn = 0;
  
  transactions?.forEach((tx: any) => {
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
      
    if (error) throw error;
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
      
    if (error) throw error;
    return data;
  }
}; 