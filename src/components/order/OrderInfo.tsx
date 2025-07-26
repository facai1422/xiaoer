
import { toast } from "sonner";

interface OrderInfoProps {
  type: string;
  phoneNumber: string;
}

export const OrderInfo = ({ type, phoneNumber }: OrderInfoProps) => {
  return (
    <div className="bg-white p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <div>{type === "国网电费" ? "缴费户号" : "充值号码"}: {phoneNumber}</div>
        <button 
          className="text-blue-500"
          onClick={() => {
            navigator.clipboard.writeText(phoneNumber);
            toast.success(type === "国网电费" ? "户号已复制" : "号码已复制");
          }}
        >
          复制
        </button>
      </div>
      {type === "国网电费" ? (
        <>
          <div className="text-gray-500">缴费类型: 国网电费</div>
          <div className="text-gray-500">缴费城市: 北京</div>
        </>
      ) : (
        <>
          <div className="text-gray-500">运营商: 北京 - 北京（移动）</div>
          <div className="text-gray-500">下单前余额: 查询失败</div>
        </>
      )}
    </div>
  );
};
