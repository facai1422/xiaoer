import { Button } from "@/components/ui/button";
import { Copy, Upload, Camera, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { updateTransactionStatus } from "@/services/rechargeService";
import { supabase } from "@/integrations/supabase/client";

interface RechargeOrder {
  id: string;
  order_number: string;
  amount: number;
  status?: string;
}

interface PaymentAddress {
  id: string;
  address: string;
  type: string;
}

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentOrder: RechargeOrder | null;
  selectedAddress: PaymentAddress | null;
}

export const OrderDialog = ({
  open,
  onOpenChange,
  currentOrder,
  selectedAddress
}: OrderDialogProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [timeLeft, setTimeLeft] = useState<number>(1800); // 30 minutes in seconds
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTransferred, setIsTransferred] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    let timerInterval: number | undefined;
    
    if (open) {
      setTimeLeft(1800); // Reset timer when dialog opens
      setPaymentProof(null);
      setIsTransferred(false);
      setProofUploaded(false);
      setUploadProgress(0);
      
      timerInterval = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [open]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB限制
        toast.error("文件过大，请选择小于10MB的图片文件");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error("请选择图片文件");
        return;
      }
      
      setPaymentProof(file);
      toast.success("交易凭证已选择，正在上传...");
      
      // 选择文件后直接上传
      handleUploadProof(file);
    }
  };

  const handleUploadProof = async (file?: File) => {
    const fileToUpload = file || paymentProof;
    if (!fileToUpload || !currentOrder) {
      toast.error("请先选择交易凭证");
      return;
    }

    console.log('开始上传交易凭证:', {
      fileName: fileToUpload.name,
      fileSize: fileToUpload.size,
      orderId: currentOrder.id
    });

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // 生成唯一的文件名
      const timestamp = Date.now();
      const fileExtension = fileToUpload.name.split('.').pop() || 'png';
      const fileName = `payment-proof-${currentOrder.order_number}-${timestamp}.${fileExtension}`;
      const filePath = `payment-proofs/${fileName}`;

      setUploadProgress(20);
      console.log('开始上传到存储桶:', filePath);

      // 上传文件到Supabase存储桶
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileToUpload, {
          contentType: fileToUpload.type,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('存储桶上传失败:', uploadError);
        toast.error(`上传失败: ${uploadError.message}`);
        return;
      }

      console.log('存储桶上传成功:', uploadData);
      setUploadProgress(60);

      // 获取图片的公开URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;
      console.log('图片公开URL:', imageUrl);

      setUploadProgress(80);

      // 生成简化的文件信息，只存储必要的URL
      const fileInfo = {
        url: imageUrl,
        name: fileToUpload.name
      };

      console.log('准备更新数据库，订单ID:', currentOrder.id);

      // 更新订单状态为已上传凭证，将文件信息和URL存储在transaction_hash字段
      const { error: updateError } = await supabase
        .from('recharge_orders')
        .update({
          status: 'proof_uploaded',
          transaction_hash: JSON.stringify(fileInfo),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentOrder.id);

      if (updateError) {
        console.error('更新订单状态失败:', updateError);
        toast.error(`更新订单状态失败: ${updateError.message}`);
        
        // 如果数据库更新失败，删除已上传的文件
        await supabase.storage
          .from('avatars')
          .remove([filePath]);
        
        return;
      }

      console.log('交易凭证上传成功');
      setUploadProgress(100);
      setProofUploaded(true);
      toast.success("交易凭证上传成功！");
      
    } catch (error) {
      console.error('上传交易凭证失败:', error);
      toast.error(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTransferred = async () => {
    if (!currentOrder) return;
    
    try {
      // 更新订单状态为已上传凭证（因为凭证已经上传了）
      const { error } = await supabase
        .from('recharge_orders')
        .update({
          status: 'proof_uploaded',
          updated_at: new Date().toISOString()
        })
        .eq('id', currentOrder.id);

      if (error) {
        console.error('更新订单状态失败:', error);
        toast.error('操作失败，请重试');
        return;
      }

      setIsTransferred(true);
      toast.success("充值申请已提交！等待管理员审核");
    } catch (error) {
      console.error('确认转账失败:', error);
      toast.error("操作失败，请重试");
    }
  };

  const handleSubmitOrder = () => {
    if (!proofUploaded) {
      toast.error("请先上传交易凭证");
      return;
    }
    
    handleTransferred();
  };

  const handleViewOrders = () => {
    onOpenChange(false);
    navigate('/wallet-recharge');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>充值订单信息</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-orange-500 font-medium">订单超时时间</span>
              <span className="text-orange-500 font-medium">{formatTime(timeLeft)}</span>
            </div>
            <p className="text-sm text-orange-500 mt-1">
              请在规定时间内完成付款，超时订单将自动取消
            </p>
          </div>
          
          {currentOrder && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">订单号</span>
                  <span className="font-medium">{currentOrder.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">充值金额</span>
                  <span className="font-medium">{currentOrder.amount} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">收款地址</span>
                  <div className="flex items-center">
                    <span className="font-mono text-sm mr-2 truncate max-w-[150px]">
                      {selectedAddress?.address}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleCopy(selectedAddress?.address || '')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-600 mb-2">充值步骤</h4>
                <ol className="list-decimal list-inside text-sm space-y-2 text-gray-700">
                  <li>复制收款地址到您的钱包</li>
                  <li>转入对应金额的USDT</li>
                  <li>选择交易凭证图片自动上传</li>
                  <li>点击"提交"完成充值申请</li>
                </ol>
              </div>

              {/* 转账确认和凭证上传区域 */}
              <div className="space-y-3">
                {!proofUploaded && (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        title="选择交易凭证图片"
                        aria-label="选择交易凭证图片"
                      />
                      
                      {!paymentProof && !proofUploaded ? (
                        <div>
                          <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">上传交易凭证</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleFileSelect}
                            disabled={isUploading}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {isUploading ? `上传中... ${uploadProgress}%` : "选择图片"}
                          </Button>
                        </div>
                      ) : paymentProof && !proofUploaded ? (
                        <div>
                          <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-pulse" />
                          <p className="text-sm text-gray-600 mb-2">正在上传: {paymentProof.name}</p>
                          <div className="text-blue-500 text-sm">
                            {isUploading ? `上传进度: ${uploadProgress}%` : "处理中..."}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {isUploading && uploadProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                )}

                {proofUploaded && !isTransferred && (
                  <div className="space-y-3">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                        <div>
                          <p className="text-green-700 font-medium">交易凭证已上传成功</p>
                          <p className="text-green-600 text-sm">请点击底部"提交"按钮完成充值申请</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {proofUploaded && isTransferred && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                      <div>
                        <p className="text-green-700 font-medium">充值申请已提交</p>
                        <p className="text-green-600 text-sm">等待管理员审核，请耐心等待</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>关闭</Button>
          {proofUploaded && isTransferred ? (
            <Button onClick={handleViewOrders}>查看我的订单</Button>
          ) : (
            <Button onClick={handleSubmitOrder} disabled={!proofUploaded}>
              提交
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
