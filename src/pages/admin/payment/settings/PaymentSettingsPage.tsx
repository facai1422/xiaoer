
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentAddress {
  id: string;
  type: string;
  address: string;
  is_active: boolean;
  created_at: string;
}

const PaymentSettingsPage = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<PaymentAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editAddress, setEditAddress] = useState<PaymentAddress | null>(null);
  const [editType, setEditType] = useState("");
  const [editAddressText, setEditAddressText] = useState("");

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('platform_payment_addresses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading addresses:', error);
        throw error;
      }
      setAddresses(data || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error("加载收款地址失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (addressId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('platform_payment_addresses')
        .update({ is_active: isActive })
        .eq('id', addressId);

      if (error) throw error;
      toast.success("收款地址状态更新成功");
      loadAddresses();
    } catch (error) {
      console.error('Error updating address status:', error);
      toast.error("更新地址状态失败");
    }
  };

  const handleEditClick = (address: PaymentAddress) => {
    setEditAddress(address);
    setEditType(address.type);
    setEditAddressText(address.address);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editAddress) return;
    
    try {
      const { error } = await supabase
        .from('platform_payment_addresses')
        .update({ 
          type: editType,
          address: editAddressText
        })
        .eq('id', editAddress.id);

      if (error) throw error;
      toast.success("收款地址更新成功");
      setEditDialogOpen(false);
      loadAddresses();
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error("更新地址失败");
    }
  };

  const addNewAddress = async () => {
    navigate("/admin/payment/addresses/new");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
            title="返回"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-semibold">支付设置</h1>
        </div>
        <Button onClick={addNewAddress}>
          添加收款地址
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>支付类型</TableHead>
              <TableHead>收款地址</TableHead>
              <TableHead>添加时间</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : addresses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  暂无收款地址
                </TableCell>
              </TableRow>
            ) : (
              addresses.map((address) => (
                <TableRow key={address.id}>
                  <TableCell>{address.type}</TableCell>
                  <TableCell className="font-mono">
                    {address.address}
                  </TableCell>
                  <TableCell>
                    {new Date(address.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={address.is_active}
                      onCheckedChange={(checked) => 
                        handleStatusChange(address.id, checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditClick(address)}
                    >
                      编辑
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">支付配置</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">USDT支付</h3>
              <p className="text-sm text-gray-500">接收USDT付款</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">支付宝</h3>
              <p className="text-sm text-gray-500">接收支付宝付款</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">微信支付</h3>
              <p className="text-sm text-gray-500">接收微信付款</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑收款地址</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-type">地址类型</Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="选择地址类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRC20">TRC20</SelectItem>
                  <SelectItem value="ERC20">ERC20</SelectItem>
                  <SelectItem value="BTC">BTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">收款地址</Label>
              <Input
                id="edit-address"
                value={editAddressText}
                onChange={(e) => setEditAddressText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>取消</Button>
            <Button onClick={handleSaveEdit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentSettingsPage;
