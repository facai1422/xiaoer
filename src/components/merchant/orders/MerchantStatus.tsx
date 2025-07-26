
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface MerchantStatusProps {
  isOnline: boolean;
  onStatusChange: (value: boolean) => void;
}

export const MerchantStatus = ({ isOnline, onStatusChange }: MerchantStatusProps) => {
  // 同步在线状态到数据库
  useEffect(() => {
    const updateOnlineStatus = async () => {
      const { error } = await supabase.rpc('update_online_status', {
        p_online: isOnline
      });
      
      if (error) {
        console.error('Error updating online status:', error);
      }
    };

    updateOnlineStatus();
  }, [isOnline]);

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center gap-2">
        <span className="text-gray-600">商家状态:</span>
        <Switch
          checked={isOnline}
          onCheckedChange={onStatusChange}
          className={cn(
            "data-[state=checked]:bg-green-500",
            "data-[state=unchecked]:bg-gray-200"
          )}
        />
        <span className={cn(
          "text-sm font-medium",
          isOnline ? "text-green-500" : "text-gray-500"
        )}>
          {isOnline ? "在线" : "离线"}
        </span>
      </div>
      <div className="text-sm text-gray-500">
        {isOnline ? "可接单" : "暂停接单"}
      </div>
    </div>
  );
};

