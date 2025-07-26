import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InstantAuthCheck } from "@/components/auth/InstantAuthCheck";
import BottomNav from "@/components/BottomNav";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayRevenue: 0,
    monthRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    // 模拟加载商户数据
    const loadMerchantData = async () => {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStats({
        todayRevenue: 1250.80,
        monthRevenue: 28900.50,
        totalOrders: 156,
        pendingOrders: 8
      });
    };

    loadMerchantData();
  }, []);

  return (
    <InstantAuthCheck>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* 头部 */}
        <div className="bg-white p-4 flex items-center shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <h1 className="text-lg font-semibold ml-4">商户中心</h1>
        </div>

        {/* 统计卡片 */}
        <div className="p-4 grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">¥{stats.todayRevenue}</p>
              <p className="text-sm text-gray-600">今日收入</p>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">¥{stats.monthRevenue}</p>
              <p className="text-sm text-gray-600">本月收入</p>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.totalOrders}</p>
              <p className="text-sm text-gray-600">总订单数</p>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
              <p className="text-sm text-gray-600">待处理订单</p>
            </div>
          </Card>
        </div>

        {/* 功能菜单 */}
        <div className="p-4 space-y-4">
          <Card className="p-4">
            <h3 className="font-medium mb-3">商户功能</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12">
                订单管理
              </Button>
              <Button variant="outline" className="h-12">
                收款设置
              </Button>
              <Button variant="outline" className="h-12">
                财务报表
              </Button>
              <Button variant="outline" className="h-12">
                客户管理
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-medium mb-3">账户设置</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                商户信息
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                安全设置
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                通知设置
              </Button>
            </div>
          </Card>
        </div>

        <BottomNav />
      </div>
    </InstantAuthCheck>
  );
};

export default Dashboard;
