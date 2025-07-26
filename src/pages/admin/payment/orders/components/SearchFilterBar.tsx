
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OrderStatus } from "@/types/payment";
import { DateRange } from "react-day-picker";
import { DateRangeSelector } from "./DateRangeSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | OrderStatus;
  onStatusFilterChange: (value: "all" | OrderStatus) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export const SearchFilterBar = ({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusFilterChange,
  dateRange,
  onDateRangeChange
}: SearchFilterBarProps) => {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          type="search"
          placeholder="搜索订单号..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Select
          value={statusFilter}
          onValueChange={(value: "all" | OrderStatus) => onStatusFilterChange(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="所有状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有状态</SelectItem>
            <SelectItem value="pending">待处理</SelectItem>
            <SelectItem value="processing">处理中</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="failed">已失败</SelectItem>
          </SelectContent>
        </Select>
        <div>
          <DateRangeSelector dateRange={dateRange} onDateRangeChange={onDateRangeChange} />
        </div>
      </div>
    </Card>
  );
};
