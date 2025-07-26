import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { RechargeForm } from "@/components/product/RechargeForm";
import { BatchRechargeForm } from "@/components/product/BatchRechargeForm";
import { CreditCardForm } from "@/components/product/CreditCardForm";
import { QuickAmountSelector } from "@/components/product/QuickAmountSelector";
import { TutorialDialog } from "@/components/product/TutorialDialog";
import { quickAuthCheck } from "@/utils/authUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RechargeEntry } from "@/types/recharge";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState<string>("");
  const [orders, setOrders] = useState([]);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Form states for RechargeForm
  const [cardInfo, setCardInfo] = useState("");
  const [name, setName] = useState("");
  const [customAmount, setCustomAmount] = useState("");

  // Form states for CreditCardForm
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");

  // Form states for BatchRechargeForm
  const [entries, setEntries] = useState<RechargeEntry[]>([
    { cardInfo: "", name: "", amount: "" }
  ]);

  // Define default amounts
  const DEFAULT_AMOUNTS = ["50", "100", "200", "500"];
  const exchangeRate = 7.5;

  // 检查用户登录状态
  useEffect(() => {
    quickAuthCheck(navigate);
  }, [navigate]);

  const handleAmountSelect = (amount: string) => {
    setSelectedAmount(amount);
    setCustomAmount(amount);
  };

  const handleTutorialOpen = () => {
    setIsTutorialOpen(true);
  };

  const handleTutorialClose = () => {
    setIsTutorialOpen(false);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleOrderSubmit = async (orderData: Record<string, unknown>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("请先登录");
        return;
      }

      // TODO: 完善订单数据结构后启用数据库插入
      // const { data, error } = await supabase
      //   .from('recharge_orders')
      //   .insert([{
      //     ...orderData,
      //     user_id: session.user.id
      //   }])
      //   .select()
      //   .single();

      // if (error) throw error;

      toast.success("订单提交成功");
      // navigate(`/orders/${data.id}`);
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error("订单提交失败");
    }
  };

  const handleSwitchToBatch = () => {
    // Logic to switch to batch mode
    console.log("Switching to batch mode");
  };

  const handleSwitchToSingle = () => {
    // Logic to switch to single mode
    console.log("Switching to single mode");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" className="mb-4" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>

        <h1 className="text-2xl font-bold mb-4">产品详情</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">充值选项</h2>
              <QuickAmountSelector 
                amounts={DEFAULT_AMOUNTS}
                selectedAmount={selectedAmount}
                onSelect={handleAmountSelect} 
              />
              <RechargeForm 
                cardInfo={cardInfo}
                onCardInfoChange={setCardInfo}
                name={name}
                onNameChange={setName}
                customAmount={customAmount}
                onCustomAmountChange={setCustomAmount}
                exchangeRate={exchangeRate}
                onSwitchToBatch={handleSwitchToBatch}
              />
            </div>

            <div className="bg-white shadow rounded-lg p-4 mt-6">
              <h2 className="text-lg font-semibold mb-2">批量充值</h2>
              <BatchRechargeForm 
                entries={entries}
                onEntriesChange={setEntries}
                onSwitchMode={handleSwitchToSingle}
              />
            </div>

            <div className="bg-white shadow rounded-lg p-4 mt-6">
              <h2 className="text-lg font-semibold mb-2">信用卡还款</h2>
              <CreditCardForm 
                cardInfo={cardInfo}
                onCardInfoChange={setCardInfo}
                name={name}
                onNameChange={setName}
                bankName={bankName}
                onBankNameChange={setBankName}
                branchName={branchName}
                onBranchNameChange={setBranchName}
                customAmount={customAmount}
                onCustomAmountChange={setCustomAmount}
                exchangeRate={exchangeRate}
                onSwitchToBatch={handleSwitchToBatch}
              />
            </div>
          </div>

          <div>
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">产品信息</h2>
              <p className="text-gray-600">这里是产品描述和更多信息...</p>
              <Button onClick={handleTutorialOpen} className="mt-4">查看教程</Button>
            </div>
          </div>
        </div>
      </div>

      <TutorialDialog open={isTutorialOpen} onOpenChange={setIsTutorialOpen} />
    </div>
  );
};

export default Product;
