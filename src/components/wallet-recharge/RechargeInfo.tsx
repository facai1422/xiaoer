
import { Card } from "@/components/ui/card";

export const RechargeInfo = () => {
  return (
    <div className="mt-4 p-4 bg-white rounded-lg">
      <h3 className="text-lg font-medium mb-2">充值说明</h3>
      <ul className="text-sm text-gray-600 space-y-2">
        <li>• 最小充值金额为 10 USDT</li>
        <li>• 充值完成后余额将自动更新</li>
        <li>• 如遇到问题请联系在线客服</li>
      </ul>
    </div>
  );
};
