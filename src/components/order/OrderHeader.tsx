
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const OrderHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-4 py-4 bg-white">
      <button onClick={() => navigate(-1)} className="text-gray-600">
        <ArrowLeft className="w-6 h-6" />
      </button>
      <div className="text-base font-normal">订单详情</div>
      <div className="w-6"></div>
    </div>
  );
};
