
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface AddressListProps {
  addresses: any[];
  selectedAddress: any;
  setSelectedAddress: (address: any) => void;
  isLoading?: boolean;
}

export const AddressList = ({ 
  addresses, 
  selectedAddress, 
  setSelectedAddress,
  isLoading = false
}: AddressListProps) => {
  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
  };

  return (
    <Card className="mt-4 p-4 bg-white border border-gray-200">
      <h3 className="text-base font-medium mb-4 text-gray-900">选择充值地址</h3>
      
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {!isLoading && addresses.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-gray-500">暂无可用的充值地址</p>
          <p className="text-gray-500 text-sm mt-2">请联系客服或稍后再试</p>
        </div>
      )}

      {!isLoading && addresses.length > 0 && (
        <div className="space-y-4">
          {addresses.map((address: any) => (
            <div 
              key={address.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors bg-white ${
                selectedAddress?.id === address.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedAddress(address)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">{address.type}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleCopy(address.address, e)}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-sm text-gray-600 break-all">{address.address}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
