
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Search } from "lucide-react";

interface SearchToolbarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

export const SearchToolbar = ({
  placeholder = "搜索...",
  value,
  onChange,
  onSearch,
  onReset,
}: SearchToolbarProps) => {
  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
      </div>
      <Button onClick={onSearch}>搜索</Button>
      <Button variant="outline" onClick={onReset}>
        <RefreshCcw className="h-4 w-4 mr-2" />
        重置
      </Button>
    </div>
  );
};
