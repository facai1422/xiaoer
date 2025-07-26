
import { Trash2, Upload, Headset, ArrowUpCircle } from "lucide-react";

interface OrderActionsProps {
  showConfirmButtons: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onDelete: () => void;
  onUpload: () => void;
  onCustomerService: () => void;
  onContinueTopup: () => void;
}

export const OrderActions = ({
  showConfirmButtons,
  onCancel,
  onConfirm,
  onDelete,
  onUpload,
  onCustomerService,
  onContinueTopup
}: OrderActionsProps) => {
  if (showConfirmButtons) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onCancel}
            className="py-2 px-4 rounded bg-gray-100 text-gray-600"
          >
            取消
          </button>
          <button 
            onClick={onConfirm}
            className="py-2 px-4 rounded bg-blue-500 text-white"
          >
            确认
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
      <div className="grid grid-cols-4 gap-4">
        <button 
          onClick={onDelete}
          className="flex flex-col items-center justify-center text-gray-500 text-sm"
        >
          <Trash2 className="w-6 h-6 mb-1" />
          删除订单
        </button>
        <button 
          onClick={onUpload}
          className="flex flex-col items-center justify-center text-gray-500 text-sm"
        >
          <Upload className="w-6 h-6 mb-1" />
          付款凭证
        </button>
        <button 
          onClick={onCustomerService}
          className="flex flex-col items-center justify-center text-gray-500 text-sm"
        >
          <Headset className="w-6 h-6 mb-1" />
          在线客服
        </button>
        <button 
          onClick={onContinueTopup}
          className="flex flex-col items-center justify-center text-gray-500 text-sm"
        >
          <ArrowUpCircle className="w-6 h-6 mb-1" />
          继续充值
        </button>
      </div>
    </div>
  );
};
