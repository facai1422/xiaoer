
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchParams } from "../types";
import { AddMerchantSheet } from "./AddMerchantSheet";

interface MerchantSearchFormProps {
  searchParams: SearchParams;
  onSearchParamsChange: (params: SearchParams) => void;
  onSearch: () => void;
  onReset: () => void;
}

export const MerchantSearchForm = ({
  searchParams,
  onSearchParamsChange,
  onSearch,
  onReset,
}: MerchantSearchFormProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-[4.5rem] shrink-0">商家信息</span>
          <Input 
            placeholder="请输入用户昵称" 
            value={searchParams.nickname || ''}
            onChange={(e) => onSearchParamsChange({ ...searchParams, nickname: e.target.value })}
            className="w-full" 
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-[4.5rem] shrink-0">手机号码</span>
          <Input 
            placeholder="请输入手机号" 
            value={searchParams.phone || ''}
            onChange={(e) => onSearchParamsChange({ ...searchParams, phone: e.target.value })}
            className="w-full" 
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-[4.5rem] shrink-0">禁用账号</span>
          <Select 
            value={searchParams.status || 'all'}
            onValueChange={(value) => onSearchParamsChange({ ...searchParams, status: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="请选择账号禁用状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="enabled">启用</SelectItem>
              <SelectItem value="disabled">禁用</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 w-[4.5rem] shrink-0">注册时间</span>
          <div className="flex items-center gap-2 w-full">
            <Input 
              type="date" 
              className="flex-1"
              value={searchParams.startDate || ''}
              onChange={(e) => onSearchParamsChange({ ...searchParams, startDate: e.target.value })}
            />
            <span>-</span>
            <Input 
              type="date" 
              className="flex-1"
              value={searchParams.endDate || ''}
              onChange={(e) => onSearchParamsChange({ ...searchParams, endDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onSearch}>搜索</Button>
        <Button variant="outline" onClick={onReset}>重置</Button>
        <AddMerchantSheet />
      </div>
    </div>
  );
};
