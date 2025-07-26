import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import BottomNav from "@/components/BottomNav";
import { WalletActions } from "@/components/wallet/WalletActions";
import { AssetDisplay } from "@/components/wallet/AssetDisplay";
import { TransactionList } from "@/components/wallet/TransactionList";
import { WalletHeader } from "@/components/wallet/WalletHeader";
import { InstantAuthCheck } from "@/components/auth/InstantAuthCheck";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import "@/components/wallet/wallet-animations.css";

const Wallet = () => {
  // 使用优化后的钱包余额钩子
  const { balance, isLoading, error, refreshBalance } = useWalletBalance();

  // 处理刷新
  const handleRefresh = () => {
    refreshBalance();
    toast.success("正在刷新钱包数据...");
  };

  // 如果有错误，显示错误信息
  useEffect(() => {
    if (error) {
      // 如果错误是登录相关的，直接显示错误信息，否则加上前缀
      if (error.includes('登录') || error.includes('认证')) {
        toast.error(error);
      } else {
        toast.error(`钱包数据加载失败: ${error}`);
      }
    }
  }, [error]);
  
  return (
    <InstantAuthCheck>
      <div className="min-h-screen bg-gray-50 pb-20">
        <WalletHeader 
          handleRefresh={handleRefresh} 
          isLoadingTransactions={isLoading} 
        />

        <div className="p-4">
          <WalletActions />
          
          <AssetDisplay />

          <div className="mt-8">
            <TransactionList />
          </div>
        </div>

        <BottomNav />
      </div>
    </InstantAuthCheck>
  );
};

export default Wallet;
