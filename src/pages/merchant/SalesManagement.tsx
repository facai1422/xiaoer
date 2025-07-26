import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SalesManagement = () => {
  const navigate = useNavigate();

  // Get user balance and sales data
  const { data: userProfile } = useQuery({
    queryKey: ['user-balance'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('balance')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Return an object with balance to handle potential null value
      return { balance: data?.balance || 0 };
    }
  });

  const { data: salesData } = useQuery({
    queryKey: ['merchant-sales'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // This would be replaced with actual merchant sales data query
      // For now returning mock data
      return {
        pendingSales: 0,
        completedSales: 0,
        totalIncome: 0
      };
    }
  });

  const handleRecharge = () => {
    if ((userProfile?.balance || 0) <= 0) {
      toast.error("您的余额不足，请先充值");
      navigate('/wallet/recharge');
    } else {
      toast.success("操作成功");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center">
        <Button 
          variant="ghost" 
          className="p-0 mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold flex-1 text-center mr-6">出售管理</h1>
      </div>

      <div className="p-4 space-y-6">
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">账户余额</h2>
            <span className="text-xl font-bold text-blue-600">{userProfile?.balance?.toFixed(2) || '0.00'} USDT</span>
          </div>
          <Button 
            className="w-full" 
            onClick={handleRecharge}
          >
            {(userProfile?.balance || 0) <= 0 ? "充值" : "提现"}
          </Button>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">待处理订单</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{salesData?.pendingSales || 0}</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">已完成订单</div>
              <div className="text-2xl font-bold text-green-600 mt-1">{salesData?.completedSales || 0}</div>
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">总收��</div>
            <div className="text-2xl font-bold text-orange-600 mt-1">{salesData?.totalIncome?.toFixed(2) || '0.00'} USDT</div>
          </div>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">快捷操作</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => navigate('/merchant/pending-orders')}>
              查看待处理
            </Button>
            <Button variant="outline" onClick={() => navigate('/merchant/orders')}>
              所有订单
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesManagement;
