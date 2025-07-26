import { useState, useEffect } from "react";
import { toast } from "sonner";
import { adminSupabase } from "@/utils/adminSupabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Plus, Edit, Trash2, Copy, QrCode, RefreshCw, Wallet, TrendingUp, Activity } from "lucide-react";
import { getAdminSession } from "@/utils/adminAuth";

interface USDTAddress {
  id: string;
  address: string;
  label: string;
  network: 'TRC20' | 'ERC20' | 'BEP20';
  status: 'active' | 'inactive' | 'maintenance';
  balance: number;
  total_received: number;
  transaction_count: number;
  qr_code?: string;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
}

const USDTManagePage = () => {
  const [addresses, setAddresses] = useState<USDTAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<USDTAddress | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'view' | 'add' | 'edit' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [networkFilter, setNetworkFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // 表单数据
  const [formData, setFormData] = useState<{
    address: string;
    label: string;
    network: 'TRC20' | 'ERC20' | 'BEP20';
    status: 'active' | 'inactive' | 'maintenance';
  }>({
    address: '',
    label: '',
    network: 'TRC20',
    status: 'active'
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      console.log('🔄 获取USDT地址数据...');

      // 使用adminSupabase，它会自动检查管理员权限
      const response: any = await adminSupabase
        .from('platform_payment_addresses')
        .select('*')
        .eq('currency', 'USDT')
        .order('created_at', { ascending: false });

      if (response.error) {
        console.error('❌ 获取USDT地址失败:', response.error);
        toast.error('获取USDT地址失败');
        return;
      }

      console.log('✅ USDT地址获取成功:', response.data?.length || 0, '条记录');
      
      // 转换数据格式以匹配接口，使用明确的类型断言
      const rawData = response.data || [];
      const formattedData: USDTAddress[] = rawData.map((item: any) => ({
        id: item.id,
        address: item.address,
        label: item.type || 'USDT',
        network: (item.network || 'TRC20') as 'TRC20' | 'ERC20' | 'BEP20',
        status: item.is_active ? 'active' as const : 'inactive' as const,
        balance: 0,
        total_received: 0,
        transaction_count: 0,
        qr_code: item.qr_code,
        created_at: item.created_at,
        updated_at: item.updated_at,
        last_used_at: undefined
      }));

      setAddresses(formattedData);
    } catch (error) {
      console.error('❌ 获取USDT地址异常:', error);
      toast.error('获取USDT地址失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    try {
      if (!formData.address || !formData.label) {
        toast.error('请填写完整信息');
        return;
      }

      console.log('🔄 添加USDT地址...', formData);

      const { error } = await adminSupabase
        .from('platform_payment_addresses')
        .insert({
          currency: 'USDT',
          network: formData.network,
          address: formData.address,
          type: formData.label,
          is_active: formData.status === 'active'
        });

      if (error) {
        console.error('❌ 添加USDT地址失败:', error);
        toast.error(`添加USDT地址失败: ${error.message}`);
        return;
      }

      console.log('✅ USDT地址添加成功');
      toast.success('USDT地址添加成功');
      setDialogOpen(false);
      resetForm();
      fetchAddresses();
    } catch (error) {
      console.error('❌ 添加USDT地址异常:', error);
      toast.error('添加USDT地址失败');
    }
  };

  const handleEditAddress = async () => {
    try {
      if (!selectedAddress || !formData.address || !formData.label) {
        toast.error('请填写完整信息');
        return;
      }

      console.log('🔄 更新USDT地址...', formData);

      const { error } = await adminSupabase
        .from('platform_payment_addresses')
        .update({
          network: formData.network,
          address: formData.address,
          type: formData.label,
          is_active: formData.status === 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAddress.id);

      if (error) {
        console.error('❌ 更新USDT地址失败:', error);
        toast.error(`更新USDT地址失败: ${error.message}`);
        return;
      }

      console.log('✅ USDT地址更新成功');
      toast.success('USDT地址更新成功');
      setDialogOpen(false);
      resetForm();
      fetchAddresses();
    } catch (error) {
      console.error('❌ 更新USDT地址异常:', error);
      toast.error('更新USDT地址失败');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('确定要删除这个USDT地址吗？')) {
      return;
    }

    try {
      console.log('🔄 删除USDT地址...', id);

      const { error } = await adminSupabase
        .from('platform_payment_addresses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ 删除USDT地址失败:', error);
        toast.error(`删除USDT地址失败: ${error.message}`);
        return;
      }

      console.log('✅ USDT地址删除成功');
      toast.success('USDT地址删除成功');
      fetchAddresses();
    } catch (error) {
      console.error('❌ 删除USDT地址异常:', error);
      toast.error('删除USDT地址失败');
    }
  };

  const resetForm = () => {
    setFormData({
      address: '',
      label: '',
      network: 'TRC20',
      status: 'active'
    });
    setSelectedAddress(null);
    setActionType(null);
  };

  const handleViewAddress = (address: USDTAddress) => {
    setSelectedAddress(address);
    setActionType('view');
    setDialogOpen(true);
  };

  const handleEditClick = (address: USDTAddress) => {
    setSelectedAddress(address);
    setFormData({
      address: address.address,
      label: address.label,
      network: address.network,
      status: address.status
    });
    setActionType('edit');
    setDialogOpen(true);
  };

  const handleAddClick = () => {
    resetForm();
    setActionType('add');
    setDialogOpen(true);
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('地址已复制到剪贴板');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-300">活跃</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">停用</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">维护</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const getNetworkBadge = (network: string) => {
    switch (network) {
      case 'TRC20':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">TRC20</Badge>;
      case 'ERC20':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">ERC20</Badge>;
      case 'BEP20':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">BEP20</Badge>;
      default:
        return <Badge variant="outline">{network}</Badge>;
    }
  };

  const filteredAddresses = addresses.filter(address => {
    const matchesSearch = 
      address.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.label.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesNetwork = networkFilter === 'all' || address.network === networkFilter;
    const matchesStatus = statusFilter === 'all' || address.status === statusFilter;
    
    return matchesSearch && matchesNetwork && matchesStatus;
  });

  // 计算统计数据
  const stats = {
    total: addresses.length,
    active: addresses.filter(a => a.status === 'active').length,
    totalBalance: addresses.reduce((sum, a) => sum + a.balance, 0),
    totalReceived: addresses.reduce((sum, a) => sum + a.total_received, 0)
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">USDT地址管理</h1>
        <div className="flex gap-2">
          <Button onClick={fetchAddresses} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button onClick={handleAddClick}>
            <Plus className="w-4 h-4 mr-2" />
            添加地址
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总地址数</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Wallet className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">活跃地址</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总余额</p>
                <p className="text-2xl font-bold">{stats.totalBalance.toFixed(2)} USDT</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总收款</p>
                <p className="text-2xl font-bold">{stats.totalReceived.toFixed(2)} USDT</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="搜索地址或标签..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
              title="筛选网络"
            >
              <option value="all">全部网络</option>
              <option value="TRC20">TRC20</option>
              <option value="ERC20">ERC20</option>
              <option value="BEP20">BEP20</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
              title="筛选状态"
            >
              <option value="all">全部状态</option>
              <option value="active">活跃</option>
              <option value="inactive">停用</option>
              <option value="maintenance">维护</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 地址列表 */}
      <Card>
        <CardHeader>
          <CardTitle>地址列表 ({filteredAddresses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标签</TableHead>
                  <TableHead>地址</TableHead>
                  <TableHead>网络</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>余额</TableHead>
                  <TableHead>总收款</TableHead>
                  <TableHead>交易次数</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAddresses.map((address) => (
                  <TableRow key={address.id}>
                    <TableCell className="font-medium">{address.label}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{address.address.slice(0, 10)}...{address.address.slice(-8)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyAddress(address.address)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{getNetworkBadge(address.network)}</TableCell>
                    <TableCell>{getStatusBadge(address.status)}</TableCell>
                    <TableCell className="font-bold">{address.balance.toFixed(2)} USDT</TableCell>
                    <TableCell>{address.total_received.toFixed(2)} USDT</TableCell>
                    <TableCell>{address.transaction_count}</TableCell>
                    <TableCell>{new Date(address.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAddress(address)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(address)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 地址详情/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'view' && '地址详情'}
              {actionType === 'add' && '添加USDT地址'}
              {actionType === 'edit' && '编辑USDT地址'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {actionType === 'view' && selectedAddress && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">标签</label>
                    <p className="mt-1">{selectedAddress.label}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">网络</label>
                    <div className="mt-1">{getNetworkBadge(selectedAddress.network)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">状态</label>
                    <div className="mt-1">{getStatusBadge(selectedAddress.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">余额</label>
                    <p className="mt-1 font-bold">{selectedAddress.balance.toFixed(2)} USDT</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">地址</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded font-mono text-sm break-all">
                    {selectedAddress.address}
                  </div>
                </div>
              </div>
            )}

            {(actionType === 'add' || actionType === 'edit') && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">标签</label>
                  <Input
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="请输入地址标签"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">地址</label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="请输入USDT地址"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">网络</label>
                    <select
                      value={formData.network}
                      onChange={(e) => setFormData(prev => ({ ...prev, network: e.target.value as any }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                      title="选择网络类型"
                    >
                      <option value="TRC20">TRC20</option>
                      <option value="ERC20">ERC20</option>
                      <option value="BEP20">BEP20</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">状态</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                      title="选择状态"
                    >
                      <option value="active">活跃</option>
                      <option value="inactive">停用</option>
                      <option value="maintenance">维护</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            {actionType === 'add' && (
              <Button onClick={handleAddAddress}>
                添加
              </Button>
            )}
            {actionType === 'edit' && (
              <Button onClick={handleEditAddress}>
                保存
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default USDTManagePage; 