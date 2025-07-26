import { useState, useEffect } from "react";
import { toast } from "sonner";
import { adminSupabase } from "@/utils/adminSupabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RefreshCw, Eye, Check, X, Search, DollarSign, TrendingDown, Users, Clock } from "lucide-react";

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  payment_method: string;
  payment_account: string;
  payment_name: string;
  fee: number;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_display_name?: string;
}

const WithdrawalPage = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      console.log('🔄 获取提现申请数据...');

      const { data: withdrawalsData, error } = await adminSupabase
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ 获取提现申请失败:', error);
        throw error;
      }

      // 获取用户信息
      const userIds = [...new Set(withdrawalsData?.map(w => w.user_id) || [])];
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await adminSupabase
          .from('user_profiles')
          .select('user_id, email, username, full_name')
          .in('user_id', userIds);

        if (profilesError) {
          console.error('❌ 获取用户资料失败:', profilesError);
        }

        // 合并用户信息到提现数据
        const withdrawalsWithUsers = withdrawalsData?.map(withdrawal => {
          const profile = profilesData?.find(p => p.user_id === withdrawal.user_id);
          return {
            ...withdrawal,
            user_email: profile?.email,
            user_display_name: profile?.full_name || profile?.username,
          };
        }) || [];

        setWithdrawals(withdrawalsWithUsers);
        console.log('✅ 提现申请数据获取成功:', withdrawalsWithUsers.length, '条记录');
      } else {
        setWithdrawals([]);
        console.log('ℹ️  暂无提现申请数据');
      }
    } catch (error) {
      console.error('❌ 获取提现申请失败:', error);
      toast.error('获取提现申请失败');
    } finally {
      setLoading(false);
    }
  };

  const showDetails = async (withdrawal: WithdrawalRequest) => {
    try {
      console.log('🔍 获取用户详情...', { user_id: withdrawal.user_id });
      
      // 获取用户详细信息 - 移除.single()避免"no rows"错误
      const { data: userProfiles, error: profileError } = await adminSupabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', withdrawal.user_id);

      if (profileError) {
        console.error('❌ 查询用户详情失败:', profileError);
        toast.error(`查询用户详情失败: ${profileError.message}`);
        return;
      }

      // 检查是否找到用户资料
      let userProfile = null;
      if (userProfiles && userProfiles.length > 0) {
        userProfile = userProfiles[0];
        console.log('✅ 找到用户资料:', userProfile);
      } else {
        console.log('⚠️ 未找到用户资料，使用默认值');
        // 如果没有找到用户资料，使用默认值
        userProfile = {
          email: '未知邮箱',
          full_name: '未知用户',
          username: '未知用户',
          user_id: withdrawal.user_id
        };
      }

      setSelectedWithdrawal({
        ...withdrawal,
        user_email: userProfile.email || '未知邮箱',
        user_display_name: userProfile.full_name || userProfile.username || '未知用户',
      });
      setShowDetailDialog(true);
    } catch (error) {
      console.error('❌ 获取详细信息异常:', error);
      toast.error('获取详细信息失败');
    }
  };

  const approveWithdrawal = async (id: string, amount: number, userId: string) => {
    if (processingIds.has(id)) return;

    try {
      setProcessingIds(prev => new Set(prev).add(id));
      console.log('🔄 开始批准提现申请...');

      // 检查是否已有处理中的交易记录
      const { data: existingTransaction, error: checkError } = await adminSupabase
        .from('user_transactions')
        .select('*')
        .eq('reference_id', id)
        .eq('type', 'withdraw')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingTransaction) {
        toast.error('该提现申请已处理，请勿重复操作');
        return;
      }

      // 批准提现申请
      const { error: withdrawalError } = await adminSupabase
        .from('withdrawal_requests')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (withdrawalError) {
        console.error('更新提现状态失败:', withdrawalError);
        throw withdrawalError;
      }

      // 创建提现交易记录
      const { error: createTransactionError } = await adminSupabase
        .from('user_transactions')
        .insert({
          user_id: userId,
          type: 'withdraw',
          amount: -Math.abs(amount),
          status: 'completed',
          description: `提现申请批准 - ${amount} USDT`,
          reference_id: id,
          balance: 0
        });

      if (createTransactionError) {
        console.error('创建交易记录失败:', createTransactionError);
        // 回滚提现状态
        await adminSupabase
          .from('withdrawal_requests')
          .update({ status: 'pending' })
          .eq('id', id);
        throw createTransactionError;
      }

      console.log('✅ 提现申请批准成功');
      toast.success('提现申请已批准');
      fetchWithdrawals();
      setShowDetailDialog(false);
    } catch (error) {
      console.error('❌ 批准提现失败:', error);
      toast.error('批准提现失败，请重试');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const rejectWithdrawal = async (id: string) => {
    if (processingIds.has(id)) return;

    try {
      setProcessingIds(prev => new Set(prev).add(id));
      console.log('🔄 开始拒绝提现申请...');

      const { error } = await adminSupabase
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('更新提现状态失败:', error);
        throw error;
      }

      console.log('✅ 提现申请已拒绝');
      toast.success('提现申请已拒绝');
      fetchWithdrawals();
      setShowDetailDialog(false);
    } catch (error) {
      console.error('❌ 拒绝提现失败:', error);
      toast.error('拒绝提现失败，请重试');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const completeWithdrawal = async (id: string, userId: string) => {
    if (processingIds.has(id)) return;

    try {
      setProcessingIds(prev => new Set(prev).add(id));
      console.log('🔄 开始完成提现申请...');

      // 获取用户余额信息
      const { data: userProfile, error: profileError } = await adminSupabase
        .from('user_profiles')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        throw profileError;
      }

      // 更新提现状态为已完成
      const { error: updateError } = await adminSupabase
        .from('withdrawal_requests')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // 更新相关交易记录状态
      const { error: transactionError } = await adminSupabase
        .from('user_transactions')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('reference_id', id)
        .eq('type', 'withdraw');

      if (transactionError) {
        console.error('更新交易记录失败:', transactionError);
        // 这里不抛出错误，因为主要操作已成功
      }

      console.log('✅ 提现申请已完成');
      toast.success('提现申请已完成');
      fetchWithdrawals();
      setShowDetailDialog(false);
    } catch (error) {
      console.error('❌ 完成提现失败:', error);
      toast.error('完成提现失败，请重试');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待审核';
      case 'approved': return '已批准';
      case 'completed': return '已完成';
      case 'rejected': return '已拒绝';
      default: return status;
    }
  };

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = withdrawal.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         withdrawal.user_display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         withdrawal.payment_account?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || withdrawal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter(w => w.status === 'pending').length,
    approved: withdrawals.filter(w => w.status === 'approved').length,
    completed: withdrawals.filter(w => w.status === 'completed').length,
    totalAmount: withdrawals.reduce((sum, w) => sum + w.amount, 0)
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">提现管理</h1>
        <Button onClick={fetchWithdrawals} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总申请数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审核</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已批准</CardTitle>
            <Check className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总金额</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索用户邮箱、昵称或支付账户..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="筛选状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="pending">待审核</SelectItem>
            <SelectItem value="approved">已批准</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="rejected">已拒绝</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 提现申请列表 */}
      <Card>
        <CardHeader>
          <CardTitle>提现申请列表</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredWithdrawals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无提现申请
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{withdrawal.user_display_name || withdrawal.user_email}</span>
                      <Badge className={`${getStatusColor(withdrawal.status)} text-white`}>
                        {getStatusText(withdrawal.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {withdrawal.payment_method} • {withdrawal.payment_account}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      申请时间：{new Date(withdrawal.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-lg font-bold">{withdrawal.amount.toFixed(2)} USDT</div>
                      {withdrawal.fee > 0 && (
                        <div className="text-sm text-muted-foreground">手续费：{withdrawal.fee.toFixed(2)}</div>
                      )}
                    </div>
                    <Button onClick={() => showDetails(withdrawal)} variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      详情
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>提现申请详情</DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">用户信息</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedWithdrawal.user_display_name || selectedWithdrawal.user_email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">提现金额</label>
                  <p className="text-lg font-bold">{selectedWithdrawal.amount.toFixed(2)} USDT</p>
                </div>
                <div>
                  <label className="text-sm font-medium">支付方式</label>
                  <p className="text-sm text-muted-foreground">{selectedWithdrawal.payment_method}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">支付账户</label>
                  <p className="text-sm text-muted-foreground">{selectedWithdrawal.payment_account}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">收款人姓名</label>
                  <p className="text-sm text-muted-foreground">{selectedWithdrawal.payment_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">手续费</label>
                  <p className="text-sm text-muted-foreground">{selectedWithdrawal.fee.toFixed(2)} USDT</p>
                </div>
                <div>
                  <label className="text-sm font-medium">申请时间</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedWithdrawal.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">当前状态</label>
                  <Badge className={`${getStatusColor(selectedWithdrawal.status)} text-white`}>
                    {getStatusText(selectedWithdrawal.status)}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedWithdrawal?.status === 'pending' && (
              <>
                <Button
                  onClick={() => rejectWithdrawal(selectedWithdrawal.id)}
                  variant="destructive"
                  disabled={processingIds.has(selectedWithdrawal.id)}
                >
                  <X className="w-4 h-4 mr-2" />
                  拒绝
                </Button>
                <Button
                  onClick={() => approveWithdrawal(selectedWithdrawal.id, selectedWithdrawal.amount, selectedWithdrawal.user_id)}
                  disabled={processingIds.has(selectedWithdrawal.id)}
                >
                  <Check className="w-4 h-4 mr-2" />
                  批准
                </Button>
              </>
            )}
            {selectedWithdrawal?.status === 'approved' && (
              <Button
                onClick={() => completeWithdrawal(selectedWithdrawal.id, selectedWithdrawal.user_id)}
                disabled={processingIds.has(selectedWithdrawal.id)}
              >
                <Check className="w-4 h-4 mr-2" />
                标记完成
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WithdrawalPage; 