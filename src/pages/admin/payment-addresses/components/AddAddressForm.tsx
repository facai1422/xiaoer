
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddAddressFormProps {
  onSuccess: () => void;
}

export const AddAddressForm = ({ onSuccess }: AddAddressFormProps) => {
  const [type, setType] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !address) {
      toast.error("请填写完整信息");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('platform_payment_addresses')
        .insert([
          { type, address, is_active: true }
        ]);

      if (error) throw error;

      toast.success("添加支付地址成功");
      setType("");
      setAddress("");
      onSuccess();
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error("添加支付地址失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">地址类型</label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="选择地址类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TRC20">TRC20</SelectItem>
              <SelectItem value="ERC20">ERC20</SelectItem>
              <SelectItem value="BTC">BTC</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">支付地址</label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="输入支付地址"
          />
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "添加中..." : "添加地址"}
      </Button>
    </form>
  );
};
