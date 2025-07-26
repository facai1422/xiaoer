
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const TransactionOrders = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { data: transactionsData, isLoading, refetch } = useQuery({
    queryKey: ['withdrawal-requests', 'user'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      console.log('🔍 查询提现记录，用户ID:', session.user.id);
      console.log('🕒 查询时间:', new Date().toISOString());

      // 查询提现申请记录
      const { data, error, count } = await supabase
        .from('withdrawal_requests')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ 查询提现记录失败:', error);
        throw error;
      }

      console.log('✅ 查询提现记录成功，数量:', data?.length || 0);
      console.log('📊 提现记录详情:', data);
      return { transactions: data || [], totalCount: count || 0 };
    },
    refetchOnMount: 'always', // Always refetch when the component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
    staleTime: 0 // Consider data immediately stale
  });

  const transactions = transactionsData?.transactions || [];
  const totalCount = transactionsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  
  // Get paginated transactions
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // 获取交易类型的中文显示
  const getTransactionTypeDisplay = (type: string) => {
    switch (type.toLowerCase()) {
      case 'recharge':
      case 'usdt充值':
      case 'deposit':
        return '充值';
      case 'withdraw':
      case 'withdrawal':
        return '提现';
      case 'refund':
        return '退款';
      case 'commission':
        return '佣金';
      case 'bonus':
        return '奖金';
      case 'transfer':
        return '转账';
      case 'fee':
        return '手续费';
      default:
        return '其他';
    }
  };

  const getTransactionTypeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case 'recharge':
      case 'usdt充值':
      case 'deposit':
      case 'refund':
      case 'commission':
      case 'bonus':
        return 'text-green-500';
      case 'withdraw':
      case 'withdrawal':
      case 'fee':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // 获取提现状态的中文显示
  const getTransactionStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '已完成';
      case 'approved':
        return '已批准';
      case 'pending':
        return '处理中';
      case 'failed':
        return '失败';
      case 'rejected':
        return '已拒绝';
      case 'cancelled':
        return '已取消';
      default:
        return '未知';
    }
  };

  const getTransactionStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取交易描述的用户友好显示
  const getTransactionDescription = (transaction: { type: string; description?: string | null }) => {
    const { type, description } = transaction;
    
    // 如果是提现相关的描述，进行优化
    if (type === 'withdrawal' || type === 'withdraw') {
      if (description?.includes('提现到')) {
        return '提现申请';
      } else if (description?.includes('提现申请')) {
        return '提现申请';
      } else if (description?.includes('批准')) {
        return '提现成功';
      } else {
        return '提现申请';
      }
    }
    
    // 其他类型的描述保持原样，但去掉技术性词汇
    if (description) {
      return description
        .replace(/- withdrawal/g, '')
        .replace(/- withdraw/g, '')
        .replace(/提现申请 - /g, '')
        .trim();
    }
    
    return getTransactionTypeDisplay(type);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 flex items-center border-b">
        <Button 
          variant="ghost" 
          className="p-0 mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold flex-1 text-center">提现记录</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="ml-2"
          title="刷新"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-8">加载中...</div>
        ) : !paginatedTransactions || paginatedTransactions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            暂无提现记录
          </div>
        ) : (
          <>
            {paginatedTransactions.map((transaction) => (
              <Card key={transaction.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">提现申请</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-red-600">
                    -{transaction.amount}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">
                    手续费: {transaction.fee || 0}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getTransactionStatusStyle(transaction.status)}`}>
                    {getTransactionStatusDisplay(transaction.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2 border-t pt-2">
                  {transaction.payment_method} {transaction.payment_name ? `(${transaction.payment_name})` : ''}
                </p>
              </Card>
            ))}

            {totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(currentPage - 1);
                        }} 
                      />
                    </PaginationItem>
                  )}
                  
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink 
                          href="#" 
                          isActive={pageNumber === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNumber);
                          }}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(currentPage + 1);
                        }} 
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default TransactionOrders;
