
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MerchantSearchForm } from "./components/MerchantSearchForm";
import { MerchantList } from "./components/MerchantList";
import type { SearchParams, Merchant } from "./types";

const MerchantsPage = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const queryClient = useQueryClient();

  const { data: merchants, isLoading } = useQuery({
    queryKey: ['merchants', searchParams],
    queryFn: async () => {
      let query = supabase
        .from('merchant_profiles')
        .select();

      if (searchParams.nickname) {
        query = query.ilike('nickname', `%${searchParams.nickname}%`);
      }
      if (searchParams.phone) {
        query = query.ilike('phone', `%${searchParams.phone}%`);
      }
      if (searchParams.status) {
        query = query.eq('status', searchParams.status === 'enabled');
      }
      if (searchParams.startDate) {
        query = query.gte('created_at', searchParams.startDate);
      }
      if (searchParams.endDate) {
        query = query.lte('created_at', searchParams.endDate);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching merchants:', error);
        throw error;
      }
      
      return (data || []) as Merchant[];
    }
  });

  const handleSearch = () => {
    queryClient.invalidateQueries({ queryKey: ['merchants'] });
  };

  const handleReset = () => {
    setSearchParams({});
  };

  const handleStatusChange = async (merchantId: string, newStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('merchant_profiles')
        .update({ status: newStatus })
        .eq('id', merchantId);

      if (error) throw error;
      toast.success('商户状态更新成功');
      queryClient.invalidateQueries({ queryKey: ['merchants'] });
    } catch (error) {
      console.error('更新商户状态失败:', error);
      toast.error('更新商户状态失败');
    }
  };

  return (
    <div className="h-full w-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">平台商家</h1>
        <Button>平台商家</Button>
      </div>

      <Card className="w-full">
        <div className="p-4 space-y-4">
          <MerchantSearchForm
            searchParams={searchParams}
            onSearchParamsChange={setSearchParams}
            onSearch={handleSearch}
            onReset={handleReset}
          />
          <MerchantList
            merchants={merchants}
            isLoading={isLoading}
            onStatusChange={handleStatusChange}
          />
        </div>
      </Card>
    </div>
  );
};

export default MerchantsPage;
