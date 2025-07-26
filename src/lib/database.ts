import { createClient } from '@supabase/supabase-js';

// 获取Supabase配置
const supabaseUrl = 'https://wjvuuckoasdukmnbrzxk.supabase.co';
const supabaseAnonKey = 'sb_publishable_hjn8uDvuadUNMrM1jg5HHQ_37sGt-pr';

// 管理员操作使用service key（如果可用）
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// 创建普通客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 创建管理员客户端（使用service key）
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

// 管理后台数据服务
export class AdminDataService {
  
  // 私有静态属性用于缓存supabase实例
  private static supabase = supabase

  // 检测当前使用的权限级别
  static async checkPermissionLevel() {
    try {
      console.log('🔐 检测权限级别...');
      
      // 检测service_role权限
      const hasServiceRole = supabaseServiceKey !== supabaseAnonKey;
      console.log('📋 Service Role可用:', hasServiceRole);
      
      if (hasServiceRole) {
        console.log('✅ 使用Service Role权限，可执行管理员操作');
        return { 
          hasServiceRole: true,
          canDelete: true,
          message: '拥有完整管理员权限' 
        };
      } else {
        console.log('⚠️ 使用匿名权限，可能受RLS策略限制');
        return { 
          hasServiceRole: false,
          canDelete: false,
          message: '权限受限，删除操作可能失败' 
        };
      }
    } catch (error) {
      console.error('❌ 权限检测失败:', error);
      return { 
        hasServiceRole: false,
        canDelete: false,
        message: '权限检测异常' 
      };
    }
  }

