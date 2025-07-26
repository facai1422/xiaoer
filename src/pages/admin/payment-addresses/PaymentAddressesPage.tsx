
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddressesTable } from "./components/AddressesTable";
import { AddAddressForm } from "./components/AddAddressForm";
import { useQuery } from "@tanstack/react-query";

export const PaymentAddressesPage = () => {
  const navigate = useNavigate();
  const { refetch } = useQuery({ queryKey: ['payment-addresses'] });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-semibold">支付地址管理</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">添加新地址</h2>
        <AddAddressForm onSuccess={() => refetch()} />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">地址列表</h2>
        <AddressesTable />
      </div>
    </div>
  );
};

export default PaymentAddressesPage;
