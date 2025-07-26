
import { Input } from "@/components/ui/input";

interface OrderSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const OrderSearch = ({ searchQuery, setSearchQuery }: OrderSearchProps) => {
  return (
    <div className="px-4 pb-2">
      <div className="relative">
        <Input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-16" 
          placeholder="请输入订单号搜索"
        />
        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500">
          搜索
        </button>
      </div>
    </div>
  );
};

export default OrderSearch;
