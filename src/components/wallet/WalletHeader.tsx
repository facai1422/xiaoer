
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface WalletHeaderProps {
  handleRefresh: () => void;
  isLoadingTransactions: boolean;
}

export const WalletHeader = ({ handleRefresh, isLoadingTransactions }: WalletHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="bg-white p-4 flex items-center justify-between shadow-sm">
      <h1 className={`font-semibold flex-1 text-center ${isMobile ? 'text-base' : 'text-lg'}`}>我的钱包</h1>
      <Button 
        variant="ghost" 
        size={isMobile ? "icon" : "sm"}
        onClick={handleRefresh}
        disabled={isLoadingTransactions}
        className="absolute right-4"
        aria-label="刷新"
      >
        <RefreshCw className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ${isLoadingTransactions ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};
