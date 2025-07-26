
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
  bankName: z.string().min(1, "请输入开户银行"),
  cardNumber: z.string().min(16, "请输入正确的银行卡号").max(19, "请输入正确的银行卡号"),
  branch: z.string().min(1, "请输入支行名称"),
});

const BankBind = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bankName: "",
      cardNumber: "",
      branch: "",
    },
  });
  
  // Check if user already has a bank account bound
  const { data: existingPayment, isLoading } = useQuery({
    queryKey: ['existing-bank-payment'],
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
        .eq('type', 'bank')
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
          type: 'bank',
          account_name: values.name,
          account_number: values.cardNumber,
          bank_name: values.bankName,
          bank_branch: values.branch
        });

      if (error) throw error;
      
      // 刷新支付方式列表
      await queryClient.invalidateQueries({ queryKey: ['user-payments'] });
      await queryClient.invalidateQueries({ queryKey: ['existing-bank-payment'] });
      
      toast.success("绑定成功");
      navigate('/payment/settings');
    } catch (error) {
      console.error('Error binding bank account:', error);
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
        <h1 className="text-lg font-semibold flex-1 text-center mr-6">绑定银行卡</h1>
      </div>

      <div className="p-4">
        {existingPayment ? (
          <Card className="p-4">
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>已绑定银行卡</AlertTitle>
              <AlertDescription>
                {noticeData?.content || '为了保障资金安全，每种支付方式只能绑定一次。如需更换绑定信息，请联系客服协助处理。'}
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 rounded-md p-4 mb-4">
              <h3 className="font-medium text-gray-700 mb-2">当前绑定信息</h3>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">持卡人:</span> {existingPayment.account_name}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">银行:</span> {existingPayment.bank_name}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">支行:</span> {existingPayment.bank_branch}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">卡号:</span> {existingPayment.account_number}
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
                      <FormLabel>持卡人姓名</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入持卡人姓名" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>开户银行</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入开户银行" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>银行卡号</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入银行卡号" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>开户支行</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入开户支行" {...field} />
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

export default BankBind;
