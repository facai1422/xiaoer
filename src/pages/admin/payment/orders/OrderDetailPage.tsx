
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OrderStatusHistory } from "@/types/payment";
import { format } from "date-fns";

type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed';

const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: "待处理", color: "bg-yellow-100 text-yellow-800" },
  processing: { label: "处理中", color: "bg-blue-100 text-blue-800" },
  completed: { label: "已完成", color: "bg-green-100 text-green-800" },
  failed: { label: "已失败", color: "bg-red-100 text-red-800" }
};

const OrderDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: order, isLoading: isLoadingOrder } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('channel_orders')
        .select(`
          *,
          payment_channels (
            name,
            code,
            exchange_rate,
            fee_rate
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: statusHistory } = useQuery({
    queryKey: ['order-status-history', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('channel_order_status_history')
        .select('*')
        .eq('order_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  if (isLoadingOrder) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl mb-4">订单不存在</div>
        <Button onClick={() => navigate(-1)}>返回列表</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-semibold">订单详情</h1>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${ORDER_STATUS_MAP[order.status as OrderStatus].color}`}>
          {ORDER_STATUS_MAP[order.status as OrderStatus].label}
        </span>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">订单号</div>
            <div className="font-medium">{order.order_no}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">渠道</div>
            <div className="font-medium">{order.payment_channels.name}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">订单金额</div>
            <div className="font-medium">{order.amount}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">USDT金额</div>
            <div className="font-medium">{order.usdt_amount}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">汇率</div>
            <div className="font-medium">{order.payment_channels.exchange_rate}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">手续费率</div>
            <div className="font-medium">{order.payment_channels.fee_rate}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">创建时间</div>
            <div className="font-medium">{format(new Date(order.created_at), 'yyyy-MM-dd HH:mm:ss')}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">更新时间</div>
            <div className="font-medium">{format(new Date(order.updated_at), 'yyyy-MM-dd HH:mm:ss')}</div>
          </div>
        </div>
      </Card>

      {order.note && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-3">订单备注</h2>
          <p className="text-gray-600">{order.note}</p>
        </Card>
      )}

      {statusHistory && statusHistory.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">状态变更历史</h2>
          <div className="space-y-4">
            {statusHistory.map((history: OrderStatusHistory) => (
              <div key={history.id} className="border-l-2 border-gray-200 pl-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {history.old_status ? (
                        <>
                          {ORDER_STATUS_MAP[history.old_status as OrderStatus].label}
                          {" → "}
                          {ORDER_STATUS_MAP[history.new_status as OrderStatus].label}
                        </>
                      ) : (
                        ORDER_STATUS_MAP[history.new_status as OrderStatus].label
                      )}
                    </div>
                    {history.note && (
                      <div className="text-sm text-gray-500 mt-1">{history.note}</div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(history.created_at), 'yyyy-MM-dd HH:mm:ss')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default OrderDetailPage;
