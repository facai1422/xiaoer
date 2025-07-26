
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  name: z.string().min(2, "请输入正确的姓名"),
  account: z.string().min(1, "请输入微信号"),
  qrcode: z.string().optional(),
});

const WechatBind = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      account: "",
      qrcode: "",
    },
  });
  
  // Check if user already has WeChat bound
  const { data: existingPayment, isLoading } = useQuery({
    queryKey: ['existing-wechat-payment'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from('user_payments')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('type', 'wechat')
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });
  
  // Get customer service notice
  const { data: noticeData } = useQuery({
    queryKey: ['customer-service-notice'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_service_notices')
        .select('*')
        .eq('title', '支付方式修改说明')
        .single();
      
      if (error) return { content: '为了保障资金安全，每种支付方式只能绑定一次。如需更换绑定信息，请联系客服协助处理。' };
      return data;
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("请先登录");
        return;
      }

      const { error } = await supabase
        .from('user_payments')
        .insert({
          user_id: session.user.id,
          type: 'wechat',
          account_name: values.name,
          account_number: values.account,
          qr_code_url: values.qrcode || null
        });

      if (error) throw error;
      
      // 刷新支付方式列表
      await queryClient.invalidateQueries({ queryKey: ['user-payments'] });
      await queryClient.invalidateQueries({ queryKey: ['existing-wechat-payment'] });
      
      toast.success("绑定成功");
      navigate('/payment/settings');
    } catch (error) {
      console.error('Error binding wechat:', error);
      toast.error("绑定失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleContactSupport = () => {
    navigate('/customer-service');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center border-b">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold flex-1 text-center mr-6">绑定微信</h1>
      </div>

      <div className="p-4">
        {existingPayment ? (
          <Card className="p-4">
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>已绑定微信</AlertTitle>
              <AlertDescription>
                {noticeData?.content || '为了保障资金安全，每种支付方式只能绑定一次。如需更换绑定信息，请联系客服协助处理。'}
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 rounded-md p-4 mb-4">
              <h3 className="font-medium text-gray-700 mb-2">当前绑定信息</h3>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">姓名:</span> {existingPayment.account_name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">微信号:</span> {existingPayment.account_number}
              </p>
            </div>
            
            <Button 
              onClick={handleContactSupport}
              className="w-full"
            >
              联系客服修改
            </Button>
          </Card>
        ) : (
          <Card className="p-4">
            <Alert className="mb-4">
              <AlertTitle>绑定说明</AlertTitle>
              <AlertDescription>
                {noticeData?.content || '为了保障资金安全，每种支付方式只能绑定一次。如需更换绑定信息，请联系客服协助处理。'}
              </AlertDescription>
            </Alert>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>真实姓名</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入真实姓名" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="account"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>微信号</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入微信号" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "绑定中..." : "确认绑定"}
                </Button>
              </form>
            </Form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WechatBind;
