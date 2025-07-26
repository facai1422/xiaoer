
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AddMerchantSheet = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: "",
    secretKey: "",
  });

  const validateForm = () => {
    if (!formData.nickname || !formData.secretKey) {
      toast.error("请填写所有必填字段");
      return false;
    }
    if (formData.secretKey.length < 6) {
      toast.error("密钥长度至少6位");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      // Create auth user using the secret key as password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${crypto.randomUUID()}@merchant.com`, // Use a random UUID as email
        password: formData.secretKey,
        options: {
          data: {
            secretKey: formData.secretKey,
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        toast.error("创建用户失败");
        return;
      }

      if (!authData.user) {
        toast.error("创建用户失败");
        return;
      }

      // Create merchant profile
      const { error: profileError } = await supabase
        .from('merchant_profiles')
        .insert({
          user_id: authData.user.id,
          nickname: formData.nickname,
          status: true,
          account_balance: 0,
          freeze_balance: 0,
          team_count: 0,
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        toast.error("创建商户信息失败");
        return;
      }

      toast.success("商户创建成功");
      setIsOpen(false);
      setFormData({ nickname: "", secretKey: "" });
    } catch (error) {
      console.error('创建商户失败:', error);
      toast.error("创建商户失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">+ 新增</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>新增商户</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">商户昵称</label>
            <Input
              required
              value={formData.nickname}
              onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
              placeholder="请输入商户昵称"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">登录密钥</label>
            <Input
              required
              type="password"
              value={formData.secretKey}
              onChange={(e) => setFormData(prev => ({ ...prev, secretKey: e.target.value }))}
              placeholder="请输入登录密钥"
            />
          </div>
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "创建中..." : "确认创建"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
