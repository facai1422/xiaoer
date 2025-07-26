
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/merchant/orders/Header";
import { MerchantStatus } from "@/components/merchant/orders/MerchantStatus";
import { SearchAndFilter } from "@/components/merchant/orders/SearchAndFilter";
import { OrderList } from "@/components/merchant/orders/OrderList";

// Define the Order interface that matches what OrderList expects
export interface Order {
  id: string;
  order_number: string;
  amount: number;
  phone_number: string;
  status: string;
  created_at: string;
  payment_channel: string;
  type: string; // Add this property to satisfy the type requirements
}

const OnlineOrders = () => {
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const navigate = useNavigate();

  // 初始化获取商家在线状态
  useEffect(() => {
    const fetchMerchantStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("请先登录");
          navigate("/login");
          return;
        }

        const { data, error } = await supabase
          .from('user_profiles')
          .select('online_status')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching merchant status:', error);
          return;
        }

        console.log("Merchant status:", data?.online_status);
        // Use nullish coalescing operator to provide a default value
        setIsOnline(data?.online_status ?? false);
      } catch (error) {
        console.error('Error in fetchMerchantStatus:', error);
      }
    };

    fetchMerchantStatus();
  }, [navigate]);

  // 获取订单数据 - 使用正确的表名
  const { data: rechargeOrders = [], isError, isLoading } = useQuery({
    queryKey: ['recharge-orders'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('recharge_orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    retry: 1,
  });

  const handleStatusChange = async (value: boolean) => {
    setIsOnline(value);
    const { error } = await supabase.rpc('update_online_status', {
      p_online: value
    });
    
    if (error) {
      console.error('Error updating online status:', error);
      toast.error('更新状态失败');
      return;
    }
    
    toast.success(value ? '已开启接单' : '已暂停接单');
  };

  // Transform the rechargeOrders to match the Order interface
  const orders: Order[] = rechargeOrders.map(order => ({
    id: order.id,
    order_number: order.order_number || '',
    amount: order.amount,
    phone_number: order.phone_number || '',
    status: order.status,
    created_at: order.created_at,
    payment_channel: order.payment_channel || '',
    type: order.payment_method || '充值' // Add the type property
  }));

  const filteredOrders = orders.filter(order => {
    if (selectedStatus !== "all" && order.status !== selectedStatus) return false;
    if (searchQuery) {
      return order.phone_number.includes(searchQuery) || 
             order.id.includes(searchQuery);
    }
    return true;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  if (isError) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">加载失败，请刷新重试</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10">
        <MerchantStatus 
          isOnline={isOnline}
          onStatusChange={handleStatusChange}
        />
        <SearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
      </div>

      <div className="p-4">
        <OrderList orders={filteredOrders} />
      </div>
    </div>
  );
};

export default OnlineOrders;
