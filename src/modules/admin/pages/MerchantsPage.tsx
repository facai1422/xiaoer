
import { useState, useEffect } from "react";
import { AdminLayout } from "../layout/AdminLayout";
import { SearchToolbar } from "../components/SearchToolbar";
import { Card } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MerchantProfile {
  id: string;
  created_at: string;
  user_id: string;
  account_balance: number | null;
  nickname: string | null;
  phone: string | null;
  status: boolean | null;
}

const MerchantsPage = () => {
  const [merchants, setMerchants] = useState<MerchantProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('merchant_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMerchants(data || []);
    } catch (error) {
      console.error('Error loading merchants:', error);
      toast.error("加载商户数据失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (merchantId: string, status: boolean) => {
    try {
      const { error } = await supabase
        .from('merchant_profiles')
        .update({ status })
        .eq('id', merchantId);

      if (error) throw error;
      toast.success("商户状态更新成功");
      loadMerchants();
    } catch (error) {
      console.error('Error updating merchant status:', error);
      toast.error("更新商户状态失败");
    }
  };

  const filteredMerchants = merchants.filter(merchant =>
    (merchant.nickname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (merchant.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">商户管理</h1>
          <Button>添加商户</Button>
        </div>

        <SearchToolbar
          placeholder="搜索商户名称或手机号..."
          value={searchTerm}
          onChange={setSearchTerm}
          onSearch={() => {}}
          onReset={() => setSearchTerm("")}
        />

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商户名称</TableHead>
                <TableHead>手机号</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead>账户余额</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredMerchants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    暂无商户数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredMerchants.map((merchant) => (
                  <TableRow key={merchant.id}>
                    <TableCell>{merchant.nickname || '-'}</TableCell>
                    <TableCell>{merchant.phone || '-'}</TableCell>
                    <TableCell>
                      {new Date(merchant.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      ¥{merchant.account_balance?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={merchant.status || false}
                        onCheckedChange={(checked) => 
                          handleStatusChange(merchant.id, checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-x-2">
                        <Button variant="outline" size="sm">
                          详情
                        </Button>
                        <Button variant="outline" size="sm">
                          充值
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default MerchantsPage;
