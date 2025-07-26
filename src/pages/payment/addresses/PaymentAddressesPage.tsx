
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type PaymentAddressType = "TRC20" | "ERC20";

interface PaymentAddress {
  id: string;
  type: PaymentAddressType;
  address: string;
  is_active: boolean;
}

const formSchema = z.object({
  address: z.string().min(1, "请输入钱包地址"),
  phone: z.string().min(11, "请输入正确的手机号").max(11, "请输入正确的手机号"),
});

export const PaymentAddressesPage = () => {
  const navigate = useNavigate();
  const [addressType, setAddressType] = useState<PaymentAddressType>("TRC20");
  const [platformAddress, setPlatformAddress] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
      phone: ""
    }
  });

  useEffect(() => {
    const loadPlatformAddress = async () => {
      const { data, error } = await supabase
        .from('platform_payment_addresses')
        .select('address')
        .eq('type', addressType)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error) {
        console.error('Error loading platform address:', error);
        toast.error("获取充值地址失败");
        return;
      }

      if (data) {
        setPlatformAddress(data.address);
      }
    };

    loadPlatformAddress();
  }, [addressType]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("请先登录");
        return;
      }

      const { error } = await supabase
        .from('user_payments')
        .insert({
          user_id: user.id,
          type: addressType,
          account_number: values.address,
          account_name: values.phone
        });

      if (error) throw error;

      toast.success("绑定成功");
      navigate(-1);
    } catch (error) {
      console.error('Error submitting payment address:', error);
      toast.error("绑定失败");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center border-b">
        <button onClick={() => navigate(-1)} className="text-gray-600" title="返回">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold flex-1 text-center mr-6">
          USDT充值
        </h1>
      </div>

      <div className="p-4">
        <Card className="p-4">
          <Tabs
            defaultValue="TRC20"
            className="mb-4"
            onValueChange={(value) => setAddressType(value as PaymentAddressType)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="TRC20">TRC20</TabsTrigger>
              <TabsTrigger value="ERC20">ERC20</TabsTrigger>
            </TabsList>
            <TabsContent value="TRC20">
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  请使用TRC20网络向以下地址转入USDT，转入后请提交凭证。
                </p>
                {platformAddress ? (
                  <div className="bg-gray-50 p-4 rounded-lg break-all">
                    <p className="text-sm font-mono">{platformAddress}</p>
                  </div>
                ) : (
                  <p className="text-sm text-red-500">暂无可用的充值地址</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="ERC20">
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  请使用ERC20网络向以下地址转入USDT，转入后请提交凭证。
                </p>
                {platformAddress ? (
                  <div className="bg-gray-50 p-4 rounded-lg break-all">
                    <p className="text-sm font-mono">{platformAddress}</p>
                  </div>
                ) : (
                  <p className="text-sm text-red-500">暂无可用的充值地址</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>手机号码</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入注册手机号" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>您的钱包地址</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`请输入您的${addressType}钱包地址`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                提交充值申请
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default PaymentAddressesPage;
