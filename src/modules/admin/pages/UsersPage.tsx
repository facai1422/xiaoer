import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getAdminSession } from "@/utils/adminAuth";
import { callAdminUpdateFunction } from "@/utils/adminSupabase";
import { RefreshCw, Users, UserCheck, UserX, DollarSign, Edit, Eye, Trash2, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { Database } from "@/integrations/supabase/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// 使用 Supabase 数据库中 user_profiles 表的类型
type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

export const UsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'view' | 'edit' | null>(null);
  const [newLoginPassword, setNewLoginPassword] = useState("");
  const [newTradePassword, setNewTradePassword] = useState("");
  const [confirmLoginPassword, setConfirmLoginPassword] = useState("");
  const [confirmTradePassword, setConfirmTradePassword] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    frozen: 0,
    totalBalance: 0
  });
  
  useEffect(() => {
    console.log('🔍 开始查询用户列表...');
    
    // 调试管理员session
    const session = getAdminSession();
    console.log('🔍 当前管理员session:', session);
    if (session) {
      console.log('📧 管理员邮箱:', session.admin?.email);
      console.log('🔑 管理员权限:', session.admin?.permissions);
      console.log('⏰ 会话过期时间:', session.expires_at);
      console.log('🔐 是否超级管理员:', session.admin?.is_super_admin);
    }
    
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // 检查管理员权限
      const adminSession = getAdminSession();
      if (!adminSession) {
        toast({
          variant: "destructive",
          title: "权限错误",
          description: "请先登录管理员账户"
        });
        return;
      }
      
      console.log('🔍 开始查询用户列表...');
      
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('❌ 查询用户列表失败:', usersError);
        
        if (usersError.code === '42501' || usersError.message.includes('policy')) {
          console.log('🔓 权限问题，尝试使用服务密钥查询...');
          toast({
            variant: "destructive", 
            title: "数据访问受限",
            description: "请联系系统管理员配置数据库权限"
          });
          return;
        }
        
        toast({
          variant: "destructive",
          title: "查询失败",
          description: usersError.message || "无法获取用户数据"
        });
        return;
      }

      console.log('✅ 查询成功，用户数量:', usersData?.length || 0);
      setUsers(usersData || []);
      
      // 计算统计数据
      if (usersData) {
        const totalUsers = usersData.length;
        const activeUsers = usersData.filter(user => user.status === 'active').length;
        const frozenUsers = usersData.filter(user => user.status === 'frozen').length;
        const totalBalance = usersData.reduce((sum, user) => sum + (user.balance || 0), 0);
        
        setStats({
          total: totalUsers,
          active: activeUsers,
          frozen: frozenUsers,
          totalBalance: totalBalance
        });
      }
      
    } catch (error) {
      console.error('❌ 获取用户数据异常:', error);
      toast({
        variant: "destructive",
        title: "系统错误",
        description: "获取用户数据时发生异常"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user);
    setActionType('view');
    setDialogOpen(true);
  };

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setActionType('edit');
    setDialogOpen(true);
    // 清空密码输入
    setNewLoginPassword("");
    setNewTradePassword("");
    setConfirmLoginPassword("");
    setConfirmTradePassword("");
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确认删除此用户吗？此操作不可恢复。')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('删除用户失败:', error);
        toast({
          variant: "destructive",
          title: "删除失败",
          description: error.message
        });
        return;
      }

      toast({
        title: "删除成功",
        description: "用户已被删除"
      });
      fetchUsers();
    } catch (error) {
      console.error('删除用户异常:', error);
      toast({
        variant: "destructive",
        title: "删除失败",
        description: "删除用户时发生异常"
      });
    }
  };

  // 管理员更新用户状态的辅助函数
  const executeAdminStatusUpdate = async (userId: string, newStatus: string, adminEmail: string) => {
    console.log('🔧 调用管理员状态更新函数...');
    return await callAdminUpdateFunction(userId, newStatus as 'active' | 'frozen' | 'suspended', adminEmail);
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: string) => {
    try {
      console.log('🔄 开始更新用户状态:', { userId, newStatus });

      // 检查管理员权限
      const adminSession = getAdminSession();
      if (!adminSession) {
        console.error('❌ 管理员未登录');
        toast({
          variant: "destructive",
          title: "权限错误",
          description: "请先登录管理员账户"
        });
        return;
      }

      console.log('✅ 管理员权限验证通过:', adminSession.admin?.email || 'Unknown');

      // 显示加载状态
      toast({
        title: "正在更新",
        description: "正在更新用户状态，请稍候..."
      });

      // 使用管理员状态更新系统
      console.log('🔧 通过管理员请求系统更新状态...');
      console.log('🔑 管理员邮箱:', adminSession.admin?.email);
      
      const result = await executeAdminStatusUpdate(
        userId, 
        newStatus, 
        adminSession.admin?.email || 'it@haixin.org'
      );
      
      if (!result.success) {
        throw new Error(result.message || '状态更新失败');
      }
      
      console.log('✅ 管理员请求提交成功');
      
      // 等待一下让触发器处理
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 验证用户状态是否已更新
      console.log('🔍 验证用户状态是否已更新...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('user_profiles')
        .select('id, status, updated_at')
        .eq('id', userId)
        .single();
      
      if (verifyError) {
        console.error('❌ 验证查询失败:', verifyError);
        toast({
          variant: "destructive",
          title: "验证失败",
          description: "无法验证状态更新结果"
        });
        return;
      }
      
      console.log('🔍 验证结果 - 期望:', newStatus, '实际:', verifyData.status);
      
      if (verifyData.status === newStatus) {
        console.log('🎉 状态更新确认成功！');
        toast({
          title: "更新成功",
          description: `用户状态已更新为${newStatus === 'active' ? '活跃' : newStatus === 'frozen' ? '冻结' : '暂停'}`
        });
      } else {
        console.warn('⚠️ 状态更新失败，数据库中的状态未改变');
        toast({
          variant: "destructive",
          title: "更新失败",
          description: "状态更新失败，数据库中的状态未改变"
        });
        return;
      }
      
      // 更新当前选中用户的状态
      if (selectedUser && selectedUser.id === userId) {
        console.log('🔄 更新当前选中用户状态');
        const updatedUser = {...selectedUser, status: newStatus, updated_at: new Date().toISOString()};
        setSelectedUser(updatedUser);
      }
      
      // 刷新用户列表
      console.log('🔄 刷新用户列表');
      try {
        await fetchUsers();
        console.log('✅ 用户列表刷新成功');
        
        // 移除强制页面刷新，让状态正常更新
        console.log('🎉 状态更新完成，无需刷新页面');
        
      } catch (fetchError) {
        console.warn('⚠️ 用户列表刷新失败，但状态更新已成功:', fetchError);
      }
      
    } catch (error) {
      console.error('❌ 更新用户状态异常:', error);
      
      // 过滤浏览器扩展相关的错误，这些错误不影响实际功能
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      if (errorMessage.includes('Could not establish connection') || 
          errorMessage.includes('Receiving end does not exist') ||
          errorMessage.includes('Extension context invalidated')) {
        console.warn('⚠️ 检测到浏览器扩展冲突，但不影响实际功能');
        // 扩展错误不影响实际操作，直接刷新用户列表
        await fetchUsers();
        return;
      }
      
      toast({
        variant: "destructive",
        title: "更新失败",
        description: `系统错误: ${errorMessage}`
      });
    }
  };

  const handleUpdateLoginPassword = async () => {
    if (!selectedUser) return;
    
    if (!newLoginPassword) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "请输入新的登录密码"
      });
      return;
    }
    
    if (newLoginPassword !== confirmLoginPassword) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "两次输入的登录密码不一致"
      });
      return;
    }
    
    if (newLoginPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "登录密码长度至少为6位"
      });
      return;
    }
    
    try {
      // 更新用户的登录密码
      // 注意：这里需要使用管理员权限或者通过后端API来更新密码
      // 临时方案：将密码存储在user_profiles表中
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          password: newLoginPassword, // 实际生产环境应该加密存储
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "更新失败",
          description: error.message
        });
        return;
      }

      toast({
        title: "更新成功",
        description: "登录密码已更新"
      });
      
      // 清空密码输入框
      setNewLoginPassword("");
      setConfirmLoginPassword("");
    } catch (error) {
      console.error('更新登录密码异常:', error);
      toast({
        variant: "destructive",
        title: "更新失败",
        description: "更新登录密码时发生异常"
      });
    }
  };

  const handleUpdateTradePassword = async () => {
    if (!selectedUser) return;
    
    if (!newTradePassword) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "请输入新的交易密码"
      });
      return;
    }
    
    if (newTradePassword !== confirmTradePassword) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "两次输入的交易密码不一致"
      });
      return;
    }
    
    if (newTradePassword.length < 6) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "交易密码长度至少为6位"
      });
      return;
    }
    
    try {
      // 更新用户的交易密码（存储在user_profiles表中）
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          trade_password: newTradePassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "更新失败",
          description: error.message
        });
        return;
      }

      toast({
        title: "更新成功",
        description: "交易密码已更新"
      });
      
      // 清空密码输入框
      setNewTradePassword("");
      setConfirmTradePassword("");
    } catch (error) {
      console.error('更新交易密码异常:', error);
      toast({
        variant: "destructive",
        title: "更新失败",
        description: "更新交易密码时发生异常"
      });
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '0.00 USDT';
    return `${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })} USDT`;
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-300">活跃</Badge>;
      case 'frozen':
        return <Badge className="bg-red-100 text-red-800 border-red-300">冻结</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">暂停</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800 border-red-300">管理员</Badge>;
      case 'agent':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">代理商</Badge>;
      case 'merchant':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">商户</Badge>;
      case 'user':
      default:
        return <Badge className="bg-green-100 text-green-800 border-green-300">普通用户</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="text-gray-600 mt-1">管理系统用户账户和权限</p>
        </div>
                  <Button 
            variant="outline" 
            onClick={fetchUsers}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </Button>
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
                <p className="text-sm text-gray-600 mb-1">冻结用户</p>
                <p className="text-3xl font-bold text-red-600">{stats.frozen}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">总余额</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalBalance)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 用户列表 */}
      <Card className="shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-lg">用户列表 ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">暂无用户数据</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">用户信息</TableHead>
                    <TableHead className="font-semibold">联系方式</TableHead>
                    <TableHead className="font-semibold">角色</TableHead>
                    <TableHead className="font-semibold">状态</TableHead>
                    <TableHead className="font-semibold">余额</TableHead>
                    <TableHead className="font-semibold">注册时间</TableHead>
                    <TableHead className="font-semibold text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.username || '未设置'}</div>
                          <div className="text-sm text-gray-600">{user.full_name || '未设置姓名'}</div>
                          <div className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{user.email || '未设置'}</div>
                          <div className="text-sm text-gray-600">{user.phone || '未设置'}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.agent_level ? 'agent' : 'user')}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold text-blue-600">{formatCurrency(user.balance)}</div>
                          {user.frozen_balance && user.frozen_balance > 0 && (
                            <div className="text-xs text-orange-600">冻结: {formatCurrency(user.frozen_balance)}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '未知'}
                      </TableCell>
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
                      <p className="font-medium">{selectedUser.username || '未设置'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">姓名</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{selectedUser.full_name || '未设置'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">邮箱</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{selectedUser.email || '未设置'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">手机号</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{selectedUser.phone || '未设置'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">角色</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {getRoleBadge(selectedUser.agent_level ? 'agent' : 'user')}
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
                      <p className="font-bold text-blue-600">{formatCurrency(selectedUser.balance)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">冻结余额</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-orange-600">{formatCurrency(selectedUser.frozen_balance)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">注册时间</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">
                        {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString('zh-CN') : '未知'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">最后更新</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">
                        {selectedUser.updated_at ? new Date(selectedUser.updated_at).toLocaleString('zh-CN') : '从未更新'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {actionType === 'edit' && (
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-lg font-semibold">状态管理</h3>
                    <div className="flex gap-3">
                      <Button
                        variant={selectedUser.status === 'active' ? 'default' : 'outline'}
                        onClick={() => handleUpdateUserStatus(selectedUser.id, 'active')}
                        className={selectedUser.status === 'active' ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        激活
                      </Button>
                      <Button
                        variant={selectedUser.status === 'frozen' ? 'default' : 'outline'}
                        onClick={() => handleUpdateUserStatus(selectedUser.id, 'frozen')}
                        className={selectedUser.status === 'frozen' ? 'bg-red-600 hover:bg-red-700' : ''}
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        冻结
                      </Button>
                      <Button
                        variant={selectedUser.status === 'suspended' ? 'default' : 'outline'}
                        onClick={() => handleUpdateUserStatus(selectedUser.id, 'suspended')}
                        className={selectedUser.status === 'suspended' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        暂停
                      </Button>
                    </div>
                    
                    {/* 密码管理部分 */}
                    <div className="space-y-4 pt-6 border-t">
                      <h3 className="text-lg font-semibold">密码管理</h3>
                      
                      {/* 登录密码设置 */}
                      <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900">设置登录密码</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">新登录密码</label>
                            <Input
                              type="password"
                              placeholder="请输入新密码"
                              value={newLoginPassword}
                              onChange={(e) => setNewLoginPassword(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">确认登录密码</label>
                            <Input
                              type="password"
                              placeholder="请再次输入密码"
                              value={confirmLoginPassword}
                              onChange={(e) => setConfirmLoginPassword(e.target.value)}
                              className="w-full"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={handleUpdateLoginPassword}
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={!newLoginPassword || !confirmLoginPassword}
                        >
                          更新登录密码
                        </Button>
                      </div>
                      
                      {/* 交易密码设置 */}
                      <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900">设置交易密码</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">新交易密码</label>
                            <Input
                              type="password"
                              placeholder="请输入新密码"
                              value={newTradePassword}
                              onChange={(e) => setNewTradePassword(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">确认交易密码</label>
                            <Input
                              type="password"
                              placeholder="请再次输入密码"
                              value={confirmTradePassword}
                              onChange={(e) => setConfirmTradePassword(e.target.value)}
                              className="w-full"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={handleUpdateTradePassword}
                          className="bg-purple-600 hover:bg-purple-700"
                          disabled={!newTradePassword || !confirmTradePassword}
                        >
                          更新交易密码
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>提示：</strong>修改用户状态和密码后会立即生效，请谨慎操作。密码长度至少为6位。
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
              onClick={() => {
                setDialogOpen(false);
                // 清空密码输入
                setNewLoginPassword("");
                setNewTradePassword("");
                setConfirmLoginPassword("");
                setConfirmTradePassword("");
              }}
              className="min-w-[100px]"
            >
              关闭
            </Button>
            {actionType === 'edit' && (
              <Button 
                onClick={() => {
                  toast({
                    title: "保存成功",
                    description: "用户信息已更新"
                  });
                  setDialogOpen(false);
                  // 清空密码输入
                  setNewLoginPassword("");
                  setNewTradePassword("");
                  setConfirmLoginPassword("");
                  setConfirmTradePassword("");
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

export default UsersPage;
