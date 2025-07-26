import { Card, CardContent } from "@/components/ui/card";
import { 
  Receipt, 
  MapPin, 
  Users, 
  CreditCard,
  TrendingDown,
  ArrowUpRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TransactionCenter = () => {
  const navigate = useNavigate();

  const services = [
    { name: "转账地址", icon: MapPin, path: "/wallet-address" },
    { name: "代理中心", icon: Users, path: "/agent-center" },
    { name: "提现记录", icon: TrendingDown, path: "/transaction-orders" },
    { name: "支付管理", icon: CreditCard, path: "/payment-management" },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-base font-medium mb-4">交易大厅</h3>
        <div className="grid grid-cols-4 gap-4">
          {services.map((service, index) => (
            <div 
              key={index}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => navigate(service.path)}
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <service.icon className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs text-gray-600 text-center">{service.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionCenter;