  // 获取所有用户资料数据（从user_profiles表）
  static async getAllUserProfiles() {
    try {
      const { data: profiles, error } = await adminSupabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data: profiles || [], error: null }
    } catch (error) {
      console.error('获取用户资料失败:', error)
      return { data: [], error }
    }
  }
  
  // 获取所有用户数据
  static async getAllUsers() {
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          *,
          user_profiles(
            full_name,
            phone,
            avatar_url,
            usdt_address,
            superior_email
          )
        `)
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // 获取用户余额
      const { data: balances, error: balanceError } = await supabase
        .from('user_balances')
        .select('user_id, balance')

      if (balanceError) {
        console.warn('获取余额数据失败:', balanceError)
      }

      // 合并用户数据和余额数据
      const usersWithBalance = users?.map(user => {
        const userBalance = balances?.find(b => b.user_id === user.id)
        const profile = user.user_profiles?.[0] || {}
        
        return {
          id: user.id,
          email: user.email,
          username: profile.full_name || user.email?.split('@')[0] || '未知用户',
          full_name: profile.full_name,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          usdt_address: profile.usdt_address,
          superior_email: profile.superior_email,
          balance: userBalance?.balance || 0,
          status: 'active', // 默认状态，可以根据实际需求调整
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      }) || []

      return { data: usersWithBalance, error: null }
    } catch (error) {
      console.error('获取用户数据失败:', error)
      return { data: [], error }
    }
  }

  // 获取用户统计数据
  static async getUserStats() {
    try {
      const { data: users } = await this.getAllUserProfiles()
      
      const totalUsers = users.length
      const activeUsers = users.filter(u => u.status === 'active').length
      const frozenUsers = users.filter(u => u.status === 'frozen').length
             const totalBalance = users.reduce((sum: number, u) => sum + (u.balance || 0), 0)

      return {
        totalUsers,
        activeUsers,
        frozenUsers,
        totalBalance
      }
    } catch (error) {
      console.error('获取用户统计失败:', error)
      return {
        totalUsers: 0,
        activeUsers: 0,
        frozenUsers: 0,
        totalBalance: 0
      }
    }
  }

  // 更新用户余额
  static async updateUserBalance(userId: string, amount: number, type: 'add' | 'subtract', description: string) {
    try {
      // 获取当前余额
      const { data: currentBalance } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', userId)
        .single()

      const current = currentBalance?.balance || 0
      const newBalance = type === 'add' ? current + amount : current - amount

      if (newBalance < 0) {
        return { success: false, error: '余额不足' }
      }

      // 更新余额
      const { error: updateError } = await supabase
        .from('user_balances')
        .upsert({
          user_id: userId,
          balance: newBalance,
          updated_at: new Date().toISOString()
        })

      if (updateError) throw updateError

      // 记录余额变动日志
      await supabase
        .from('balance_logs')
        .insert({
          user_id: userId,
          amount: type === 'add' ? amount : -amount,
          balance_before: current,
          balance_after: newBalance,
          type: type === 'add' ? 'admin_add' : 'admin_subtract',
          description: description || `管理员${type === 'add' ? '增加' : '减少'}余额`,
          created_at: new Date().toISOString()
        })

      return { success: true, newBalance }
    } catch (error) {
      console.error('更新用户余额失败:', error)
      return { success: false, error: error instanceof Error ? error.message : '未知错误' }
    }
  }

  // 切换用户状态
  static async toggleUserStatus(userId: string, freeze: boolean) {
    try {
      const newStatus = freeze ? 'frozen' : 'active'
      
      // 修复：使用 id 字段查询而不是 user_id
      // 因为传入的 userId 实际上是 user_profiles 表的主键 id
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('切换用户状态失败:', error)
      return { success: false, error: error instanceof Error ? error.message : '未知错误' }
    }
  }

  // 删除用户 - 优化版本（利用级联删除）
  static async deleteUser(userId: string) {
    try {
      console.log('🗑️ 开始删除用户:', userId);
      
      // 由于已修复外键约束并配置了级联删除，
      // 只需直接删除用户档案，相关数据会自动级联删除
      const { error: deleteProfileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (deleteProfileError) {
        console.error('❌ 删除用户失败:', deleteProfileError);
        return { success: false, error: deleteProfileError.message };
      }

      console.log('✅ 用户删除成功，所有相关数据已级联删除');
      return { success: true };
    } catch (error) {
      console.error('❌ 删除用户异常:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知错误' };
    }
  }

  // 更新用户密码
  static async updateUserPasswords(userId: string, loginPassword?: string, tradePassword?: string) {
    try {
      const updates: Record<string, string> = {}
      
      if (loginPassword) {
        // 这里应该使用适当的密码加密
        updates.password_hash = loginPassword // 实际应用中需要加密
      }
      
      if (tradePassword) {
        updates.trade_password_hash = tradePassword // 实际应用中需要加密
      }

      if (Object.keys(updates).length === 0) {
        return { success: false, error: '没有要更新的密码' }
      }

      updates.updated_at = new Date().toISOString()

      // 修复：使用id字段而不是user_id，保持与其他方法一致
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('更新用户密码失败:', error)
      return { success: false, error: error instanceof Error ? error.message : '未知错误' }
    }
  }

  // 获取业务产品数据
  static async getBusinessProducts() {
    try {
      const { data, error } = await supabase
        .from('business_products')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error('获取业务产品失败:', error)
      return { data: [], error }
    }
  }

  // 获取客服会话数据
  static async getCustomerServiceSessions() {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          *,
          customers(
            name,
            email,
            phone,
            vip_level
          ),
          customer_service_agents(
            agent_name,
            agent_code
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error('获取客服会话失败:', error)
      return { data: [], error }
    }
  }

  // 获取客服消息数据
  static async getCustomerServiceMessages(sessionId?: string) {
    try {
      let query = supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })

      if (sessionId) {
        query = query.eq('session_id', sessionId)
      }

      const { data, error } = await query

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error('获取客服消息失败:', error)
      return { data: [], error }
    }
  }

  // 创建客服代理
  static async createCustomerServiceAgent(agentData: {
    agent_name: string
    agent_code: string
    email: string
    department?: string
    user_id?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('customer_service_agents')
        .insert({
          ...agentData,
          status: 'offline',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('创建客服代理失败:', error)
      return { data: null, error }
    }
  }

  // 测试数据库连接
  static async testConnection() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (error) throw error

      return { success: true, message: '数据库连接正常' }
    } catch (error) {
      console.error('数据库连接测试失败:', error)
      return { success: false, message: error instanceof Error ? error.message : '连接失败' }
    }
  }

  // 测试用户状态更新（调试用）
  static async testUserStatusUpdate(userId: string) {
    try {
      console.log('🧪 测试用户状态更新，用户ID:', userId);
      
      // 首先获取当前用户信息
      const { data: currentUser, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (fetchError) {
        console.error('❌ 获取用户信息失败:', fetchError);
        return { success: false, error: fetchError.message }
      }

      console.log('📋 当前用户信息:', currentUser);

      // 测试状态更新
      const newStatus = currentUser.status === 'active' ? 'frozen' : 'active';
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        console.error('❌ 状态更新失败:', updateError);
        return { success: false, error: updateError.message }
      }

      // 验证更新结果
      const { data: updatedUser, error: verifyError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (verifyError) {
        console.error('❌ 验证更新失败:', verifyError);
        return { success: false, error: verifyError.message }
      }

      console.log('✅ 更新后用户信息:', updatedUser);
      
      return { 
        success: true, 
        before: currentUser.status, 
        after: updatedUser.status,
        message: `状态从 ${currentUser.status} 更新为 ${updatedUser.status}`
      }
    } catch (error) {
      console.error('❌ 测试用户状态更新异常:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知错误' }
    }
  }

  // 调试用：检查用户数据结构
  static async debugUserData(userId: string) {
    try {
      console.log('🔍 开始检查用户数据结构，用户ID:', userId);
      
      // 检查user_profiles表中的数据
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('📋 user_profiles数据:', {
        data: profileData,
        error: profileError
      });

      if (profileData) {
        // 检查关联的users表数据
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', profileData.user_id)
          .maybeSingle()

        console.log('👤 users表数据:', {
          data: userData,
          error: userError
        });

        // 检查user_balances表数据
        const { data: balanceData, error: balanceError } = await supabase
          .from('user_balances')
          .select('*')
          .eq('user_id', profileData.user_id)
          .maybeSingle()

        console.log('💰 user_balances数据:', {
          data: balanceData,
          error: balanceError
        });

        // 检查balance_logs表数据
        const { data: logsData, error: logsError } = await supabase
          .from('balance_logs')
          .select('*')
          .eq('user_id', profileData.user_id)
          .limit(5)

        console.log('📊 balance_logs数据:', {
          data: logsData,
          error: logsError
        });
      }

      return { success: true }
    } catch (error) {
      console.error('❌ 检查用户数据失败:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知错误' }
    }
  }

  // 安全删除用户（仅删除user_profiles记录）
  static async safeDeleteUser(userId: string) {
    try {
      console.log('🛡️ 开始安全删除用户（使用管理员权限）:', userId);
      
      // 首先检查用户是否存在
      const { data: existingUser, error: checkError } = await adminSupabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (checkError) {
        console.error('❌ 用户不存在:', checkError);
        return { success: false, error: '用户不存在' }
      }

      console.log('📋 找到用户:', existingUser);

      // 使用管理员权限删除user_profiles记录
      const { error: deleteError } = await adminSupabase
        .from('user_profiles')
        .delete()
        .eq('id', userId)

      if (deleteError) {
        console.error('❌ 删除user_profiles失败:', deleteError);
        return { success: false, error: deleteError.message }
      }

      // 验证删除结果
      const { data: verifyUser, error: verifyError } = await adminSupabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      console.log('✅ 删除验证结果:', {
        data: verifyUser,
        error: verifyError
      });

      if (!verifyUser) {
        console.log('✅ 用户已成功从user_profiles表删除');
        return { success: true }
      } else {
        console.error('❌ 用户仍然存在于user_profiles表');
        return { success: false, error: '删除操作未生效' }
      }
    } catch (error) {
      console.error('❌ 安全删除用户异常:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知错误' }
    }
  }

  // 强力调试删除（包含删除前后对比）
  static async debugDeleteUser(userId: string) {
    try {
      console.log('🚀 开始强力调试删除用户（使用管理员权限）:', userId);
      
      // 1. 删除前检查
      console.log('📋 ========== 删除前状态 ==========');
      const { data: beforeProfile, error: beforeError } = await adminSupabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      console.log('删除前user_profiles:', { data: beforeProfile, error: beforeError });
      
      if (!beforeProfile) {
        console.log('❌ 用户不存在，无法删除');
        return { success: false, error: '用户不存在' };
      }
      
      // 2. 检查总用户数
      const { count: beforeCount } = await adminSupabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      console.log('删除前总用户数:', beforeCount);
      
      // 3. 执行删除（使用管理员权限）
      console.log('🗑️ ========== 执行删除操作（管理员权限）==========');
      const { error: deleteError } = await adminSupabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);
      
      console.log('删除操作结果:', { error: deleteError });
      
      if (deleteError) {
        console.error('❌ 删除失败:', deleteError);
        return { success: false, error: deleteError.message };
      }
      
      // 4. 删除后检查
      console.log('✅ ========== 删除后状态 ==========');
      
      // 验证用户是否被删除
      const { data: afterProfile, error: afterError } = await adminSupabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      console.log('删除后user_profiles:', { data: afterProfile, error: afterError });
      
      // 检查删除后总用户数
      const { count: afterCount } = await adminSupabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      console.log('删除后总用户数:', afterCount);
      console.log('用户数变化:', beforeCount, '->', afterCount, '(差值:', (beforeCount || 0) - (afterCount || 0), ')');
      
      // 5. 获取最新用户列表（前5个）
      const { data: latestUsers } = await adminSupabase
        .from('user_profiles')
        .select('id, username, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      console.log('最新用户列表:', latestUsers);
      
      // 6. 验证删除是否成功
      if (!afterProfile && afterError?.code === 'PGRST116') {
        console.log('✅ 用户已成功删除');
        return { 
          success: true, 
          beforeCount, 
          afterCount,
          message: `用户删除成功，用户数从 ${beforeCount} 减少到 ${afterCount}` 
        };
      } else if (afterProfile) {
        console.error('❌ 删除失败：用户仍然存在');
        return { success: false, error: '删除操作未生效，用户仍然存在' };
      } else {
        console.log('✅ 用户删除成功（通过查询验证）');
        return { 
          success: true, 
          beforeCount, 
          afterCount,
          message: `用户删除成功，用户数从 ${beforeCount} 减少到 ${afterCount}` 
        };
      }
      
    } catch (error) {
      console.error('❌ 强力调试删除异常:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知错误' };
    }
  }

  // 简单测试删除（使用普通权限测试RLS策略）
  static async simpleTestDelete(userId: string) {
    try {
      console.log('🧪 开始简单测试删除（使用普通权限）:', userId);
      
      // 删除前检查
      const { data: before, error: beforeError } = await supabase
        .from('user_profiles')
        .select('id, username, email')
        .eq('id', userId)
        .maybeSingle();
      
      console.log('删除前用户信息:', { data: before, error: beforeError });
      
      if (!before) {
        return { success: false, error: '用户不存在' };
      }
      
      // 执行删除（使用普通权限测试RLS策略）
      console.log('🗑️ 执行删除操作（普通权限）...');
      const { error: deleteError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);
      
      console.log('删除操作结果:', { error: deleteError });
      
      if (deleteError) {
        console.error('❌ 删除失败:', deleteError);
        return { success: false, error: deleteError.message };
      }
      
      // 删除后验证
      const { data: after, error: afterError } = await supabase
        .from('user_profiles')
        .select('id, username, email')
        .eq('id', userId)
        .maybeSingle();
      
      console.log('删除后用户信息:', { data: after, error: afterError });
      
      if (!after) {
        console.log('✅ 用户删除成功！');
        return { success: true };
      } else {
        console.error('❌ 删除失败：用户仍然存在');
        return { success: false, error: '删除操作未生效' };
      }
      
    } catch (error) {
      console.error('❌ 简单测试删除异常:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知错误' }
    }
  }
}

// 导出默认实例
export default AdminDataService 