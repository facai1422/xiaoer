
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface DateSelectorProps {
  date: Date;
  setDate: (date: Date) => void;
  timeRange: string;
  setTimeRange: (range: "today" | "yesterday" | "month" | "last30" | "lastYear") => void;
}

export const DateSelector = ({ date, setDate, timeRange, setTimeRange }: DateSelectorProps) => {
  const timeRanges = [
    { key: "today", label: "昨天" },
    { key: "yesterday", label: "最近7天" },
    { key: "month", label: "本月" },
    { key: "last30", label: "最近30天" },
    { key: "lastYear", label: "最近1年" },
  ] as const;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <h2 className="text-lg font-medium p-4 md:p-6 pb-4">日期选择</h2>
      <div className="mb-4 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 px-4 md:px-6">
        <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border overflow-x-auto">
          {timeRanges.map((range) => (
            <button
              key={range.key}
              onClick={() => setTimeRange(range.key)}
              className={cn(
                "px-3 py-1 rounded-md text-sm transition-colors whitespace-nowrap",
                timeRange === range.key
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "PPP", { locale: zhCN })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
