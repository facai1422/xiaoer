
interface OrderStatusProps {
  type: string;
  id: string;
  createTime: string;
  status: string;
}

export const OrderStatus = ({ type, id, createTime, status }: OrderStatusProps) => {
  return (
    <div className="bg-white p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-orange-100 text-orange-500 rounded">{type}</span>
          <div>
            <div>订单：{id}</div>
            <div className="text-gray-500 text-sm">于 {new Date(createTime).toLocaleString()}</div>
          </div>
        </div>
        <span className={status === "支付成功" ? "text-blue-500" : "text-orange-500"}>
          {status}
        </span>
      </div>
    </div>
  );
};
