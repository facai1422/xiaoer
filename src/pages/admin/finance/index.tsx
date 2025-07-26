
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { adminSupabase } from "@/utils/adminSupabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const AdminFinance = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  // 简化：只查询用户交易记录
  const { data: transactions, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'transactions', refreshKey],
    queryFn: async () => {
      console.log('🔄 获取财务交易数据...');
      try {
        const { data, error } = await adminSupabase
          .from('user_transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (error) {
          console.error('❌ 获取交易数据失败:', error);
          throw new Error(`数据库查询失败: ${error.message}`);
        }
        
        console.log('✅ 交易数据获取成功:', data?.length || 0, '条记录');
        return data || [];
      } catch (err) {
        console.error('❌ 查询异常:', err);
        throw err;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000, // 30秒内不重新获取
  });

  const handleRefresh = () => {
    console.log('🔄 手动刷新数据...');
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  const formatAmount = (amount: string | number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'completed': { label: '已完成', variant: 'default' as const },
      'pending': { label: '待处理', variant: 'secondary' as const },
      'failed': { label: '失败', variant: 'destructive' as const },
      'confirmed': { label: '已确认', variant: 'default' as const },
      'rejected': { label: '已拒绝', variant: 'destructive' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  // 错误状态
  if (error) {
    console.error('❌ 财务管理页面错误:', error);
    return (
      <div className="space-y-6 p-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <h2 className="text-lg font-medium">财务管理 - 连接错误</h2>
          </div>
          <div className="text-red-600 mb-4">
            无法连接到数据库: {error instanceof Error ? error.message : '未知错误'}
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            重试连接
          </Button>
        </Card>
      </div>
    );
  }

  // 加载状态
  if (isLoading) {
    console.log('⏳ 财务管理页面加载中...');
    return (
      <div className="space-y-6 p-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5" />
            <h2 className="text-lg font-medium">财务管理</h2>
          </div>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>正在加载财务数据...</span>
          </div>
        </Card>
      </div>
    );
  }

  console.log('✅ 财务管理页面渲染，交易记录数量:', transactions?.length || 0);

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题和刷新按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          <h1 className="text-2xl font-bold">财务管理</h1>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新数据
        </Button>
      </div>

      {/* 数据统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">总交易数</p>
              <p className="text-2xl font-bold">{transactions?.length || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">收入交易</p>
              <p className="text-2xl font-bold text-green-600">
                {transactions?.filter(t => Number(t.amount) > 0).length || 0}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">支出交易</p>
              <p className="text-2xl font-bold text-red-600">
                {transactions?.filter(t => Number(t.amount) < 0).length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 用户交易记录 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <h2 className="text-lg font-medium">用户交易记录</h2>
          </div>
          <div className="text-sm text-gray-500">
            共 {transactions?.length || 0} 条记录
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>交易ID</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>创建时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions && transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">
                      {transaction.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.type}</Badge>
                    </TableCell>
                    <TableCell className={Number(transaction.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatAmount(transaction.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell className="max-w-xs truncate" title={transaction.description}>
                      {transaction.description || '无描述'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(transaction.created_at).toLocaleString('zh-CN')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    暂无交易记录
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* 快速操作 */}
      <Card className="p-6">
        <h2 className="text-lg font-medium mb-4">快速操作</h2>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.location.href = '/admin/finance/recharge'}>
            充值管理
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/admin/finance/withdrawal'}>
            提现管理
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/admin/finance/report'}>
            财务报表
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminFinance;
