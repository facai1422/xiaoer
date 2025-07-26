
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ApplicationForm } from "@/components/merchant/ApplicationForm";

const MerchantApply = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col">
      <div className="bg-[#001529] text-white py-4 px-6 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold">商家入驻申请</h1>
      </div>

      <div className="flex-1 flex justify-center p-6">
        <Card className="w-full max-w-md p-6 space-y-6">
          <ApplicationForm onSuccess={() => navigate("/agent")} />
        </Card>
      </div>
    </div>
  );
};

export default MerchantApply;
