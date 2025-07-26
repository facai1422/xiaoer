
interface PaymentInfoProps {
  type: string;
  amount: number;
}

export const PaymentInfo = ({ type, amount }: PaymentInfoProps) => {
  return (
    <div className="bg-white p-4 mb-4">
      <div className="text-lg font-medium mb-4">支付信息</div>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-500">{type === "国网电费" ? "缴费金额" : "充值金额"}</span>
          <span>{amount.toFixed(2)} 元</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">实际到账</span>
          <span>0 元</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">优惠信息</span>
          <span className="text-orange-500">折扣8 优惠-{(amount * 0.2).toFixed(2)}元</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">参考汇率</span>
          <span>7.5</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">合计支付</span>
          <span className="text-orange-500">$ {(amount * 0.8 / 7.5).toFixed(2)} USDT</span>
        </div>
      </div>
    </div>
  );
};
