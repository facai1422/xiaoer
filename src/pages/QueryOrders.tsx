import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const QueryOrders = () => {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!orderNumber.trim()) {
      toast.error("请输入订单号");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recharge_orders')
        .select('*')
        .eq('order_number', orderNumber.trim());

      if (error) throw error;
      
      setOrders(data || []);
      
      if (!data || data.length === 0) {
        toast.error("未找到相关订单");
      }
    } catch (error) {
      console.error('Error searching orders:', error);
      toast.error("查询失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>

        <h1 className="text-2xl font-bold mb-4">订单查询</h1>

        <div className="flex items-center mb-6">
          <Input
            type="text"
            placeholder="请输入订单号"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="mr-2"
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="mr-2 h-4 w-4" />
            {loading ? "查询中..." : "查询"}
          </Button>
        </div>

        {orders.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">查询结果:</h2>
            {orders.map((order) => (
              <Card key={order.id} className="mb-4 p-4">
                <h3 className="font-semibold">订单号: {order.order_number}</h3>
                <p>金额: ¥{order.amount}</p>
                <p>状态: {order.status}</p>
                <p>创建时间: {new Date(order.created_at).toLocaleString()}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryOrders;
