
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Merchant } from "../types";
import { formatCommission } from "../utils";

interface MerchantListProps {
  merchants?: Merchant[];
  isLoading: boolean;
  onStatusChange: (merchantId: string, newStatus: boolean) => void;
}

export const MerchantList = ({ merchants, isLoading, onStatusChange }: MerchantListProps) => {
  return (
    <div className="border rounded-lg">
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">ID</TableHead>
              <TableHead className="w-[60px]">头像</TableHead>
              <TableHead className="w-[100px]">昵称</TableHead>
              <TableHead className="w-[120px]">手机号码</TableHead>
              <TableHead className="w-[180px]">结算比率</TableHead>
              <TableHead className="w-[100px]">账户余额(U)</TableHead>
              <TableHead className="w-[100px]">冻结余额(U)</TableHead>
              <TableHead className="w-[80px]">直推人数</TableHead>
              <TableHead className="w-[80px]">禁用账号</TableHead>
              <TableHead className="w-[120px]">登录IP</TableHead>
              <TableHead className="w-[140px]">创建时间</TableHead>
              <TableHead className="w-[180px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-4">加载中...</TableCell>
              </TableRow>
            ) : merchants?.map((merchant) => (
              <TableRow key={merchant.id}>
                <TableCell className="whitespace-nowrap">{merchant.id.slice(0, 8)}</TableCell>
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={merchant.avatar_url || "/lovable-uploads/a02e3091-92f0-4c93-b7fc-a385c15b7825.png"}
                      alt={merchant.nickname || ''}
                    />
                    <AvatarFallback className="bg-blue-100">
                      {merchant.nickname?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="whitespace-nowrap">{merchant.nickname}</TableCell>
                <TableCell className="whitespace-nowrap">{merchant.phone}</TableCell>
                <TableCell>
                  <div className="whitespace-pre-line">{formatCommission(merchant.commission)}</div>
                </TableCell>
                <TableCell className="whitespace-nowrap">{merchant.account_balance}</TableCell>
                <TableCell className="whitespace-nowrap">{merchant.freeze_balance}</TableCell>
                <TableCell className="whitespace-nowrap">{merchant.team_count}</TableCell>
                <TableCell>
                  <Switch 
                    checked={merchant.status}
                    onCheckedChange={(checked) => onStatusChange(merchant.id, checked)}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">{merchant.ip}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {new Date(merchant.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" className="text-blue-500">账单修改</Button>
                    <Button size="sm" variant="outline" className="text-blue-500">分润配置</Button>
                    <Button size="sm" variant="outline" className="text-blue-500">余额修改</Button>
                    <Button size="sm" variant="outline" className="text-red-500">重置密码</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
