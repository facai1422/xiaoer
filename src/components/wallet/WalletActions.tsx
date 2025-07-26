
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { WalletIcon, ArrowDownCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const WalletActions = () => {
  const navigate = useNavigate();

  const handleRecharge = () => {
    navigate('/wallet/recharge');
  };

  const handleWithdraw = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("请先登录");
        navigate('/login');
        return;
      }

      const { data } = await supabase
        .from('user_payments')
        .select('*')
        .eq('user_id', session.user.id);

      if (!data || data.length === 0) {
        toast("添加提现账户后才能进行提现操作");
        navigate('/payment/settings');
        return;
      }
      
      navigate('/withdraw');
    } catch (error) {
      console.error('Error checking payment methods:', error);
      toast.error("检查支付方式时出错");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Button 
        className="h-24 relative will-change-transform transition-all duration-300 transform perspective-button bg-gradient-to-b from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 border-b-2 border-orange-500 shadow-[0_40px_29px_0px_rgba(251,146,60,0.2)]"
        onClick={handleRecharge}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center text-white font-black">
            <WalletIcon className="w-12 h-12 mb-1" />
            <span className="text-lg">充值</span>
          </div>
        </div>
      </Button>
      <Button 
        className="h-24 relative will-change-transform transition-all duration-300 transform perspective-button bg-gradient-to-b from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 border-b-2 border-blue-500 shadow-[0_40px_29px_0px_rgba(63,94,251,0.2)]"
        onClick={handleWithdraw}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center text-white font-black">
            <ArrowDownCircle className="w-12 h-12 mb-1" />
            <span className="text-lg">提现</span>
          </div>
        </div>
      </Button>
    </div>
  );
};
