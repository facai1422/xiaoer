
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddressesTable } from "./components/AddressesTable";
import { AddAddressForm } from "./components/AddAddressForm";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const PaymentAddressesPage = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use a more robust refetch mechanism
  const { refetch } = useQuery({ 
    queryKey: ['payment-addresses'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('platform_payment_addresses')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching addresses:', error);
        toast.error("加载支付地址失败");
        return [];
      }
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-semibold">支付地址管理</h1>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? "刷新中..." : "刷新"}
        </Button>
      </div>

      <Card className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">添加新地址</h2>
        <AddAddressForm onSuccess={handleRefresh} />
      </Card>

      <Card className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">地址列表</h2>
        <AddressesTable />
      </Card>
    </div>
  );
};

export default PaymentAddressesPage;
