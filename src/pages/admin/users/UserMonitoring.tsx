import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Shield, 
  Activity,
  Users,
  DollarSign,
  Clock,
  Eye,
  AlertCircle
} from "lucide-react";
import { UserManagementService, type UserRiskData } from '@/services/userManagementService';

export const UserMonitoring = () => {
  const [users, setUsers] = useState<UserRiskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedUser, setSelectedUser] = useState<UserRiskData | null>(null);
  const [dialogType, setDialogType] = useState<'details' | 'handle' | null>(null);
  const [handleNotes, setHandleNotes] = useState('');

  // 加载用户风险数据
  const loadUserRiskData = async () => {
    try {
      setLoading(true);
      const { data, error } = await UserManagementService.getUserRiskData();
      
      if (error) {
        console.error('获取用户风险数据失败:', error);
        return;
      }
      
      setUsers(data || []);
    } catch (error) {
      console.error('加载用户风险数据异常:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserRiskData();
  }, [selectedTimeRange]);

  const getRiskBadge = (level: UserRiskData['riskLevel']) => {
    switch (level) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">低风险</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">中风险</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">高风险</Badge>;
      default:
        return <Badge variant="secondary">未知</Badge>;
    }
  };

  const getRiskColor = (level: UserRiskData['riskLevel']) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleViewDetails = (user: UserRiskData) => {
    setSelectedUser(user);
    setDialogType('details');
  };

  const handleProcessUser = (user: UserRiskData) => {
    setSelectedUser(user);
    setDialogType('handle');
  };

  const handleSubmitProcess = async () => {
    if (!selectedUser || !handleNotes.trim()) return;
    
    // 模拟处理操作
    console.log('处理用户风险:', {
      userId: selectedUser.id,
      userEmail: selectedUser.email,
      riskLevel: selectedUser.riskLevel,
      notes: handleNotes,
      timestamp: new Date().toISOString()
    });
    
    // 更新用户风险等级（示例：降低风险等级）
    setUsers(prev => prev.map(user => {
      if (user.id === selectedUser.id) {
        return {
          ...user,
          riskLevel: 'medium' as UserRiskData['riskLevel'],
          riskScore: Math.max(user.riskScore - 20, 0),
          suspiciousCount: Math.max(user.suspiciousCount - 5, 0)
        };
      }
      return user;
    }));
    
    // 关闭对话框并清空状态
    setDialogType(null);
    setSelectedUser(null);
    setHandleNotes('');
    
    // 显示成功提示（在实际项目中可能会用toast）
    alert('用户风险处理成功！');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  const lowRiskCount = users.filter(u => u.riskLevel === 'low').length;
  const mediumRiskCount = users.filter(u => u.riskLevel === 'medium').length;
  const highRiskCount = users.filter(u => u.riskLevel === 'high').length;
  const totalSuspicious = users.reduce((sum, u) => sum + u.suspiciousCount, 0);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">账户监控</h1>
          <p className="text-gray-600">用户账户状态和风险监控</p>
        </div>
        <div className="flex items-center gap-3">
          {['24h', '7d', '30d'].map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* 风险概览统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              低风险用户
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{lowRiskCount}</div>
            <div className="text-xs text-gray-500">风险评分 ≤ 30</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              中风险用户
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mediumRiskCount}</div>
            <div className="text-xs text-gray-500">风险评分 31-70</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-600" />
              高风险用户
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highRiskCount}</div>
            <div className="text-xs text-gray-500">风险评分 &gt; 70</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-600" />
              可疑行为
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalSuspicious}</div>
            <div className="text-xs text-gray-500">待处理事件</div>
          </CardContent>
        </Card>
      </div>

      {/* 风险用户列表 */}
      <Card>
        <CardHeader>
          <CardTitle>风险用户监控</CardTitle>
          <CardDescription>按风险等级排序的用户列表</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无用户风险数据
            </div>
          ) : (
            users
              .sort((a, b) => b.riskScore - a.riskScore)
              .map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar} alt={user.nickname} />
                      <AvatarFallback>{user.nickname.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.nickname}</span>
                        {getRiskBadge(user.riskLevel)}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          最后活动: {new Date(user.lastActivity).toLocaleString()}
                        </span>
                        <span>账户年龄: {user.accountAge}天</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* 风险评分 */}
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getRiskColor(user.riskLevel)}`}>
                        {user.riskScore}
                      </div>
                      <div className="text-xs text-gray-500">风险评分</div>
                      <div className="w-20 mt-1">
                        <Progress 
                          value={user.riskScore} 
                          className="h-2"
                        />
                      </div>
                    </div>

                    {/* 交易统计 */}
                    <div className="text-center">
                      <div className="text-lg font-bold flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {user.totalTransactions}
                      </div>
                      <div className="text-xs text-gray-500">总交易数</div>
                    </div>

                    {/* 交易金额 */}
                    <div className="text-center">
                      <div className="text-lg font-bold flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ¥{user.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">交易总额</div>
                    </div>

                    {/* 可疑行为 */}
                    <div className="text-center">
                      <div className={`text-lg font-bold ${user.suspiciousCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {user.suspiciousCount}
                      </div>
                      <div className="text-xs text-gray-500">可疑行为</div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(user)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        详情
                      </Button>
                      {user.riskLevel === 'high' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleProcessUser(user)}
                        >
                          <AlertCircle className="h-3 w-3 mr-1" />
                          处理
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
          )}
        </CardContent>
      </Card>

      {/* 风险趋势图表区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              风险等级分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">低风险</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500"
                      style={{ width: users.length > 0 ? `${(lowRiskCount / users.length) * 100}%` : '0%' }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{lowRiskCount}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">中风险</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500"
                      style={{ width: users.length > 0 ? `${(mediumRiskCount / users.length) * 100}%` : '0%' }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{mediumRiskCount}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">高风险</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500"
                      style={{ width: users.length > 0 ? `${(highRiskCount / users.length) * 100}%` : '0%' }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{highRiskCount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              实时监控状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">系统状态</span>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">正常运行</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">监控规则</span>
                <span className="text-sm font-medium">24条激活</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">最后扫描</span>
                <span className="text-sm font-medium">刚刚</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">待处理告警</span>
                <Badge variant="destructive">{totalSuspicious}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 用户详情对话框 */}
      <Dialog open={dialogType === 'details'} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              用户风险详情
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.nickname} ({selectedUser?.email}) 的详细风险分析
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">风险等级</Label>
                  <div>{getRiskBadge(selectedUser.riskLevel)}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">风险评分</Label>
                  <div className={`text-lg font-bold ${getRiskColor(selectedUser.riskLevel)}`}>
                    {selectedUser.riskScore}/100
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">最后活动</Label>
                  <div className="text-sm">{new Date(selectedUser.lastActivity).toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">账户年龄</Label>
                  <div className="text-sm">{selectedUser.accountAge}天</div>
                </div>
              </div>

              {/* 交易统计 */}
              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-gray-600 mb-3 block">交易统计</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold">{selectedUser.totalTransactions}</div>
                    <div className="text-xs text-gray-500">总交易数</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold">¥{selectedUser.totalAmount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">交易总额</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className={`text-lg font-bold ${selectedUser.suspiciousCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedUser.suspiciousCount}
                    </div>
                    <div className="text-xs text-gray-500">可疑行为</div>
                  </div>
                </div>
              </div>

              {/* 风险详情 */}
              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-gray-600 mb-3 block">风险分析</Label>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>账户新旧程度:</span>
                    <span className={selectedUser.accountAge < 30 ? 'text-red-600' : 'text-green-600'}>
                      {selectedUser.accountAge < 30 ? '新账户 (+20分)' : '正常账户 (+0分)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>交易频率:</span>
                    <span className={selectedUser.totalTransactions > 100 ? 'text-yellow-600' : 'text-green-600'}>
                      {selectedUser.totalTransactions > 100 ? '交易频繁 (+15分)' : '正常频率 (+0分)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>可疑行为:</span>
                    <span className={selectedUser.suspiciousCount > 0 ? 'text-red-600' : 'text-green-600'}>
                      {selectedUser.suspiciousCount > 0 ? `${selectedUser.suspiciousCount}次异常 (+${selectedUser.suspiciousCount * 5}分)` : '无异常 (+0分)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 处理风险对话框 */}
      <Dialog open={dialogType === 'handle'} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              处理高风险用户
            </DialogTitle>
            <DialogDescription>
              用户: {selectedUser?.nickname} ({selectedUser?.email})
              <br />
              当前风险等级: <span className="text-red-600 font-medium">高风险 ({selectedUser?.riskScore}分)</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="handleNotes">处理说明</Label>
              <Textarea
                id="handleNotes"
                placeholder="请描述采取的处理措施，例如：已联系用户核实身份，限制部分交易功能..."
                value={handleNotes}
                onChange={(e) => setHandleNotes(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="text-sm text-yellow-800">
                <strong>处理建议:</strong>
                <ul className="mt-1 ml-4 list-disc">
                  <li>联系用户核实最近的异常交易</li>
                  <li>要求提供身份验证文件</li>
                  <li>暂时限制大额交易功能</li>
                  <li>加强账户监控频率</li>
                </ul>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              取消
            </Button>
            <Button 
              onClick={handleSubmitProcess}
              disabled={!handleNotes.trim()}
            >
              确认处理
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserMonitoring; 