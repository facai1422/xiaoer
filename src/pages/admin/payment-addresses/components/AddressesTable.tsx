
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentAddress {
  id: string;
  type: string;
  address: string;
  is_active: boolean;
  created_at: string;
}

export const AddressesTable = () => {
  const { data: addresses, isLoading, refetch } = useQuery({
    queryKey: ['payment-addresses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_payment_addresses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching addresses:', error);
        toast.error("加载支付地址失败");
        throw error;
      }

      return data as PaymentAddress[];
    }
  });

  const toggleAddressStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('platform_payment_addresses')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success("状态更新成功");
      refetch();
    } catch (error) {
      console.error('Error updating address status:', error);
      toast.error("更新状态失败");
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">加载中...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>地址类型</TableHead>
          <TableHead>支付地址</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>创建时间</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {addresses?.map((address) => (
          <TableRow key={address.id}>
            <TableCell>{address.type}</TableCell>
            <TableCell>{address.address}</TableCell>
            <TableCell>{address.is_active ? '启用' : '禁用'}</TableCell>
            <TableCell>{new Date(address.created_at).toLocaleString()}</TableCell>
            <TableCell className="text-right">
              <Button
                variant={address.is_active ? "destructive" : "default"}
                onClick={() => toggleAddressStatus(address.id, address.is_active)}
              >
                {address.is_active ? '禁用' : '启用'}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
