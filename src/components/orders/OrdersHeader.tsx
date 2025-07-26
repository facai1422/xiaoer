
interface OrdersHeaderProps {
  title: string;
}

const OrdersHeader = ({ title }: OrdersHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="text-lg font-medium">{title}</div>
    </div>
  );
};

export default OrdersHeader;
