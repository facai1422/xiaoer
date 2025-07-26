import { useProfile } from "@/hooks/useProfile";
import { BalanceStats } from "@/components/profile/BalanceStats";
import { UserInfoCard } from "@/components/profile/UserInfoCard";
import { TransactionCenter } from "@/components/profile/TransactionCenter";
import BottomNav from "@/components/BottomNav";
import { InstantAuthCheck } from "@/components/auth/InstantAuthCheck";
import { useEffect } from "react";

const Profile = () => {
  const { profile, isLoading, navigateTo, refreshProfile } = useProfile();

  // 调试用effect（生产环境可移除）
  useEffect(() => {
    console.log("[Profile] 加载状态:", isLoading);
    console.log("[Profile] 用户资料:", profile);
  }, [isLoading, profile]);

  // 准备余额数据
  const balanceStats = {
    availableBalance: profile?.balance || 0,
    frozenBalance: profile?.frozen_balance || 0
  };

  // 直接显示页面内容，不等待加载完成
  return (
    <InstantAuthCheck>
      <div className="min-h-screen pb-24 bg-gradient-to-b from-blue-500 to-blue-400">
        <div className="pt-8 px-4 space-y-6">
          <UserInfoCard
            profile={profile || { 
              id: 'loading', 
              username: '加载中...', 
              email: '',
              balance: 0,
              frozen_balance: 0
            }}
            isLoading={isLoading}
          />

          <BalanceStats
            balanceStats={balanceStats}
            onNavigate={navigateTo}
          />

          <TransactionCenter
            onNavigate={navigateTo}
          />
        </div>

        <BottomNav />
      </div>
    </InstantAuthCheck>
  );
};

export default Profile;