
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Order {
  id: string;
  order_number: string;
  amount: number;
  status: string;
  created_at: string;
  user_name: string;
  phone_number: string;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('recharge_orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error('Error loading orders:', error);
        toast.error("加载订单失败");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.phone_number.includes(searchTerm)
  );

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">订单管理</h1>
      
      <div className="mb-6">
        <Input
          placeholder="搜索订单号、用户名或手机号..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">订单号: {order.order_number}</h3>
                <p className="text-sm text-gray-600">用户: {order.user_name}</p>
                <p className="text-sm text-gray-600">手机: {order.phone_number}</p>
                <p className="text-sm text-gray-600">创建时间: {new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">¥{order.amount}</p>
                <span className={`px-2 py-1 rounded text-xs ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
