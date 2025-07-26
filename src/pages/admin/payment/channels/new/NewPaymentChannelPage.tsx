
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const NewPaymentChannelPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [channelData, setChannelData] = useState({
    name: "",
    code: "",
    exchange_rate: "1",
    fee_rate: "0",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setChannelData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!channelData.name || !channelData.code) {
      toast.error("请填写完整信息");
      return;
    }

    const exchangeRate = parseFloat(channelData.exchange_rate);
    const feeRate = parseFloat(channelData.fee_rate);

    if (isNaN(exchangeRate) || exchangeRate <= 0) {
      toast.error("请输入有效的汇率");
      return;
    }

    if (isNaN(feeRate) || feeRate < 0 || feeRate > 100) {
      toast.error("请输入有效的费率（0-100）");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('payment_channels')
        .insert([
          {
            name: channelData.name,
            code: channelData.code,
            exchange_rate: exchangeRate,
            fee_rate: feeRate,
            is_active: true
          }
        ]);

      if (error) throw error;
      
      toast.success("支付渠道添加成功");
      navigate("/admin/payment/channels");
    } catch (error) {
      console.error("Error adding payment channel:", error);
      toast.error("添加支付渠道失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-semibold">添加支付渠道</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">渠道名称</Label>
              <Input
                id="name"
                name="name"
                value={channelData.name}
                onChange={handleChange}
                placeholder="例如：USDT-TRC20"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code">渠道代码</Label>
              <Input
                id="code"
                name="code"
                value={channelData.code}
                onChange={handleChange}
                placeholder="例如：usdt-trc20"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="exchange_rate">汇率（USD/CNY）</Label>
              <Input
                id="exchange_rate"
                name="exchange_rate"
                type="number"
                step="0.01"
                min="0.01"
                value={channelData.exchange_rate}
                onChange={handleChange}
                placeholder="例如：7.2"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fee_rate">手续费率（%）</Label>
              <Input
                id="fee_rate"
                name="fee_rate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={channelData.fee_rate}
                onChange={handleChange}
                placeholder="例如：1.5"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              取消
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "提交中..." : "添加渠道"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewPaymentChannelPage;
