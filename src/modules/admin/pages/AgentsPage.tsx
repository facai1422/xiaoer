import { useState, useEffect } from 'react';
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getAdminSession } from "@/utils/adminAuth";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  RefreshCw, 
  Users, 
  UserCheck, 
  DollarSign, 
  TrendingUp,
  Link as LinkIcon,
  Copy,
  MoreHorizontal,
  Edit,
  Lock,
  Ban,
  Eye,
  Settings,
  Key,
  Shield
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Database } from "@/integrations/supabase/types";

// 代理信息类型
type AgentProfile = Database['public']['Tables']['user_profiles']['Row'] & {
  today_orders?: number;
  today_withdrawals?: number;
  subordinate_count?: number;
  exchange_rate?: number;
};

// 下级用户类型
type SubordinateUser = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  balance: number;
  created_at: string;
  last_login_at?: string;
};

export const AgentsPage = () => {
  const { toast } = useToast();
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    frozen: 0,
    totalBalance: 0,
    todayOrders: 0,
    todayWithdrawals: 0
  });

  // 弹窗状态
  const [isSubordinatesOpen, setIsSubordinatesOpen] = useState(false);
  const [isEditPasswordOpen, setIsEditPasswordOpen] = useState(false);
  const [isEditRateOpen, setIsEditRateOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);
  const [subordinates, setSubordinates] = useState<SubordinateUser[]>([]);

  // 表单状态
  const [newPassword, setNewPassword] = useState("");
  const [newTradingPassword, setNewTradingPassword] = useState("");
  const [newExchangeRate, setNewExchangeRate] = useState("");

  // 代理链接生成
  const generateAgentLink = (agentId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?ref=${agentId}`;
  };

  // 复制链接到剪贴板
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "复制成功",
        description: `${label}已复制到剪贴板`
      });
    }).catch(() => {
      toast({
        variant: "destructive",
        title: "复制失败",
        description: "请手动复制链接"
      });
    });
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      
      const adminSession = getAdminSession();
      if (!adminSession) {
        toast({
          variant: "destructive",
          title: "权限错误",
          description: "请先登录管理员账户"
        });
        return;
      }
      
      // 查询代理用户
      const { data: agentsData, error: agentsError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'agent')
        .order('created_at', { ascending: false });

      if (agentsError) {
        console.error('查询代理列表失败:', agentsError);
        toast({
          variant: "destructive",
          title: "查询失败",
          description: agentsError.message || "无法获取代理数据"
        });
        return;
      }

      // 为每个代理添加统计数据（模拟数据，实际项目中需要从订单表查询）
      const enrichedAgents = agentsData?.map(agent => ({
        ...agent,
        today_orders: Math.floor(Math.random() * 100000) + 10000, // 模拟今日订单金额
        today_withdrawals: Math.floor(Math.random() * 50000) + 5000, // 模拟今日提现金额
        subordinate_count: Math.floor(Math.random() * 50) + 5, // 模拟下级人数
        exchange_rate: 0.85 + Math.random() * 0.1 // 模拟汇率 0.85-0.95
      })) || [];

      setAgents(enrichedAgents);
      
      // 计算统计数据
      if (enrichedAgents) {
        const totalAgents = enrichedAgents.length;
        const activeAgents = enrichedAgents.filter(agent => agent.status === 'active').length;
        const frozenAgents = enrichedAgents.filter(agent => agent.status === 'frozen').length;
        const totalBalance = enrichedAgents.reduce((sum, agent) => sum + (agent.balance || 0), 0);
        const todayOrders = enrichedAgents.reduce((sum, agent) => sum + (agent.today_orders || 0), 0);
        const todayWithdrawals = enrichedAgents.reduce((sum, agent) => sum + (agent.today_withdrawals || 0), 0);
        
        setStats({
          total: totalAgents,
          active: activeAgents,
          frozen: frozenAgents,
          totalBalance: totalBalance,
          todayOrders: todayOrders,
          todayWithdrawals: todayWithdrawals
        });
      }
      
    } catch (error) {
      console.error('获取代理数据异常:', error);
      toast({
        variant: "destructive",
        title: "系统错误",
        description: "获取代理数据时发生异常"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 查看下级用户
  const viewSubordinates = async (agent: AgentProfile) => {
    setSelectedAgent(agent);
    
    // 模拟下级用户数据（实际项目中需要查询推荐关系表）
    const mockSubordinates: SubordinateUser[] = [];
    for (let i = 0; i < (agent.subordinate_count || 0); i++) {
      mockSubordinates.push({
        id: `sub-${agent.id}-${i}`,
        username: `user_${Math.floor(Math.random() * 10000)}`,
        full_name: `用户${i + 1}`,
        email: `user${i + 1}@example.com`,
        phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        status: Math.random() > 0.2 ? 'active' : 'frozen',
        balance: Math.floor(Math.random() * 50000) + 1000,
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        last_login_at: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
      });
    }
    
    setSubordinates(mockSubordinates);
    setIsSubordinatesOpen(true);
  };

  // 修改密码
  const handlePasswordEdit = (agent: AgentProfile) => {
    setSelectedAgent(agent);
    setNewPassword("");
    setNewTradingPassword("");
    setIsEditPasswordOpen(true);
  };

  // 修改汇率
  const handleRateEdit = (agent: AgentProfile) => {
    setSelectedAgent(agent);
    setNewExchangeRate((agent.exchange_rate || 0.85).toString());
    setIsEditRateOpen(true);
  };

  // 冻结/解冻账户
  const toggleAccountStatus = async (agent: AgentProfile) => {
    try {
      const newStatus = agent.status === 'active' ? 'frozen' : 'active';
      
      // 这里应该调用API更新状态
      toast({
        title: "操作成功",
        description: `已${newStatus === 'frozen' ? '冻结' : '解冻'}代理账户: ${agent.username}`
      });
      
      fetchAgents(); // 刷新列表
    } catch (error) {
      toast({
        variant: "destructive",
        title: "操作失败",
        description: "状态更新失败，请重试"
      });
    }
  };

  // 保存密码修改
  const savePasswordChanges = async () => {
    if (!selectedAgent || (!newPassword && !newTradingPassword)) {
      toast({
        variant: "destructive",
        title: "参数错误",
        description: "请至少填写一个密码"
      });
      return;
    }

    try {
      // 这里应该调用API更新密码
      toast({
        title: "修改成功",
        description: `已更新代理 ${selectedAgent.username} 的密码`
      });
      
      setIsEditPasswordOpen(false);
      setNewPassword("");
      setNewTradingPassword("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "修改失败",
        description: "密码更新失败，请重试"
      });
    }
  };

  // 保存汇率修改
  const saveRateChanges = async () => {
    if (!selectedAgent || !newExchangeRate) {
      toast({
        variant: "destructive",
        title: "参数错误",
        description: "请输入有效的汇率"
      });
      return;
    }

    const rate = parseFloat(newExchangeRate);
    if (isNaN(rate) || rate <= 0 || rate > 1) {
      toast({
        variant: "destructive",
        title: "参数错误",
        description: "汇率必须在0-1之间"
      });
      return;
    }

    try {
      // 这里应该调用API更新汇率
      toast({
        title: "修改成功",
        description: `已更新代理 ${selectedAgent.username} 的汇率为 ${rate}`
      });
      
      setIsEditRateOpen(false);
      fetchAgents(); // 刷新列表
    } catch (error) {
      toast({
        variant: "destructive",
        title: "修改失败",
        description: "汇率更新失败，请重试"
      });
    }
  };

  const filteredAgents = agents.filter(agent => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      agent.username?.toLowerCase().includes(searchLower) ||
      agent.full_name?.toLowerCase().includes(searchLower) ||
      agent.email?.toLowerCase().includes(searchLower) ||
      agent.phone?.includes(searchTerm)
    );
  });

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '¥0.00';
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return (
          <div className="neu-success px-4 py-2 rounded-full text-base font-medium neu-fade-in">
            活跃
          </div>
        );
      case 'frozen':
        return (
          <div className="neu-danger px-4 py-2 rounded-full text-base font-medium neu-fade-in">
            冻结
          </div>
        );
      default:
        return (
          <div className="neu-card px-4 py-2 rounded-full text-base font-medium neu-text-muted neu-fade-in">
            未知
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center p-12 min-h-screen"
        style={{
          background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
        }}
      >
        <div className="text-center neu-container p-12">
          <div className="neu-card w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center neu-rotate">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
          <p className="text-xl neu-text-primary font-medium">加载代理数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4 neu-fade-in"
      style={{
        background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
      }}
    >
      <div className="max-w-full mx-auto space-y-8">
        {/* 页面标题 - 放大 */}
        <div className="neu-container p-8 neu-slide-in">
          <h1 className="text-4xl font-bold neu-text-primary mb-3 neu-float">代理管理</h1>
          <p className="neu-text-muted text-lg">管理平台代理商和推广链接</p>
        </div>

        {/* 统计卡片 - 放大 */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* 代理总数 */}
          <div className="neu-card neu-interactive p-8 neu-slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium neu-text-muted mb-2">代理总数</p>
                <p className="text-3xl font-bold neu-text-primary neu-bounce">{stats.total}</p>
              </div>
              <div className="neu-card p-4 rounded-xl">
                <Users className="h-8 w-8 text-blue-600 neu-float" />
              </div>
            </div>
          </div>

          {/* 活跃代理 */}
          <div className="neu-card neu-interactive p-8 neu-slide-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium neu-text-muted mb-2">活跃代理</p>
                <p className="text-3xl font-bold text-green-600 neu-bounce">{stats.active}</p>
              </div>
              <div className="neu-success p-4 rounded-xl">
                <UserCheck className="h-8 w-8 text-green-600 neu-float" />
              </div>
            </div>
          </div>

          {/* 冻结代理 */}
          <div className="neu-card neu-interactive p-8 neu-slide-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium neu-text-muted mb-2">冻结代理</p>
                <p className="text-3xl font-bold text-red-600 neu-bounce">{stats.frozen}</p>
              </div>
              <div className="neu-danger p-4 rounded-xl">
                <Ban className="h-8 w-8 text-red-600 neu-float" />
              </div>
            </div>
          </div>

          {/* 总资产 */}
          <div className="neu-card neu-interactive p-8 neu-slide-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium neu-text-muted mb-2">总资产</p>
                <p className="text-xl font-bold text-blue-600 neu-bounce">{formatCurrency(stats.totalBalance)}</p>
              </div>
              <div className="neu-primary p-4 rounded-xl">
                <DollarSign className="h-8 w-8 text-blue-600 neu-float" />
              </div>
            </div>
          </div>

          {/* 今日订单 */}
          <div className="neu-card neu-interactive p-8 neu-slide-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium neu-text-muted mb-2">今日订单</p>
                <p className="text-xl font-bold text-orange-600 neu-bounce">{formatCurrency(stats.todayOrders)}</p>
              </div>
              <div className="neu-warning p-4 rounded-xl">
                <TrendingUp className="h-8 w-8 text-orange-600 neu-float" />
              </div>
            </div>
          </div>

          {/* 今日提现 */}
          <div className="neu-card neu-interactive p-8 neu-slide-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium neu-text-muted mb-2">今日提现</p>
                <p className="text-xl font-bold text-purple-600 neu-bounce">{formatCurrency(stats.todayWithdrawals)}</p>
              </div>
              <div className="neu-card p-4 rounded-xl" style={{ background: 'linear-gradient(145deg, #f3e8ff, #e9d5ff)' }}>
                <DollarSign className="h-8 w-8 text-purple-600 neu-float" />
              </div>
            </div>
          </div>
        </div>

        {/* 搜索和操作栏 - 放大 */}
        <div className="neu-container p-8 neu-fade-in">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="搜索代理（用户名、姓名、邮箱、手机号）..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neu-input w-full pl-14 pr-6 py-4 neu-text-primary text-base placeholder:neu-text-muted focus:outline-none"
              />
            </div>
            <button 
              onClick={fetchAgents}
              disabled={isLoading}
              className="neu-button neu-primary px-8 py-4 text-white font-medium text-base flex items-center space-x-3 disabled:opacity-50"
            >
              <RefreshCw className={`h-6 w-6 ${isLoading ? 'neu-rotate' : ''}`} />
              <span>刷新</span>
            </button>
          </div>
        </div>

        {/* 代理列表 - 优化表格布局 */}
        <div className="neu-container neu-fade-in">
          <div className="neu-panel">
            <div className="mb-8">
              <h2 className="text-2xl font-bold neu-text-primary mb-3">代理列表</h2>
              <p className="neu-text-muted text-base">
                找到 <span className="font-semibold text-blue-600 text-lg">{filteredAgents.length}</span> 个代理
                {searchTerm && (
                  <span className="neu-text-muted"> (搜索: "<span className="font-medium">{searchTerm}</span>")</span>
                )}
              </p>
            </div>
            
            <div className="neu-panel overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1400px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-6 px-6 font-semibold neu-text-primary text-base min-w-[200px]">代理信息</th>
                      <th className="text-left py-6 px-6 font-semibold neu-text-primary text-base min-w-[120px]">推广链接</th>
                      <th className="text-left py-6 px-6 font-semibold neu-text-primary text-base min-w-[140px]">今日订单</th>
                      <th className="text-left py-6 px-6 font-semibold neu-text-primary text-base min-w-[140px]">今日提现</th>
                      <th className="text-left py-6 px-6 font-semibold neu-text-primary text-base min-w-[100px]">下级人数</th>
                      <th className="text-left py-6 px-6 font-semibold neu-text-primary text-base min-w-[140px]">账户余额</th>
                      <th className="text-left py-6 px-6 font-semibold neu-text-primary text-base min-w-[100px]">订单汇率</th>
                      <th className="text-left py-6 px-6 font-semibold neu-text-primary text-base min-w-[100px]">状态</th>
                      <th className="text-left py-6 px-6 font-semibold neu-text-primary text-base min-w-[120px]">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgents.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-16">
                          <div className="neu-card p-12 mx-4 rounded-2xl neu-fade-in">
                            <Users className="h-20 w-20 text-gray-400 mx-auto mb-6 neu-float" />
                            <p className="text-xl neu-text-secondary font-medium">
                              {searchTerm ? '未找到匹配的代理' : '暂无代理数据'}
                            </p>
                            {searchTerm && (
                              <p className="neu-text-muted mt-3 text-base">请尝试其他搜索关键词</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAgents.map((agent, index) => (
                        <tr 
                          key={agent.id} 
                          className="border-b border-gray-100 hover:bg-gray-50/50 transition-all duration-200 neu-slide-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          {/* 代理信息 */}
                          <td className="py-6 px-6">
                            <div className="neu-card p-4 rounded-xl inline-block">
                              <div className="font-semibold neu-text-primary text-base">{agent.username || '未设置'}</div>
                              <div className="text-sm neu-text-secondary mt-2">
                                {agent.full_name || '未设置姓名'}
                              </div>
                              <div className="text-xs neu-text-muted mt-1">{agent.email}</div>
                            </div>
                          </td>

                          {/* 推广链接 - 横向布局 */}
                          <td className="py-6 px-6">
                            <button
                              onClick={() => copyToClipboard(generateAgentLink(agent.id), '推广链接')}
                              className="neu-button neu-primary px-4 py-3 text-sm font-medium text-blue-600 flex items-center space-x-2 whitespace-nowrap"
                            >
                              <LinkIcon className="h-4 w-4 flex-shrink-0" />
                              <span className="hidden sm:inline">复制链接</span>
                              <span className="sm:hidden">复制</span>
                            </button>
                          </td>

                          {/* 今日订单 */}
                          <td className="py-6 px-6">
                            <div className="neu-card p-4 rounded-xl">
                              <div className="font-bold text-lg text-orange-600">
                                {formatCurrency(agent.today_orders || 0)}
                              </div>
                            </div>
                          </td>

                          {/* 今日提现 */}
                          <td className="py-6 px-6">
                            <div className="neu-card p-4 rounded-xl">
                              <div className="font-bold text-lg text-purple-600">
                                {formatCurrency(agent.today_withdrawals || 0)}
                              </div>
                            </div>
                          </td>

                          {/* 下级人数 */}
                          <td className="py-6 px-6">
                            <button
                              onClick={() => viewSubordinates(agent)}
                              className="neu-button neu-success px-4 py-3 text-sm font-medium text-green-600 flex items-center space-x-2"
                            >
                              <Users className="h-4 w-4" />
                              <span>{agent.subordinate_count || 0}</span>
                            </button>
                          </td>

                          {/* 账户余额 */}
                          <td className="py-6 px-6">
                            <div className="neu-card p-4 rounded-xl">
                              <div className="font-bold text-lg neu-text-primary">
                                {formatCurrency(agent.balance)}
                              </div>
                            </div>
                          </td>

                          {/* 订单汇率 */}
                          <td className="py-6 px-6">
                            <div className="neu-card p-4 rounded-xl">
                              <div className="font-bold text-lg text-blue-600">
                                {((agent.exchange_rate || 0.85) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </td>

                          {/* 状态 */}
                          <td className="py-6 px-6">
                            {getStatusBadge(agent.status)}
                          </td>

                          {/* 操作 */}
                          <td className="py-6 px-6">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button 
                                  className="neu-button p-3 rounded-xl"
                                  title="更多操作"
                                  aria-label="更多操作"
                                >
                                  <MoreHorizontal className="h-6 w-6 neu-text-secondary" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="neu-card border-0 shadow-none min-w-[150px]">
                                <DropdownMenuItem onClick={() => handlePasswordEdit(agent)} className="py-3 text-base">
                                  <Key className="h-5 w-5 mr-3" />
                                  修改密码
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRateEdit(agent)} className="py-3 text-base">
                                  <Edit className="h-5 w-5 mr-3" />
                                  修改汇率
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => toggleAccountStatus(agent)}
                                  className={`py-3 text-base ${agent.status === 'active' ? 'text-red-600' : 'text-green-600'}`}
                                >
                                  {agent.status === 'active' ? (
                                    <>
                                      <Ban className="h-5 w-5 mr-3" />
                                      冻结账户
                                    </>
                                  ) : (
                                    <>
                                      <Shield className="h-5 w-5 mr-3" />
                                      解冻账户
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 下级用户弹窗 */}
      <Dialog open={isSubordinatesOpen} onOpenChange={setIsSubordinatesOpen}>
        <DialogContent 
          className="max-w-4xl neu-card border-0 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          style={{
            background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          {/* 彩色动态边框 */}
          <div 
            className="absolute inset-0 rounded-xl opacity-75 -z-10"
            style={{
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)',
              backgroundSize: '400% 400%',
              animation: 'gradientShift 6s ease infinite',
              padding: '3px',
              borderRadius: '12px'
            }}
          >
            <div 
              className="w-full h-full rounded-xl"
              style={{
                background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                borderRadius: '9px'
              }}
            />
          </div>
          
          <DialogHeader className="relative z-10">
            <DialogTitle className="neu-text-primary">
              下级用户列表 - {selectedAgent?.username}
            </DialogTitle>
            <DialogDescription className="neu-text-muted">
              查看该代理的所有下级用户信息
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-96 overflow-y-auto relative z-10">
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold neu-text-primary text-base">用户名</th>
                  <th className="text-left py-4 px-6 font-semibold neu-text-primary text-base">姓名</th>
                  <th className="text-left py-4 px-6 font-semibold neu-text-primary text-base">联系方式</th>
                  <th className="text-left py-4 px-6 font-semibold neu-text-primary text-base">状态</th>
                  <th className="text-left py-4 px-6 font-semibold neu-text-primary text-base">余额</th>
                  <th className="text-left py-4 px-6 font-semibold neu-text-primary text-base">注册时间</th>
                </tr>
              </thead>
              <tbody>
                {subordinates.map((user, index) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-4 px-6 neu-text-primary font-medium text-base">{user.username}</td>
                    <td className="py-4 px-6 neu-text-secondary text-base">{user.full_name}</td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="text-sm neu-text-secondary">{user.email}</div>
                        <div className="text-sm neu-text-muted">{user.phone}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(user.status)}</td>
                    <td className="py-4 px-6 font-bold neu-text-primary text-base">{formatCurrency(user.balance)}</td>
                    <td className="py-4 px-6 neu-text-muted text-sm">
                      {new Date(user.created_at).toLocaleDateString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* 修改密码弹窗 */}
      <Dialog open={isEditPasswordOpen} onOpenChange={setIsEditPasswordOpen}>
        <DialogContent 
          className="neu-card border-0 max-w-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          style={{
            background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          {/* 彩色动态边框 */}
          <div 
            className="absolute inset-0 rounded-xl opacity-75 -z-10"
            style={{
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)',
              backgroundSize: '400% 400%',
              animation: 'gradientShift 6s ease infinite',
              padding: '3px',
              borderRadius: '12px'
            }}
          >
            <div 
              className="w-full h-full rounded-xl"
              style={{
                background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                borderRadius: '9px'
              }}
            />
          </div>
          
          <DialogHeader className="pb-4 relative z-10">
            <DialogTitle className="neu-text-primary text-xl">修改密码 - {selectedAgent?.username}</DialogTitle>
            <DialogDescription className="neu-text-muted text-base">
              修改代理的登录密码和交易密码
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 relative z-10">
            <div>
              <label className="block text-base font-medium neu-text-primary mb-3">
                新登录密码（留空则不修改）
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="neu-input w-full px-4 py-4 neu-text-primary text-base"
                placeholder="请输入新的登录密码"
              />
            </div>
            
            <div>
              <label className="block text-base font-medium neu-text-primary mb-3">
                新交易密码（留空则不修改）
              </label>
              <input
                type="password"
                value={newTradingPassword}
                onChange={(e) => setNewTradingPassword(e.target.value)}
                className="neu-input w-full px-4 py-4 neu-text-primary text-base"
                placeholder="请输入新的交易密码"
              />
            </div>
          </div>
          
          <DialogFooter className="pt-6 relative z-10">
            <button
              onClick={() => setIsEditPasswordOpen(false)}
              className="neu-button px-6 py-3 neu-text-secondary text-base"
            >
              取消
            </button>
            <button
              onClick={savePasswordChanges}
              className="neu-button neu-primary px-6 py-3 text-white font-medium text-base"
            >
              保存修改
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 修改汇率弹窗 */}
      <Dialog open={isEditRateOpen} onOpenChange={setIsEditRateOpen}>
        <DialogContent 
          className="neu-card border-0 max-w-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          style={{
            background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          {/* 彩色动态边框 */}
          <div 
            className="absolute inset-0 rounded-xl opacity-75 -z-10"
            style={{
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)',
              backgroundSize: '400% 400%',
              animation: 'gradientShift 6s ease infinite',
              padding: '3px',
              borderRadius: '12px'
            }}
          >
            <div 
              className="w-full h-full rounded-xl"
              style={{
                background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                borderRadius: '9px'
              }}
            />
          </div>
          
          <DialogHeader className="pb-4 relative z-10">
            <DialogTitle className="neu-text-primary text-xl">修改订单汇率 - {selectedAgent?.username}</DialogTitle>
            <DialogDescription className="neu-text-muted text-base">
              设置该代理的订单汇率（0-1之间的小数）
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 relative z-10">
            <div>
              <label className="block text-base font-medium neu-text-primary mb-3">
                订单汇率
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={newExchangeRate}
                onChange={(e) => setNewExchangeRate(e.target.value)}
                className="neu-input w-full px-4 py-4 neu-text-primary text-base"
                placeholder="例如：0.85"
              />
              <p className="text-sm neu-text-muted mt-2">
                汇率越高，代理获得的分润越多。建议范围：0.75-0.95
              </p>
            </div>
          </div>
          
          <DialogFooter className="pt-6 relative z-10">
            <button
              onClick={() => setIsEditRateOpen(false)}
              className="neu-button px-6 py-3 neu-text-secondary text-base"
            >
              取消
            </button>
            <button
              onClick={saveRateChanges}
              className="neu-button neu-primary px-6 py-3 text-white font-medium text-base"
            >
              保存修改
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentsPage; 