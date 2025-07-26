
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface PaymentAddress {
  id: string;
  type: string;
  address: string;
  is_active: boolean;
  created_at: string;
}

const PaymentAddressesPage = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<PaymentAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [type, setType] = useState("TRC20");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuthAndLoadAddresses();
  }, [navigate]);

  const checkAuthAndLoadAddresses = async () => {
    setIsLoading(true);
    try {
      // Check if user is admin
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("请先登录");
        navigate("/admin/login");
        return;
      }

      // Check admin role
      const { data: adminData, error: adminError } = await supabase
        .from('admin_profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      // If the query was successful (even if adminData is null)
      if (!adminError) {
        // Cast to ensure adminData.role doesn't cause a type error
        const role = adminData?.role;
        
        if (role === 'admin' || role === 'super_admin') {
          setIsAuthorized(true);
          fetchAddresses();
        } else {
          toast.error("您没有管理员权限");
          navigate("/admin/login");
        }
      } else {
        // Handle query error
        console.error("Error checking admin status:", adminError);
        toast.error("验证管理员权限失败");
        navigate("/admin/login");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("验证权限失败");
      navigate("/admin/login");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_payment_addresses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("获取支付地址失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !address) {
      toast.error("请填写完整信息");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('platform_payment_addresses')
        .insert([
          { type, address, is_active: true }
        ]);

      if (error) throw error;

      toast.success("添加支付地址成功");
      setAddress("");
      fetchAddresses();
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("添加支付地址失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAddressStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('platform_payment_addresses')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success("状态更新成功");
      fetchAddresses();
    } catch (error) {
      console.error("Error updating address status:", error);
      toast.error("更新状态失败");
    }
  };

  if (!isAuthorized && !isLoading) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <h1 className="text-xl font-bold mb-4">访问被拒绝</h1>
          <p className="text-gray-500 mb-4">您没有访问此页面的权限</p>
          <Button onClick={() => navigate("/admin/login")}>返回登录</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">支付地址管理</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">添加新地址</h2>
        <form onSubmit={handleAddAddress} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">地址类型</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="选择地址类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRC20">TRC20</SelectItem>
                  <SelectItem value="ERC20">ERC20</SelectItem>
                  <SelectItem value="BTC">BTC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">支付地址</label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="输入支付地址"
              />
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "添加中..." : "添加地址"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-medium mb-4">地址列表</h2>
        {isLoading ? (
          <div className="text-center py-8">加载中...</div>
        ) : (
          <div className="border rounded-md overflow-hidden">
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
                {addresses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      暂无支付地址
                    </TableCell>
                  </TableRow>
                ) : (
                  addresses.map((address) => (
                    <TableRow key={address.id}>
                      <TableCell>{address.type}</TableCell>
                      <TableCell className="font-mono">{address.address}</TableCell>
                      <TableCell>{address.is_active ? "启用" : "禁用"}</TableCell>
                      <TableCell>{new Date(address.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={address.is_active ? "destructive" : "default"}
                          onClick={() => toggleAddressStatus(address.id, address.is_active)}
                        >
                          {address.is_active ? "禁用" : "启用"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PaymentAddressesPage;
