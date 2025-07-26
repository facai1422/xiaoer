
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export const RechargeHeader = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
      <div className={`flex items-center justify-between ${isMobile ? 'px-3 py-3' : 'px-4 py-4'}`}>
        <button onClick={() => navigate(-1)} className="text-gray-600" title="返回">
          <ArrowLeft className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
        </button>
        <div className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>USDT充值</div>
        <div className={`${isMobile ? 'w-5' : 'w-6'}`}></div>
      </div>
    </div>
  );
};
