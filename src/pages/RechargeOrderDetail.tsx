import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface RechargeOrder {
  id: string;
  order_number: string;
  amount: number;
  actual_amount: number;
  payment_method: string;
  status: string;
  transaction_hash?: string; // 用作交易凭证
  created_at: string;
  updated_at: string;
  name?: string; // 用作备注
}

const RechargeOrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState<RechargeOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('recharge_orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('获取订单详情失败:', error);
        toast.error('获取订单详情失败');
        return;
      }

      setOrder(data);
    } catch (error) {
      console.error('获取订单详情异常:', error);
      toast.error('获取订单详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 检查文件大小 (最大10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('文件大小不能超过10MB');
        return;
      }

      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        toast.error('请选择图片文件');
        return;
      }

      setUploadedFile(file);
    }
  };

  const handleUploadProof = async () => {
    if (!uploadedFile || !order) return;

    setUploading(true);
    try {
      // 生成文件名
      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `proof_${order.id}_${Date.now()}.${fileExt}`;

      // 这里应该上传到实际的文件存储服务
      // 暂时模拟上传过程
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 更新订单状态和凭证信息（使用transaction_hash字段存储文件名）
      const { error } = await supabase
        .from('recharge_orders')
        .update({
          transaction_hash: fileName,
          status: 'proof_uploaded',
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) {
        console.error('更新订单失败:', error);
        toast.error('上传失败，请重试');
        return;
      }

      toast.success('交易凭证上传成功，等待审核');
      setOrder(prev => prev ? {
        ...prev,
        transaction_hash: fileName,
        status: 'proof_uploaded',
        updated_at: new Date().toISOString()
      } : null);
      setUploadedFile(null);
    } catch (error) {
      console.error('上传凭证失败:', error);
      toast.error('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!order) return;

    try {
      const { error } = await supabase
        .from('recharge_orders')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) {
        console.error('更新订单状态失败:', error);
        toast.error('操作失败，请重试');
        return;
      }

      toast.success('已标记为完成，等待管理员确认');
      setOrder(prev => prev ? {
        ...prev,
        status: 'completed',
        updated_at: new Date().toISOString()
      } : null);
    } catch (error) {
      console.error('标记完成失败:', error);
      toast.error('操作失败，请重试');
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: '待支付', color: 'bg-yellow-500', icon: Clock };
      case 'proof_uploaded':
        return { text: '凭证已上传', color: 'bg-blue-500', icon: Upload };
      case 'completed':
        return { text: '已完成', color: 'bg-green-500', icon: CheckCircle };
      case 'confirmed':
        return { text: '已确认', color: 'bg-green-600', icon: CheckCircle };
      case 'cancelled':
        return { text: '已取消', color: 'bg-red-500', icon: XCircle };
      default:
        return { text: '未知状态', color: 'bg-gray-500', icon: AlertCircle };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载订单详情...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">订单不存在</p>
          <Button onClick={() => navigate('/orders')}>返回订单列表</Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mr-3"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-lg font-semibold">充值订单详情</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* 订单状态 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">订单状态</h2>
              <Badge className={`${statusInfo.color} text-white`}>
                <StatusIcon className="w-4 h-4 mr-1" />
                {statusInfo.text}
              </Badge>
            </div>
            
            {order.status === 'cancelled' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">订单已取消</p>
                <p className="text-red-600 text-sm mt-1">
                  款项未收到，如有疑问请联系在线客服
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 订单信息 */}
        <Card>
          <CardHeader>
            <CardTitle>订单信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">订单号</span>
              <span className="font-mono">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">充值金额</span>
              <span className="font-bold text-lg">¥{order.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">USDT金额</span>
              <span className="font-bold">{order.actual_amount} USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">支付方式</span>
              <span>{order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">创建时间</span>
              <span>{new Date(order.created_at).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* 充值步骤 */}
        <Card>
          <CardHeader>
            <CardTitle>充值步骤</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">1</div>
                <span>复制收款地址到您的钱包</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">2</div>
                <span>转入对应金额的USDT</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">3</div>
                <span>上传交易凭证</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">4</div>
                <span>点击已完成，等待确认</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 上传凭证 */}
        {(order.status === 'pending' || order.status === 'proof_uploaded') && (
          <Card>
            <CardHeader>
              <CardTitle>上传交易凭证</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="proof-upload"
                />
                <label
                  htmlFor="proof-upload"
                  className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">点击选择交易凭证图片</p>
                  <p className="text-sm text-gray-400">支持 JPG、PNG 格式，最大 10MB</p>
                </label>
              </div>

              {uploadedFile && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">已选择文件: {uploadedFile.name}</p>
                  <Button
                    onClick={handleUploadProof}
                    disabled={uploading}
                    className="mt-2 w-full"
                  >
                    {uploading ? '上传中...' : '确认上传'}
                  </Button>
                </div>
              )}

              {order.transaction_hash && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800 font-medium">✓ 交易凭证已上传</p>
                  <p className="text-sm text-green-600">文件名: {order.transaction_hash}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 操作按钮 */}
        {order.status === 'proof_uploaded' && (
          <Card>
            <CardContent className="p-6">
              <Button
                onClick={handleMarkCompleted}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                已完成转账
              </Button>
              <p className="text-sm text-gray-500 text-center mt-2">
                确认已完成USDT转账后点击此按钮
              </p>
            </CardContent>
          </Card>
        )}

        {/* 备注信息 */}
        {order.name && (
          <Card>
            <CardHeader>
              <CardTitle>备注信息</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{order.name}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RechargeOrderDetail; 