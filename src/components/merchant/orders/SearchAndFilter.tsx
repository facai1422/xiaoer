
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

export const SearchAndFilter = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
}: SearchAndFilterProps) => {
  const statusOptions = [
    { id: "pending", label: "待充值" },
    { id: "processing", label: "充值中" },
    { id: "completed", label: "已完成" },
    { id: "cancelled", label: "已取消" },
    { id: "all", label: "全部" },
  ];

  return (
    <div className="px-4 py-3 bg-gray-50 border-b">
      <div className="relative mb-4">
        <Input 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pr-20" 
          placeholder="请输入卡号/订单号搜索"
        />
        <button 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 px-4 py-1"
        >
          搜索
        </button>
      </div>

      <div className="flex space-x-6">
        {statusOptions.map(({ id, label }) => (
          <button
            key={id}
            className={cn(
              "py-2 px-1 text-sm relative",
              selectedStatus === id 
                ? "text-blue-500 font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500"
                : "text-gray-600"
            )}
            onClick={() => onStatusChange(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};
