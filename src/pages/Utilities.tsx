import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Phone, Zap, Car, CreditCard, Smartphone, Gamepad2, Building, Fuel } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UtilityService {
  id: string;
  name: string;
  icon: string;
  description: string;
  path: string;
}

const Utilities = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [recentOrders, setRecentOrders] = useState([]);

  const services: UtilityService[] = [
    {
      id: "phone-recharge",
      name: "话费充值",
      icon: "phone",
      description: "快速充值手机话费",
      path: "/mobile-recharge"
    },
    {
      id: "electricity-bill",
      name: "电费缴纳",
      icon: "zap",
      description: "在线缴纳电费",
      path: "/recharge"
    },
    {
      id: "oil-card-recharge",
      name: "加油卡充值",
      icon: "fuel",
      description: "在线充值加油卡",
      path: "/oil-card"
    },
    {
      id: "gas-fee",
      name: "燃气费缴纳",
      icon: "building",
      description: "在线缴纳燃气费",
      path: "/gas-fee"
    },
    {
      id: "credit-card-repayment",
      name: "信用卡还款",
      icon: "credit-card",
      description: "信用卡在线还款",
      path: "/credit-card"
    },
    {
      id: "huabei-repayment",
      name: "花呗还款",
      icon: "smartphone",
      description: "花呗在线还款",
      path: "/huabei-repayment"
    },
    {
      id: "douyin-coin-recharge",
      name: "抖音币充值",
      icon: "gamepad2",
      description: "抖音币在线充值",
      path: "/douyin-coin"
    },
    {
      id: "kuaishou-coin-recharge",
      name: "快手币充值",
      icon: "gamepad2",
      description: "快手币在线充值",
      path: "/kuaishou-coin"
    },
  ];

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('recharge_orders')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setRecentOrders(data || []);
      } catch (error) {
        console.error('Error fetching recent orders:', error);
      }
    };

    fetchRecentOrders();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" className="bg-transparent hover:bg-gray-100 p-0 h-auto w-auto" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <h1 className="text-2xl font-bold ml-4">生活服务</h1>
        </div>

        <Input
          type="text"
          placeholder="搜索服务"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredServices.map((service) => (
            <Card key={service.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => navigate(service.path)}>
              <div className="flex flex-col items-center justify-center space-y-2">
                {service.icon === "phone" && <Phone className="h-6 w-6 text-blue-500" />}
                {service.icon === "zap" && <Zap className="h-6 w-6 text-yellow-500" />}
                {service.icon === "car" && <Car className="h-6 w-6 text-gray-500" />}
                {service.icon === "credit-card" && <CreditCard className="h-6 w-6 text-green-500" />}
                {service.icon === "smartphone" && <Smartphone className="h-6 w-6 text-purple-500" />}
                {service.icon === "gamepad2" && <Gamepad2 className="h-6 w-6 text-red-500" />}
                {service.icon === "building" && <Building className="h-6 w-6 text-orange-500" />}
                {service.icon === "fuel" && <Fuel className="h-6 w-6 text-teal-500" />}
                <span className="text-sm font-medium">{service.name}</span>
                <p className="text-xs text-gray-500 text-center">{service.description}</p>
              </div>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">最近订单</h2>
          {recentOrders.length > 0 ? (
            <div className="space-y-2">
              {recentOrders.map(order => (
                <Card key={order.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">订单号: {order.order_number}</p>
                      <p className="text-xs text-gray-500">创建时间: {new Date(order.created_at).toLocaleString()}</p>
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
          ) : (
            <Card className="p-4 text-center">
              <p className="text-sm text-gray-500">暂无最近订单</p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Utilities;
