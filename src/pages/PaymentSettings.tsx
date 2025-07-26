
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PaymentSettings = () => {
  const navigate = useNavigate();

  // 获取用户绑定的支付方式
  const { data: userPayments, isLoading } = useQuery({
    queryKey: ['user-payments'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('user_payments')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) throw error;
      return data || [];
    },
  });
  
  const cryptoPayments = [
    { 
      type: "USDT-TRC20", 
      icon: "🔗", 
      bound: userPayments?.some(p => p.type === 'usdt-trc20') || false,
      route: "/payment/usdt-bind" 
    },
    { 
      type: "USDT-ERC20", 
      icon: "🔗", 
      bound: userPayments?.some(p => p.type === 'usdt-erc20') || false,
      route: "/payment/usdt-bind" 
    }
  ];

  const fiatPayments = [
    { 
      type: "支付宝", 
      icon: "💰", 
      bound: userPayments?.some(p => p.type === 'alipay') || false,
      route: "/payment/alipay-bind" 
    },
    { 
      type: "微信", 
      icon: "💳", 
      bound: userPayments?.some(p => p.type === 'wechat') || false,
      route: "/payment/wechat-bind" 
    },
    { 
      type: "银行卡", 
      icon: "🏦", 
      bound: userPayments?.some(p => p.type === 'bank') || false,
      route: "/payment/bank-bind" 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center border-b">
        <Button 
          variant="ghost" 
          className="p-0 mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold flex-1 text-center mr-6">支付管理</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">加密货币地址</h2>
          {isLoading ? (
            <div className="text-center py-4">加载中...</div>
          ) : (
            cryptoPayments.map((method) => (
              <Card key={method.type} className="p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <h3 className="font-medium">{method.type}</h3>
                      <p className="text-sm text-gray-500">
                        {method.bound ? "已绑定" : "未绑定"}
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="flex items-center gap-1"
                    onClick={() => navigate(method.route)}
                    variant={method.bound ? "outline" : "default"}
                  >
                    <Plus className="h-4 w-4" />
                    {method.bound ? "重新绑定" : "绑定"}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">法币收款账户</h2>
          {isLoading ? (
            <div className="text-center py-4">加载中...</div>
          ) : (
            fiatPayments.map((method) => (
              <Card key={method.type} className="p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <h3 className="font-medium">{method.type}</h3>
                      <p className="text-sm text-gray-500">
                        {method.bound ? "已绑定" : "未绑定"}
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="flex items-center gap-1"
                    onClick={() => navigate(method.route)}
                    variant={method.bound ? "outline" : "default"}
                  >
                    <Plus className="h-4 w-4" />
                    {method.bound ? "重新绑定" : "绑定"}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
