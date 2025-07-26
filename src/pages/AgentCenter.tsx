import { useState, useEffect } from "react";
import { ArrowLeft, Copy, QrCode, Users, TrendingUp, DollarSign, ChevronRight, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { 
  getAgentProfile, 
  getUserReferralInfo, 
  getDirectReferrals, 
  getTeamMembers, 
  getTeamStats,
  getCommissionStats,
  calculateLevelCommissions,
  createOrUpdateAgentProfile,
  type TeamMember
} from "@/utils/agentQueries";

interface CommissionStats {
  available: number;      // 可提现佣金
  pending: number;        // 未提现佣金
  withdrawn: number;      // 已提现佣金
  total: number;         // 累计佣金
}

interface LevelCommission {
  level: number;
  rate: number;
  memberCount: number;
  totalCommission: number;
}

const AgentCenter = () => {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [directMembers, setDirectMembers] = useState<{
    id: string;
    username: string | null;
    email: string | null;
    phone: string | null;
    created_at: string;
    balance: number | null;
    total_recharge: number | null;
  }[]>([]);
  const [commissionStats, setCommissionStats] = useState<CommissionStats>({
    available: 0,
    pending: 0,
    withdrawn: 0,
    total: 0
  });
  const [levelCommissions, setLevelCommissions] = useState<LevelCommission[]>([]);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [teamStats, setTeamStats] = useState({ directCount: 0, totalCount: 0 });
  const [userId, setUserId] = useState<string>("");

  // 返佣费率配置（10级）
  const commissionRates = [
    { level: 1, rate: 0.10 },  // 一级 10%
    { level: 2, rate: 0.08 },  // 二级 8%
    { level: 3, rate: 0.06 },  // 三级 6%
    { level: 4, rate: 0.05 },  // 四级 5%
    { level: 5, rate: 0.04 },  // 五级 4%
    { level: 6, rate: 0.03 },  // 六级 3%
    { level: 7, rate: 0.02 },  // 七级 2%
    { level: 8, rate: 0.015 }, // 八级 1.5%
    { level: 9, rate: 0.01 },  // 九级 1%
    { level: 10, rate: 0.005 } // 十级 0.5%
  ];

  useEffect(() => {
    loadAgentData();
  }, []);

  const loadAgentData = async () => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("请先登录");
        navigate("/login");
        return;
      }
      
      console.log('用户会话:', session.user.id);
      setUserId(session.user.id);
      
      // 获取用户档案信息（包括邀请码和档案ID）
      console.log('正在获取用户档案...');
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, invite_code, username, phone')
        .eq('user_id', session.user.id)
        .single();

      if (profileError) {
        console.error('获取用户档案失败:', profileError);
        if (profileError.code === 'PGRST116') {
          toast.error("用户档案不存在，请先完善个人信息");
        } else {
          toast.error(`获取用户信息失败: ${profileError.message}`);
        }
        return;
      }

      if (!userProfile) {
        toast.error("用户档案不存在");
        return;
      }

      console.log('用户档案:', userProfile);

      // 设置邀请码和邀请链接
      const code = userProfile.invite_code || "";
      setInviteCode(code);
      
      // 生成邀请链接
      const domain = window.location.origin;
      setInviteLink(`${domain}/register?code=${code}`);
      
      // 检查并创建代理档案
      console.log('正在检查代理档案...');
      try {
        const agentProfile = await getAgentProfile(session.user.id);
        if (!agentProfile) {
          console.log('代理档案不存在，正在创建...');
          await createOrUpdateAgentProfile(
            session.user.id, 
            userProfile.username || '未知用户',
            userProfile.phone || undefined
          );
          console.log('代理档案创建成功');
        }
      } catch (agentError) {
        console.error('代理档案操作失败:', agentError);
        // 不阻止页面加载，继续执行
      }
      
      // 加载团队成员数据 - 使用用户档案ID而不是auth用户ID
      console.log('正在加载团队成员数据...');
      try {
        await loadTeamMembers(userProfile.id);
        console.log('团队成员数据加载成功');
      } catch (teamError) {
        console.error('加载团队成员失败:', teamError);
        toast.error("加载团队数据失败");
      }
      
      // 加载佣金统计
      console.log('正在加载佣金统计...');
      try {
        await loadCommissionStats(session.user.id);
        console.log('佣金统计加载成功');
      } catch (commissionError) {
        console.error('加载佣金统计失败:', commissionError);
        // 设置默认值
        setCommissionStats({
          available: 0,
          pending: 0,
          withdrawn: 0,
          total: 0
        });
      }
      
      // 加载各级佣金数据 - 使用用户档案ID
      console.log('正在加载各级佣金数据...');
      try {
        await loadLevelCommissions(userProfile.id);
        console.log('各级佣金数据加载成功');
      } catch (levelError) {
        console.error('加载各级佣金失败:', levelError);
        // 设置默认值
        setLevelCommissions([]);
      }
      
      console.log('所有数据加载完成');
      
    } catch (error) {
      console.error("Error loading agent data:", error);
      toast.error(`加载数据失败: ${error.message || '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamMembers = async (userId: string) => {
    try {
      // 获取直推成员
      const directReferrals = await getDirectReferrals(userId);
      setDirectMembers(directReferrals);
      
      // 获取多级团队成员
      const allMembers = await getTeamMembers(userId);
      setTeamMembers(allMembers);
      
      // 计算团队统计
      const stats = getTeamStats(allMembers);
      setTeamStats(stats);
    } catch (error) {
      console.error("Error loading team members:", error);
    }
  };

  const loadCommissionStats = async (userId: string) => {
    try {
      const stats = await getCommissionStats(userId);
      setCommissionStats(stats);
    } catch (error) {
      console.error("Error loading commission stats:", error);
    }
  };

  const loadLevelCommissions = async (userId: string) => {
    try {
      const levelStats = await calculateLevelCommissions(userId, commissionRates);
      setLevelCommissions(levelStats);
    } catch (error) {
      console.error("Error loading level commissions:", error);
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(message))
      .catch(err => {
        console.error("Could not copy text: ", err);
        toast.error("复制失败");
      });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  const calculateCommission = (member: TeamMember) => {
    // 根据级别计算佣金
    const rate = commissionRates.find(r => r.level === member.level)?.rate || 0;
    return (member.total_recharge || 0) * rate;
  };

  const renderTeamTree = (members: TeamMember[], parentLevel: number = 0) => {
    return members.map(member => (
      <div key={member.id} className={`ml-${parentLevel * 4}`}>
        <Card className="mb-2 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{member.username || '未设置昵称'}</span>
                  <Badge variant="outline" className="text-xs">
                    {member.level}级
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {member.phone || '未绑定手机'} | 加入时间: {formatDate(member.created_at)}
                </div>
                <div className="text-sm mt-2">
                  <span className="text-gray-600">充值总额: </span>
                  <span className="font-medium text-blue-600">¥{(member.total_recharge || 0).toFixed(2)}</span>
                  <span className="text-gray-600 ml-4">贡献佣金: </span>
                  <span className="font-medium text-green-600">¥{calculateCommission(member).toFixed(2)}</span>
                </div>
              </div>
              {member.children && member.children.length > 0 && (
                <div className="flex items-center text-gray-400">
                  <Users className="w-4 h-4 mr-1" />
                  <span className="text-sm">{member.children.length}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {member.children && renderTeamTree(member.children, parentLevel + 1)}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 头部 */}
      <div className="bg-white p-4 flex items-center shadow-sm">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold flex-1 text-center">代理中心</h1>
      </div>
      
      <div className="p-4 space-y-4">
        {/* 邀请信息卡片 */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">我的推广信息</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm opacity-90 mb-1">邀请码</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-mono font-bold">{inviteCode || "加载中..."}</span>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => copyToClipboard(inviteCode, "邀请码已复制")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm opacity-90 mb-1">邀请链接</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={inviteLink} 
                    readOnly 
                    className="flex-1 bg-white/20 border border-white/30 rounded px-3 py-1 text-sm"
                    aria-label="邀请链接"
                    title="邀请链接"
                  />
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => copyToClipboard(inviteLink, "邀请链接已复制")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <Button className="w-full mt-4 bg-white text-blue-600 hover:bg-gray-100">
              <QrCode className="mr-2 h-4 w-4" />
              生成推广海报
            </Button>
          </CardContent>
        </Card>

        {/* 佣金统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              佣金统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">可提现佣金</p>
                <p className="text-2xl font-bold text-green-600">¥{commissionStats.available.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">未提现佣金</p>
                <p className="text-2xl font-bold text-blue-600">¥{commissionStats.pending.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">已提现佣金</p>
                <p className="text-2xl font-bold text-orange-600">¥{commissionStats.withdrawn.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">累计佣金</p>
                <p className="text-2xl font-bold text-purple-600">¥{commissionStats.total.toFixed(2)}</p>
              </div>
            </div>
            <Button className="w-full mt-4" onClick={() => navigate("/withdraw")}>
              申请提现
            </Button>
          </CardContent>
        </Card>

        {/* 团队统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              团队统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">直接推荐</p>
                <p className="text-2xl font-bold text-blue-600">{teamStats.directCount}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">团队总人数</p>
                <p className="text-2xl font-bold text-green-600">{teamStats.totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 返佣费率表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              返佣费率表
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {commissionRates.map((rate) => {
                const levelData = levelCommissions.find(lc => lc.level === rate.level);
                return (
                  <div 
                    key={rate.level} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setSelectedLevel(rate.level)}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={selectedLevel === rate.level ? "default" : "outline"}>
                        {rate.level}级
                      </Badge>
                      <span className="text-sm">
                        费率: <span className="font-medium text-blue-600">{(rate.rate * 100).toFixed(1)}%</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        人数: <span className="font-medium">{levelData?.memberCount || 0}</span>
                      </span>
                      <span className="text-gray-600">
                        佣金: <span className="font-medium text-green-600">¥{levelData?.totalCommission.toFixed(2) || '0.00'}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 团队成员列表 */}
        <Card>
          <CardHeader>
            <CardTitle>团队成员</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="direct">直推</TabsTrigger>
                <TabsTrigger value="level">按级别</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                {teamMembers.length > 0 ? (
                  <div className="space-y-2">
                    {renderTeamTree(teamMembers)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <UserPlus className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>暂无团队成员</p>
                    <p className="text-sm mt-1">快去邀请好友加入吧！</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="direct" className="mt-4">
                {directMembers.length > 0 ? (
                  <div className="space-y-2">
                    {directMembers.map(member => (
                      <Card key={member.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{member.username || '未设置昵称'}</p>
                              <p className="text-sm text-gray-500">{member.phone || '未绑定手机'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">贡献佣金</p>
                              <p className="font-medium text-green-600">¥{((member.total_recharge || 0) * 0.1).toFixed(2)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    暂无直推成员
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="level" className="mt-4">
                <div className="space-y-4">
                  {commissionRates.map((rate) => {
                    const levelMembers = teamMembers.filter(m => m.level === rate.level);
                    const levelData = levelCommissions.find(lc => lc.level === rate.level);
                    
                    if (levelData?.memberCount === 0) return null;
                    
                    return (
                      <div key={rate.level}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{rate.level}级成员</h4>
                          <Badge variant="outline">{levelData?.memberCount || 0}人</Badge>
                        </div>
                        <div className="space-y-2">
                          {levelMembers.map(member => (
                            <Card key={member.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">{member.username || '未设置昵称'}</span>
                                  <span className="text-sm text-green-600">¥{calculateCommission(member).toFixed(2)}</span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default AgentCenter;
