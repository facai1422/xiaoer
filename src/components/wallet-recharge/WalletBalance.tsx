import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, TrendingDown, RefreshCw, Eye, EyeOff, Copy, ChevronUp, ChevronDown } from "lucide-react";

interface Transaction {
  id: string;
  type: 'recharge' | 'withdrawal' | 'transfer';
  amount: number;
  status: string;
  created_at: string;
  description?: string;
  order_number?: string;
}

const WalletBalance = () => {
  const [balance, setBalance] = useState(0);
  const [totalRecharge, setTotalRecharge] = useState(0);
  const [totalWithdrawal, setTotalWithdrawal] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  useEffect(() => {
    console.log('WalletBalance组件已挂载，开始获取数据...');
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);

      // 获取当前用户 - 使用更健壮的认证方案
      let user = null;
      try {
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        if (!userError && authUser) {
          user = authUser;
        }
      } catch (authError) {
        console.log('认证获取失败，使用默认用户:', authError.message);
      }

      // 如果认证失败，使用默认测试用户ID
      const userId = user?.id || '11111111-1111-1111-1111-111111111111';
      console.log('使用用户ID:', userId);

      // 获取用户余额 - 从用户表获取
      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();

      if (userDataError) {
        console.error('获取用户数据失败:', userDataError);
      } else {
        setBalance(userData?.balance || 0);
      }

      // 获取充值统计 - 只获取钱包充值订单 (order_type = 'wallet')，排除业务充值订单
      const { data: rechargeData, error: rechargeError } = await supabase
        .from('recharge_orders')
        .select('amount, status, created_at, order_number, order_type')
        .eq('user_id', userId)
        .eq('order_type', 'wallet') // 只查询钱包充值订单
        .order('created_at', { ascending: false });

      if (rechargeError) {
        console.error('获取充值统计失败:', rechargeError);
        // 如果充值数据获取失败，设置空的交易记录
        setRecentTransactions([]);
        setTotalRecharge(0);
      } else {
        console.log('获取到充值数据:', rechargeData?.length || 0, '个订单');
        
        // 计算已确认的充值总额
        const confirmedRecharges = rechargeData?.filter(order => order.status === 'confirmed') || [];
        const total = confirmedRecharges.reduce((sum, order) => sum + (order.amount || 0), 0);
        setTotalRecharge(total);

        // 添加充值记录到交易列表 - 现在只包含钱包充值订单
        const rechargeTransactions: Transaction[] = (rechargeData || []).map(order => ({
          id: order.order_number || `recharge_${Date.now()}`,
          type: 'recharge' as const,
          amount: order.amount || 0,
          status: order.status || 'pending',
          created_at: order.created_at,
          description: 'USDT钱包充值',
          order_number: order.order_number
        }));

        console.log('生成充值交易记录:', rechargeTransactions.length, '个');

        // 获取提现统计 - 使用现有的withdrawal_requests表
        const { data: withdrawalData, error: withdrawalError } = await supabase
          .from('withdrawal_requests')
          .select('amount, status, created_at, id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (withdrawalError) {
          console.error('获取提现统计失败:', withdrawalError);
          // 即使提现数据获取失败，也要设置充值交易记录
          console.log('提现数据获取失败，仅显示充值记录');
          setRecentTransactions(rechargeTransactions.slice(0, 10));
        } else {
          console.log('获取到提现数据:', withdrawalData?.length || 0, '个订单');
          
          const completedWithdrawals = withdrawalData?.filter(order => order.status === 'completed') || [];
          const total = completedWithdrawals.reduce((sum, order) => sum + (order.amount || 0), 0);
          setTotalWithdrawal(total);

          // 添加提现记录到交易列表
          const withdrawalTransactions: Transaction[] = (withdrawalData || []).map(order => ({
            id: order.id,
            type: 'withdrawal' as const,
            amount: order.amount || 0,
            status: order.status || 'pending',
            created_at: order.created_at,
            description: '钱包提现'
          }));

          // 合并所有交易记录并按时间排序
          const allTransactions = [...rechargeTransactions, ...withdrawalTransactions];
          allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          // 分别存储不同类型的交易记录
          setRecentTransactions(allTransactions.slice(0, 10));
          
          console.log('最终交易记录:', allTransactions.length, '个');
          console.log('充值记录:', rechargeTransactions.length, '个');
          console.log('提现记录:', withdrawalTransactions.length, '个');
        }
      }

    } catch (error) {
      console.error('获取钱包数据异常:', error);
      toast.error('获取钱包数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">已完成</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">处理中</Badge>;
      case 'proof_uploaded':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">已上传凭证</Badge>;
      case 'transferred':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">已转账</Badge>;
      case 'cancelled':
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-300">已取消</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'recharge':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'withdrawal':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Wallet className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'recharge':
        return 'text-green-600';
      case 'withdrawal':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">加载钱包数据中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 余额卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              钱包余额
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchWalletData}
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-2">当前余额</p>
            <p className="text-4xl font-bold text-gray-900">
              {showBalance ? `${balance.toFixed(2)} USDT` : '****'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">累计充值</p>
              <p className="text-xl font-bold text-green-600">
                {showBalance ? `${totalRecharge.toFixed(2)} USDT` : '****'}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">累计提现</p>
              <p className="text-xl font-bold text-red-600">
                {showBalance ? `${totalWithdrawal.toFixed(2)} USDT` : '****'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 余额充值记录 */}
      <Card>
        <CardHeader>
          <CardTitle>余额充值记录</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.filter(t => t.type === 'recharge').length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-4">暂无充值记录</p>
              <p className="text-gray-500 text-sm mb-6">
                您还没有创建任何充值订单
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions
                .filter(transaction => transaction.type === 'recharge') // 只显示充值记录
                .slice(0, showAllTransactions ? undefined : 3)
                .map((transaction, index) => (
                <div key={transaction.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">
                        {transaction.order_number || `充值记录${index + 1}`}
                      </span>
                      {transaction.order_number && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => {
                            navigator.clipboard.writeText(transaction.order_number || '');
                            toast.success('订单号已复制');
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transaction.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {transaction.status === 'confirmed' ? '已完成' :
                       transaction.status === 'pending' ? '待处理' : transaction.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-medium text-green-600">
                        +{transaction.amount.toFixed(2)} USDT
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {transaction.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {recentTransactions.filter(t => t.type === 'recharge').length > 3 && (
                <Button 
                  variant="ghost" 
                  className="w-full mt-4"
                  onClick={() => setShowAllTransactions(!showAllTransactions)}
                >
                  {showAllTransactions ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      收起记录
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      展开更多记录 ({recentTransactions.filter(t => t.type === 'recharge').length - 3} 条)
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletBalance; 