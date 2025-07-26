
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PaymentChannel } from "@/types/payment";

const PaymentChannelsPage = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<PaymentChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('payment_channels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      console.error('Error loading channels:', error);
      toast.error("加载支付渠道失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (channelId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_channels')
        .update({ is_active: isActive })
        .eq('id', channelId);

      if (error) throw error;
      toast.success("支付渠道状态更新成功");
      loadChannels();
    } catch (error) {
      console.error('Error updating channel status:', error);
      toast.error("更新渠道状态失败");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-semibold">支付渠道</h1>
        </div>
        <Button onClick={() => navigate("/admin/payment/channels/new")}>
          添加支付渠道
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>渠道名称</TableHead>
              <TableHead>渠道代码</TableHead>
              <TableHead>汇率</TableHead>
              <TableHead>费率</TableHead>
              <TableHead>添加时间</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : channels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  暂无支付渠道
                </TableCell>
              </TableRow>
            ) : (
              channels.map((channel) => (
                <TableRow key={channel.id}>
                  <TableCell>{channel.name}</TableCell>
                  <TableCell>{channel.code}</TableCell>
                  <TableCell>{channel.exchange_rate}</TableCell>
                  <TableCell>{channel.fee_rate}%</TableCell>
                  <TableCell>
                    {new Date(channel.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={channel.is_active}
                      onCheckedChange={(checked) => 
                        handleStatusChange(channel.id, checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/admin/payment/channels/edit/${channel.id}`)}
                    >
                      编辑
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default PaymentChannelsPage;
