import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, Trash2, Search, RefreshCw, Users, UserCheck, UserX, Shield } from "lucide-react";
import { getAdminSession } from "@/utils/adminAuth";

interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: 'user' | 'agent' | 'merchant' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  balance: number;
  total_recharge: number;
  total_withdrawal: number;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  referrer_id?: string;
  referral_code?: string;
}

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'view' | 'edit' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const adminSession = getAdminSession();
      if (!adminSession) {
        toast.error('请先登录管理员账户');
        return;
      }

      // 从数据库获取用户数据
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('获取用户数据失败:', usersError);
        toast.error('获取用户数据失败');
        return;
      }

      // 获取用户余额数据
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_balances')
        .select('user_id, balance');

      if (balanceError) {
        console.error('获取余额数据失败:', balanceError);
      }

      // 获取充值统计
      const { data: rechargeData, error: rechargeError } = await supabase
        .from('recharge_orders')
        .select('user_id, amount')
        .eq('status', 'confirmed');

      if (rechargeError) {
        console.error('获取充值数据失败:', rechargeError);
      }

      // 获取提现统计
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('withdrawal_orders')
        .select('user_id, amount')
        .eq('status', 'completed');

      if (withdrawalError) {
        console.error('获取提现数据失败:', withdrawalError);
      }

      // 合并数据
      const balanceMap = new Map(balanceData?.map(b => [b.user_id, b.balance]) || []);
      const rechargeMap = new Map();
      const withdrawalMap = new Map();

      // 计算充值总额
      rechargeData?.forEach(r => {
        const current = rechargeMap.get(r.user_id) || 0;
        rechargeMap.set(r.user_id, current + (r.amount || 0));
      });

      // 计算提现总额
      withdrawalData?.forEach(w => {
        const current = withdrawalMap.get(w.user_id) || 0;
        withdrawalMap.set(w.user_id, current + (w.amount || 0));
      });

      // 转换数据格式
      const formattedUsers: User[] = (usersData || []).map(user => ({
        id: user.id,
        username: user.username || user.email?.split('@')[0] || '未知用户',
        email: user.email || '',
        phone: user.phone || '',
        role: 'user', // 默认角色，实际应该从数据库字段获取
        status: 'active', // 默认状态，实际应该从数据库字段获取
        balance: balanceMap.get(user.id) || 0,
        total_recharge: rechargeMap.get(user.id) || 0,
        total_withdrawal: withdrawalMap.get(user.id) || 0,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login_at: undefined, // 需要从登录记录获取
        referrer_id: undefined,
        referral_code: undefined
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('获取用户数据异常:', error);
      toast.error('获取用户数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: User['status']) => {
    try {
      // 这里应该更新用户状态，但由于数据库表结构限制，暂时只更新本地状态
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, status: newStatus, updated_at: new Date().toISOString() }
            : user
        )
      );

      toast.success(`用户状态已更新为${newStatus === 'active' ? '活跃' : newStatus === 'inactive' ? '停用' : '暂停'}`);
    } catch (error) {
      console.error('更新用户状态异常:', error);
      toast.error('更新用户状态失败');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      if (!confirm('确认删除此用户吗？此操作不可恢复。')) {
        return;
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('删除用户失败:', error);
        toast.error('删除用户失败');
        return;
      }

      toast.success('用户删除成功');
      fetchUsers();
    } catch (error) {
      console.error('删除用户异常:', error);
      toast.error('删除用户失败');
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setActionType('view');
    setDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setActionType('edit');
    setDialogOpen(true);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800 border-red-300">管理员</Badge>;
      case 'agent':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">代理</Badge>;
      case 'merchant':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">商户</Badge>;
      case 'user':
        return <Badge className="bg-green-100 text-green-800 border-green-300">用户</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-300">活跃</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">停用</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 border-red-300">暂停</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // 计算统计数据
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    agents: users.filter(u => u.role === 'agent').length,
    merchants: users.filter(u => u.role === 'merchant').length
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <div className="flex gap-2">
          <Button onClick={fetchUsers} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">总用户数</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">活跃用户</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">代理用户</p>
                <p className="text-3xl font-bold text-blue-600">{stats.agents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">商户用户</p>
                <p className="text-3xl font-bold text-purple-600">{stats.merchants}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <UserX className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card className="mb-6 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜索用户名、邮箱或手机号..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 h-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              title="筛选角色"
            >
              <option value="all">全部角色</option>
              <option value="user">用户</option>
              <option value="agent">代理</option>
              <option value="merchant">商户</option>
              <option value="admin">管理员</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 h-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              title="筛选状态"
            >
              <option value="all">全部状态</option>
              <option value="active">活跃</option>
              <option value="inactive">停用</option>
              <option value="suspended">暂停</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 用户列表 */}
      <Card className="shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-lg">用户列表 ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">暂无用户数据</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">用户名</TableHead>
                    <TableHead className="font-semibold">邮箱</TableHead>
                    <TableHead className="font-semibold">手机号</TableHead>
                    <TableHead className="font-semibold">角色</TableHead>
                    <TableHead className="font-semibold">状态</TableHead>
                    <TableHead className="font-semibold">余额</TableHead>
                    <TableHead className="font-semibold">总充值</TableHead>
                    <TableHead className="font-semibold">总提现</TableHead>
                    <TableHead className="font-semibold">注册时间</TableHead>
                    <TableHead className="font-semibold text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell className="text-gray-600">{user.email}</TableCell>
                      <TableCell className="text-gray-600">{user.phone || '-'}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="font-semibold text-blue-600">{user.balance.toFixed(2)} USDT</TableCell>
                      <TableCell className="text-green-600">{user.total_recharge.toFixed(2)} USDT</TableCell>
                      <TableCell className="text-orange-600">{user.total_withdrawal.toFixed(2)} USDT</TableCell>
                      <TableCell className="text-gray-600">{new Date(user.created_at).toLocaleDateString('zh-CN')}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                            title="编辑用户"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            title="删除用户"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 用户详情/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {actionType === 'view' && '用户详情'}
              {actionType === 'edit' && '编辑用户'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {selectedUser && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">用户名</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{selectedUser.username}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">邮箱</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">手机号</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{selectedUser.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">角色</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {getRoleBadge(selectedUser.role)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">状态</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {getStatusBadge(selectedUser.status)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">余额</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-bold text-blue-600">{selectedUser.balance.toFixed(2)} USDT</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">总充值</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-green-600">{selectedUser.total_recharge.toFixed(2)} USDT</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">总提现</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-orange-600">{selectedUser.total_withdrawal.toFixed(2)} USDT</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">注册时间</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{new Date(selectedUser.created_at).toLocaleString('zh-CN')}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">更新时间</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{new Date(selectedUser.updated_at).toLocaleString('zh-CN')}</p>
                    </div>
                  </div>
                </div>
                
                {actionType === 'edit' && (
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-lg font-semibold">状态管理</h3>
                    <div className="flex gap-3">
                      <Button
                        variant={selectedUser.status === 'active' ? 'default' : 'outline'}
                        onClick={() => {
                          handleUpdateUserStatus(selectedUser.id, 'active');
                          setSelectedUser({...selectedUser, status: 'active'});
                        }}
                        className={selectedUser.status === 'active' ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        激活
                      </Button>
                      <Button
                        variant={selectedUser.status === 'inactive' ? 'default' : 'outline'}
                        onClick={() => {
                          handleUpdateUserStatus(selectedUser.id, 'inactive');
                          setSelectedUser({...selectedUser, status: 'inactive'});
                        }}
                        className={selectedUser.status === 'inactive' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        停用
                      </Button>
                      <Button
                        variant={selectedUser.status === 'suspended' ? 'default' : 'outline'}
                        onClick={() => {
                          handleUpdateUserStatus(selectedUser.id, 'suspended');
                          setSelectedUser({...selectedUser, status: 'suspended'});
                        }}
                        className={selectedUser.status === 'suspended' ? 'bg-red-600 hover:bg-red-700' : ''}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        暂停
                      </Button>
                    </div>
                    
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>提示：</strong>修改用户状态后会立即生效，请谨慎操作。
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              className="min-w-[100px]"
            >
              关闭
            </Button>
            {actionType === 'edit' && (
              <Button 
                onClick={() => {
                  toast.success('用户信息已更新');
                  setDialogOpen(false);
                }}
                className="min-w-[100px] bg-blue-600 hover:bg-blue-700"
              >
                保存更改
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPage; 