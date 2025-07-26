import { useIsMobile } from "@/hooks/use-mobile";
import { useWalletBalance } from "@/hooks/useWalletBalance";

interface AssetDisplayProps {
  className?: string;
}

export const AssetDisplay = ({ className }: AssetDisplayProps) => {
  const isMobile = useIsMobile();
  // 使用钱包余额钩子，自动更新余额
  const { balance, isLoading, error, refreshBalance } = useWalletBalance();

  return (
    <div className={`mt-6 md:mt-8 ${className || ''}`}>
      <h2 className="text-center text-gray-600 mb-4 md:mb-6">我的资产</h2>
      <div className={`relative mx-auto rounded-full overflow-hidden ${isMobile ? 'w-48 h-48' : 'w-64 h-64'}`}>
        <div className="absolute inset-0 bg-blue-500">
          <div className="liquid-circle absolute top-[-50%] left-0 w-full h-[200%] bg-[#4973ff] transition-all duration-500">
            <div className="absolute top-0 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-3/4 bg-[rgba(255,255,255,0.4)] rounded-[45%] animate-[circle-wave1_5s_linear_infinite]"></div>
            <div className="absolute top-0 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-3/4 bg-[rgba(255,255,255,0.2)] rounded-[40%] animate-[circle-wave2_7s_linear_infinite]"></div>
          </div>
        </div>
          
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          {isLoading ? (
            <span className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-white`}>loading...</span>
          ) : error ? (
            <div className="flex flex-col items-center">
              <span className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-white`}>--</span>
              <button 
                onClick={refreshBalance} 
                className="text-white/90 mt-2 underline"
              >
                重试
              </button>
            </div>
          ) : (
            <>
              <span className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-white`}>
                {balance.toFixed(2) || '0.00'}
              </span>
              <div className="flex items-center mt-2">
                <span className="text-white/90">总资产(USDT)</span>
                <button 
                  onClick={refreshBalance} 
                  className="text-white/90 ml-2 text-xs underline"
                >
                  刷新
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetDisplay;
