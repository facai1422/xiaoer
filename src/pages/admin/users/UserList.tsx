import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  MoreHorizontal, 
  Plus, 
  Minus, 
  Lock, 
  Unlock, 
  Trash2, 
  Key,
  Search,
  Filter,
  MoreVertical,
  Users,
  UserCheck,
  UserX,
  DollarSign,
  RefreshCw,
  Zap,
  Shield
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagementService, type UserProfile } from '@/services/userManagementService';

export const UserList = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [dialogType, setDialogType] = useState<'balance' | 'freeze' | 'delete' | 'password' | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceType, setBalanceType] = useState<'add' | 'subtract'>('add');
  const [balanceDescription, setBalanceDescription] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [tradePassword, setTradePassword] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    frozenUsers: 0,
    totalBalance: 0
  });

  // 加载用户数据
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // 使用新的用户资料获取方法
      const { AdminDataService } = await import('@/lib/database');
      const { data, error } = await AdminDataService.getAllUserProfiles();
      
      if (error) {
        console.error('加载用户数据失败:', error);
        return;
      }
      
      setUsers(data || []);
    } catch (error) {
      console.error('加载用户数据异常:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载统计数据
  const loadStats = async () => {
    try {
      const { AdminDataService } = await import('@/lib/database');
      const statsData = await AdminDataService.getUserStats();
      setStats(statsData);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  // 搜索过滤
  const filteredUsers = users.filter(user => {
    const searchValue = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchValue) ||
      user.username?.toLowerCase().includes(searchValue) ||
      user.full_name?.toLowerCase().includes(searchValue) ||
      user.phone?.toLowerCase().includes(searchValue)
    );
  });

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border border-green-200 font-medium px-3 py-1">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            正常
          </Badge>
        );
      case 'frozen':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border border-yellow-200 font-medium px-3 py-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            冻结
          </Badge>
        );
      case 'disabled':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border border-red-200 font-medium px-3 py-1">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            禁用
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="font-medium px-3 py-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
            未知
          </Badge>
        );
    }
  };

  // 处理余额操作
  const handleBalanceOperation = async () => {
    if (!selectedUser || !balanceAmount) return;
    
    try {
      const amount = parseFloat(balanceAmount);
      const { AdminDataService } = await import('@/lib/database');
      const result = await AdminDataService.updateUserBalance(
        selectedUser.id,
        amount,
        balanceType,
        balanceDescription
      );
      
      if (result.success) {
        alert(`余额${balanceType === 'add' ? '增加' : '减少'}成功！新余额: ${result.newBalance} USDT`);
        loadUsers(); // 重新加载用户数据
        loadStats(); // 重新加载统计数据
        handleCloseDialog();
      } else {
        alert(`操作失败: ${result.error}`);
      }
    } catch (error) {
      console.error('余额操作失败:', error);
      alert('操作失败，请重试');
    }
  };

  // 处理账户冻结/解冻
  const handleToggleUserStatus = async (freeze: boolean) => {
    if (!selectedUser) return;
    
    try {
      console.log('🔄 开始用户状态切换:', {
        userId: selectedUser.id,
        currentStatus: selectedUser.status,
        targetAction: freeze ? '冻结' : '解冻'
      });
      
      const { AdminDataService } = await import('@/lib/database');
      const result = await AdminDataService.toggleUserStatus(selectedUser.id, freeze);
      
      console.log('✅ 状态切换结果:', result);
      
      if (result.success) {
        alert(`账户${freeze ? '冻结' : '解冻'}成功！`);
        loadUsers();
        loadStats();
        handleCloseDialog();
      } else {
        console.error('❌ 状态切换失败:', result.error);
        alert(`操作失败: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ 状态切换异常:', error);
      alert('操作失败，请重试');
    }
  };

  // 处理删除用户
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    // 添加确认对话框
    if (!confirm(`确定要删除用户 ${selectedUser.username || selectedUser.email} 吗？此操作不可恢复！`)) {
      return;
    }
    
    try {
      console.log('🗑️ 开始删除用户:', {
        userId: selectedUser.id,
        username: selectedUser.username,
        email: selectedUser.email
      });
      
      const { AdminDataService } = await import('@/lib/database');
      const result = await AdminDataService.deleteUser(selectedUser.id);
      
      console.log('✅ 删除用户结果:', result);
      
      if (result.success) {
        alert('用户删除成功！');
        loadUsers();
        loadStats();
        handleCloseDialog();
      } else {
        console.error('❌ 删除用户失败:', result.error);
        alert(`删除失败: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ 删除用户异常:', error);
      alert('删除失败，请重试');
    }
  };

  // 处理密码修改
  const handleUpdatePasswords = async () => {
    if (!selectedUser || (!loginPassword && !tradePassword)) return;
    
    try {
      const { AdminDataService } = await import('@/lib/database');
      const result = await AdminDataService.updateUserPasswords(
        selectedUser.id,
        loginPassword || undefined,
        tradePassword || undefined
      );
      
      if (result.success) {
        alert('密码修改成功！');
        handleCloseDialog();
      } else {
        alert(`修改失败: ${result.error}`);
      }
    } catch (error) {
      console.error('密码修改失败:', error);
      alert('修改失败，请重试');
    }
  };

  const handleCloseDialog = () => {
    setDialogType(null);
    setSelectedUser(null);
    setBalanceAmount('');
    setBalanceDescription('');
    setLoginPassword('');
    setTradePassword('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和搜索 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="text-gray-600">管理平台用户信息和账户</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              总用户数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <div className="text-xs text-gray-500">累计注册用户</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              活跃用户
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
            <div className="text-xs text-gray-500">正常状态用户</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-600" />
              冻结用户
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.frozenUsers}</div>
            <div className="text-xs text-gray-500">被冻结的用户</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              总余额
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalBalance.toLocaleString()} USDT</div>
            <div className="text-xs text-gray-500">用户余额总计</div>
          </CardContent>
        </Card>
      </div>

      {/* 用户列表表格 */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                用户列表
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                共 <span className="font-semibold text-blue-600">{filteredUsers.length}</span> 位用户
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadUsers} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              <Button variant="outline" size="sm" onClick={async () => {
                console.log('🔧 开始数据库连接测试...');
                try {
                  const { AdminDataService } = await import('@/lib/database');
                  const testResult = await AdminDataService.testConnection();
                  console.log('✅ 数据库测试结果:', testResult);
                  alert(testResult.message);
                } catch (error) {
                  console.error('❌ 数据库测试失败:', error);
                  alert('数据库连接测试失败');
                }
              }}>
                🔧 测试连接
              </Button>
              <Button variant="outline" size="sm" onClick={async () => {
                console.log('🧪 开始功能测试...');
                try {
                  // 测试获取用户资料数据
                  const { AdminDataService } = await import('@/lib/database');
                  const { data: profiles } = await AdminDataService.getAllUserProfiles();
                  console.log('📋 获取到的用户资料数据:', profiles?.slice(0, 3));
                  
                  if (profiles && profiles.length > 0) {
                    const testUser = profiles[0];
                    console.log('🎯 测试用户:', {
                      id: testUser.id,
                      user_id: testUser.user_id,
                      username: testUser.username,
                      status: testUser.status
                    });
                    
                    alert(`功能测试完成，获取到 ${profiles.length} 个用户资料，详情请查看控制台`);
                  } else {
                    alert('未获取到用户数据');
                  }
                } catch (error) {
                  console.error('❌ 功能测试失败:', error);
                  alert('功能测试失败，详情请查看控制台');
                }
              }}>
                🧪 功能测试
              </Button>
              <Button variant="outline" size="sm" onClick={async () => {
                console.log('🔐 开始权限检测...');
                try {
                  const { AdminDataService } = await import('@/lib/database');
                  const permissionResult = await AdminDataService.checkPermissionLevel();
                  console.log('✅ 权限检测结果:', permissionResult);
                  alert(`权限检测完成：${permissionResult.message}`);
                } catch (error) {
                  console.error('❌ 权限检测失败:', error);
                  alert('权限检测失败');
                }
              }}>
                🔐 权限检测
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700 py-4 px-6 min-w-[280px]">
                    用户信息
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 px-4 min-w-[160px]">
                    所属上级
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 px-4 min-w-[120px]">
                    手机号
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 px-4 min-w-[120px]">
                    账户余额
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 px-4 min-w-[200px]">
                    USDT地址
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 px-4 min-w-[100px]">
                    账户状态
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 px-4 min-w-[160px]">
                    创建时间
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4 px-4 min-w-[120px] text-center">
                    操作
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3 text-gray-500">
                        <Users className="h-12 w-12 text-gray-300" />
                        <p className="text-lg font-medium">暂无用户数据</p>
                        <p className="text-sm">请检查数据库连接或添加用户</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user, index) => (
                    <TableRow 
                      key={user.id} 
                      className={`
                        hover:bg-blue-50/50 transition-all duration-200 border-b border-gray-100
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                      `}
                    >
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-12 w-12 ring-2 ring-blue-100 ring-offset-2">
                              <AvatarImage 
                                src={user.avatar_url || undefined} 
                                alt={user.username || ''} 
                                className="object-cover"
                              />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                {(user.username || user.full_name || 'U').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate">
                              {user.username || user.full_name || '未设置昵称'}
                            </div>
                            <div className="text-sm text-gray-500 truncate mt-1">
                              {user.email || '未设置邮箱'}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4 px-4">
                        <div className="text-sm text-gray-600">
                          {user.superior_email ? (
                            <div className="bg-blue-50 px-2 py-1 rounded-md text-blue-700 font-medium">
                              {user.superior_email}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">无上级</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4 px-4">
                        <div className="font-mono text-sm">
                          {user.phone ? (
                            <div className="bg-gray-50 px-2 py-1 rounded-md text-gray-700">
                              {user.phone}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">未设置</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <div className="font-bold text-green-600 text-lg">
                            {(user.balance || 0).toLocaleString()} USDT
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4 px-4">
                        <div className="font-mono text-xs">
                          {user.usdt_address ? (
                            <div className="group relative">
                              <div className="bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                                <div className="truncate max-w-[180px]">
                                  {user.usdt_address.length > 20 
                                    ? `${user.usdt_address.slice(0, 8)}...${user.usdt_address.slice(-8)}`
                                    : user.usdt_address
                                  }
                                </div>
                              </div>
                              <div className="absolute z-20 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-lg p-3 bottom-full left-0 mb-2 whitespace-nowrap shadow-lg border border-gray-700">
                                <div className="font-mono break-all max-w-xs">
                                  {user.usdt_address}
                                </div>
                                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-400 italic text-center">
                              未设置
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4 px-4">
                        <div className="flex justify-center">
                          {getStatusBadge(user.status)}
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4 px-4">
                        <div className="text-sm text-gray-600">
                          <div className="font-medium">
                            {new Date(user.created_at).toLocaleDateString('zh-CN')}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(user.created_at).toLocaleTimeString('zh-CN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4 px-4">
                        <div className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              align="end" 
                              className="w-56 shadow-lg border-0 bg-white/95 backdrop-blur-sm"
                            >
                              <div className="px-3 py-2 border-b border-gray-100">
                                <p className="text-sm font-medium text-gray-900">用户操作</p>
                                <p className="text-xs text-gray-500 truncate">
                                  {user.username || user.email}
                                </p>
                              </div>
                              
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUser(user);
                                  setBalanceType('add');
                                  setDialogType('balance');
                                }}
                                className="flex items-center gap-3 py-3 px-3 hover:bg-green-50 hover:text-green-700 transition-colors"
                              >
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <Plus className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <div className="font-medium">增加余额</div>
                                  <div className="text-xs text-gray-500">为用户账户充值</div>
                                </div>
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUser(user);
                                  setBalanceType('subtract');
                                  setDialogType('balance');
                                }}
                                className="flex items-center gap-3 py-3 px-3 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                              >
                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                  <Minus className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                  <div className="font-medium">减少余额</div>
                                  <div className="text-xs text-gray-500">扣除用户余额</div>
                                </div>
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator className="my-1" />
                              
                              <DropdownMenuItem 
                                onClick={async () => {
                                  console.log('🧪 开始测试用户状态更新...');
                                  try {
                                    const { AdminDataService } = await import('@/lib/database');
                                    const result = await AdminDataService.testUserStatusUpdate(user.id);
                                    
                                    if (result.success) {
                                      alert(`测试成功！${result.message}`);
                                      loadUsers(); // 刷新列表
                                    } else {
                                      alert(`测试失败：${result.error}`);
                                    }
                                  } catch (error) {
                                    console.error('❌ 测试异常:', error);
                                    alert('测试异常，请查看控制台');
                                  }
                                }}
                                className="flex items-center gap-3 py-3 px-3 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                              >
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                  <Zap className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                  <div className="font-medium">测试状态切换</div>
                                  <div className="text-xs text-gray-500">调试用功能</div>
                                </div>
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                onClick={async () => {
                                  console.log('🔍 开始检查用户数据...');
                                  try {
                                    const { AdminDataService } = await import('@/lib/database');
                                    await AdminDataService.debugUserData(user.id);
                                    alert('用户数据检查完成，请查看控制台详细信息');
                                  } catch (error) {
                                    console.error('❌ 数据检查异常:', error);
                                    alert('数据检查异常，请查看控制台');
                                  }
                                }}
                                className="flex items-center gap-3 py-3 px-3 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                              >
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Search className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium">检查用户数据</div>
                                  <div className="text-xs text-gray-500">调试用功能</div>
                                </div>
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                onClick={async () => {
                                  if (!confirm(`确定要安全删除用户 ${user.username || user.email} 吗？`)) {
                                    return;
                                  }
                                  console.log('🛡️ 开始安全删除用户...');
                                  try {
                                    const { AdminDataService } = await import('@/lib/database');
                                    const result = await AdminDataService.safeDeleteUser(user.id);
                                    
                                    if (result.success) {
                                      alert('用户安全删除成功！');
                                      loadUsers(); // 刷新列表
                                    } else {
                                      alert(`安全删除失败：${result.error}`);
                                    }
                                  } catch (error) {
                                    console.error('❌ 安全删除异常:', error);
                                    alert('安全删除异常，请查看控制台');
                                  }
                                }}
                                className="flex items-center gap-3 py-3 px-3 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                              >
                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                  <Shield className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                  <div className="font-medium">安全删除</div>
                                  <div className="text-xs text-gray-500">仅删除用户资料</div>
                                </div>
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                onClick={async () => {
                                  if (!confirm(`确定要强力调试删除用户 ${user.username || user.email} 吗？这将提供详细的删除过程信息。`)) {
                                    return;
                                  }
                                  console.log('🚀 开始强力调试删除...');
                                  try {
                                    const { AdminDataService } = await import('@/lib/database');
                                    const result = await AdminDataService.debugDeleteUser(user.id);
                                    
                                    if (result.success) {
                                      alert(`强力删除成功！${result.message || '删除完成'}`);
                                      loadUsers(); // 刷新列表
                                    } else {
                                      alert(`强力删除失败：${result.error}`);
                                    }
                                  } catch (error) {
                                    console.error('❌ 强力删除异常:', error);
                                    alert('强力删除异常，请查看控制台');
                                  }
                                }}
                                className="flex items-center gap-3 py-3 px-3 hover:bg-red-50 hover:text-red-700 transition-colors"
                              >
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </div>
                                <div>
                                  <div className="font-medium">强力调试删除</div>
                                  <div className="text-xs text-gray-500">详细删除过程</div>
                                </div>
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                onClick={async () => {
                                  if (!confirm(`确定要简单测试删除用户 ${user.username || user.email} 吗？这将测试RLS策略是否生效。`)) {
                                    return;
                                  }
                                  console.log('🧪 开始简单测试删除...');
                                  try {
                                    const { AdminDataService } = await import('@/lib/database');
                                    const result = await AdminDataService.simpleTestDelete(user.id);
                                    
                                    if (result.success) {
                                      alert('简单测试删除成功！RLS策略已生效');
                                      loadUsers(); // 刷新列表
                                    } else {
                                      alert(`简单测试删除失败：${result.error}`);
                                    }
                                  } catch (error) {
                                    console.error('❌ 简单测试删除异常:', error);
                                    alert('简单测试删除异常，请查看控制台');
                                  }
                                }}
                                className="flex items-center gap-3 py-3 px-3 hover:bg-green-50 hover:text-green-700 transition-colors"
                              >
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <Zap className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <div className="font-medium">简单测试删除</div>
                                  <div className="text-xs text-gray-500">测试RLS策略</div>
                                </div>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 余额操作对话框 */}
      <Dialog open={dialogType === 'balance'} onOpenChange={() => handleCloseDialog()}>
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-md w-full">
          <DialogHeader>
            <DialogTitle>
              {balanceType === 'add' ? '增加账户余额' : '减少账户余额'}
            </DialogTitle>
            <DialogDescription>
              用户: {selectedUser?.username || selectedUser?.full_name} ({selectedUser?.email})
              <br />
              当前余额: ¥{(selectedUser?.balance || 0).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">金额</Label>
              <Input
                id="amount"
                type="number"
                placeholder="请输入金额"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="description">操作说明</Label>
              <Textarea
                id="description"
                placeholder="请输入操作说明（可选）"
                value={balanceDescription}
                onChange={(e) => setBalanceDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              取消
            </Button>
            <Button 
              onClick={handleBalanceOperation}
              disabled={!balanceAmount}
            >
              确认{balanceType === 'add' ? '增加' : '减少'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 冻结/解冻确认对话框 */}
      <Dialog open={dialogType === 'freeze'} onOpenChange={() => handleCloseDialog()}>
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-md w-full">
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.status === 'active' ? '冻结用户账户' : '解冻用户账户'}
            </DialogTitle>
            <DialogDescription>
              确认要{selectedUser?.status === 'active' ? '冻结' : '解冻'}用户 {selectedUser?.username || selectedUser?.full_name} 的账户吗？
              <br />
              {selectedUser?.status === 'active' ? '冻结后用户将无法登录和进行交易。' : '解冻后用户可以正常使用系统。'}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              取消
            </Button>
            <Button 
              onClick={() => handleToggleUserStatus(selectedUser?.status === 'active')}
              variant={selectedUser?.status === 'active' ? 'destructive' : 'default'}
            >
              确认{selectedUser?.status === 'active' ? '冻结' : '解冻'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除用户确认对话框 */}
      <Dialog open={dialogType === 'delete'} onOpenChange={() => handleCloseDialog()}>
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-md w-full">
          <DialogHeader>
            <DialogTitle>删除用户账户</DialogTitle>
            <DialogDescription>
              ⚠️ 警告：此操作将永久删除用户 {selectedUser?.username || selectedUser?.full_name} ({selectedUser?.email}) 的账户和所有相关数据。
              <br />
              此操作无法撤销，请谨慎操作！
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              取消
            </Button>
            <Button 
              onClick={handleDeleteUser}
              variant="destructive"
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 修改密码对话框 */}
      <Dialog open={dialogType === 'password'} onOpenChange={() => handleCloseDialog()}>
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-md w-full">
          <DialogHeader>
            <DialogTitle>修改用户密码</DialogTitle>
            <DialogDescription>
              用户: {selectedUser?.username || selectedUser?.full_name} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="loginPassword">登录密码</Label>
              <Input
                id="loginPassword"
                type="password"
                placeholder="请输入新的登录密码（留空则不修改）"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="tradePassword">交易密码</Label>
              <Input
                id="tradePassword"
                type="password"
                placeholder="请输入新的交易密码（留空则不修改）"
                value={tradePassword}
                onChange={(e) => setTradePassword(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              取消
            </Button>
            <Button 
              onClick={handleUpdatePasswords}
              disabled={!loginPassword && !tradePassword}
            >
              确认修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserList; 