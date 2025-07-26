
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";

const WalletAddress = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState("usdt-trc20");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user already has a wallet address bound
  const { data: existingPayment, isLoading } = useQuery({
    queryKey: ['existing-wallet-address'],
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
        .eq('type', 'usdt-trc20')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (address.length < 30) {
      toast.error("请输入有效的USDT地址");
      return;
    }

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
          type: type,
          account_name: name,
          account_number: address,
        });

      if (error) {
        console.error('Error binding USDT address:', error);
        toast.error("绑定失败，请重试");
        return;
      }
      
      toast.success("绑定成功");
      navigate('/profile');
    } catch (error) {
      console.error('Error binding USDT address:', error);
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
        <Button onClick={() => navigate(-1)} className="text-gray-600">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-lg font-semibold flex-1 text-center mr-6">绑定USDT地址</h1>
      </div>

      <div className="p-4">
        {existingPayment ? (
          <div className="space-y-4">
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>已绑定USDT地址</AlertTitle>
              <AlertDescription>
                {noticeData?.content || '为了保障资金安全，每种支付方式只能绑定一次。如需更换绑定信息，请联系客服协助处理。'}
              </AlertDescription>
            </Alert>
            
            <div className="bg-white rounded-md p-4 shadow-sm">
              <h3 className="font-medium text-gray-700 mb-2">当前绑定信息</h3>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">钱包名称:</span> {existingPayment.account_name}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">USDT类型:</span> {existingPayment.type.toUpperCase()}
              </p>
              <p className="text-sm text-gray-600 break-all">
                <span className="font-medium">钱包地址:</span> {existingPayment.account_number}
              </p>
            </div>
            
            <Button 
              onClick={handleContactSupport}
              className="w-full"
            >
              联系客服修改
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert>
              <AlertTitle>绑定说明</AlertTitle>
              <AlertDescription>
                {noticeData?.content || '为了保障资金安全，每种支付方式只能绑定一次。如需更换绑定信息，请联系客服协助处理。'}
              </AlertDescription>
            </Alert>
            
            <div>
              <label className="block text-sm font-medium mb-1">链类型</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                title="选择链类型"
              >
                <option value="usdt-trc20">USDT-TRC20</option>
                <option value="usdt-erc20">USDT-ERC20</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">钱包名称</label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入钱包名称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">USDT地址</label>
              <Input
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="请输入USDT地址"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "绑定中..." : "确认绑定"}
            </Button>
          </form>
        )}

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">温馨提示：</h3>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>• 请仔细核对USDT地址，确保输入正确</li>
            <li>• TRC20为推荐使用的链类型</li>
            <li>• 地址绑定后将用于收款</li>
            <li>• 每个账户只能绑定一次，请谨慎填写</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WalletAddress;
