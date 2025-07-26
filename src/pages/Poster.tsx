import React, { useState, useRef } from 'react';
import { ArrowLeft, Download, Share2, Copy, QrCode, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { InstantAuthCheck } from '@/components/auth/InstantAuthCheck';
import { useProfile } from '@/hooks/use-profile';
import QRCode from 'qrcode';

const Poster = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useProfile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // 获取推广链接
  const getPromotionLink = () => {
    const baseUrl = window.location.origin;
    const inviteCode = profile?.invite_code || 'loading'; // 使用真正的邀请码
    return `${baseUrl}/register?code=${inviteCode}`;
  };

  // 获取邀请码显示文本
  const getInviteCodeDisplay = () => {
    if (!profile?.invite_code) return 'loading...';
    const code = profile.invite_code;
    // 如果邀请码长度超过8位，显示前8位+省略号
    return code.length > 8 ? code.substring(0, 8) + '...' : code;
  };

  // 生成二维码
  const generateQRCode = async () => {
    try {
      // 检查邀请码是否有效
      if (!profile?.invite_code || profile.invite_code === 'loading') {
        toast({
          variant: "destructive",
          title: "请稍候",
          description: "用户信息正在加载中，请稍后再试"
        });
        return;
      }

      const promotionLink = getPromotionLink();
      const qrDataUrl = await QRCode.toDataURL(promotionLink, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeDataUrl(qrDataUrl);
      setShowQRCode(true);
    } catch (error) {
      console.error('生成二维码失败:', error);
      toast({
        variant: "destructive",
        title: "生成失败",
        description: "无法生成二维码，请稍后再试"
      });
    }
  };

  // 复制推广链接
  const copyPromotionLink = async () => {
    try {
      const link = getPromotionLink();
      
      // 检查是否有有效的邀请码
      if (!profile?.invite_code || profile.invite_code === 'loading') {
        toast({
          variant: "destructive",
          title: "请稍候",
          description: "用户信息正在加载中，请稍后再试"
        });
        return;
      }
      
      await navigator.clipboard.writeText(link);
      toast({
        title: "复制成功",
        description: "推广链接已复制到剪贴板"
      });
    } catch (error) {
      // 降级到手动复制提示
      const link = getPromotionLink();
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast({
          title: "复制成功",
          description: "推广链接已复制到剪贴板"
        });
      } catch (fallbackError) {
      toast({
        variant: "destructive",
        title: "复制失败",
        description: "请手动复制推广链接"
      });
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  // 下载海报
  const downloadPoster = () => {
    const link = document.createElement('a');
    link.href = '/lovable-uploads/photo_2025-06-20_18-10-30.jpg';
    link.download = '推广海报.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "下载成功",
      description: "海报已保存到您的设备"
    });
  };

  // 生成包含推广链接的海报
  const generatePosterWithLink = async () => {
    // 检查用户信息是否已加载
    if (!profile?.invite_code || profile.invite_code === 'loading') {
      toast({
        variant: "destructive",
        title: "请稍候",
        description: "用户信息正在加载中，请稍后再试"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        toast({
          variant: "destructive",
          title: "生成失败",
          description: "Canvas元素未找到"
        });
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast({
          variant: "destructive",
          title: "生成失败",
          description: "无法获取Canvas上下文"
        });
        return;
      }

      // 创建图片对象
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // 设置画布尺寸
        canvas.width = img.width;
        canvas.height = img.height;

        // 绘制原始海报
        ctx.drawImage(img, 0, 0);

        // 添加推广链接文字
        const promotionLink = getPromotionLink();
        const inviteCode = profile?.invite_code || 'loading';
        
        // 设置文字样式
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';

        // 添加邀请码
        const inviteText = `邀请码: ${inviteCode}`;
        const inviteY = canvas.height - 120;
        ctx.strokeText(inviteText, canvas.width / 2, inviteY);
        ctx.fillText(inviteText, canvas.width / 2, inviteY);

        // 添加推广链接
        ctx.font = '18px Arial';
        const linkY = canvas.height - 80;
        ctx.strokeText(promotionLink, canvas.width / 2, linkY);
        ctx.fillText(promotionLink, canvas.width / 2, linkY);

        // 下载生成的海报
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `推广海报_${inviteCode}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast({
              title: "生成成功",
              description: "包含推广链接的海报已下载"
            });
          }
        }, 'image/jpeg', 0.9);
      };

      img.onerror = () => {
        toast({
          variant: "destructive",
          title: "生成失败",
          description: "无法加载海报图片"
        });
      };

      img.src = '/lovable-uploads/photo_2025-06-20_18-10-30.jpg';
    } catch (error) {
      console.error('生成海报失败:', error);
      toast({
        variant: "destructive",
        title: "生成失败",
        description: "生成海报时出现错误"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 分享海报和链接
  const sharePosterAndLink = async () => {
    // 检查用户信息是否已加载
    if (!profile?.invite_code || profile.invite_code === 'loading') {
      toast({
        variant: "destructive",
        title: "请稍候",
        description: "用户信息正在加载中，请稍后再试"
      });
      return;
    }

    const promotionLink = getPromotionLink();
    const shareText = `🎉 邀请您加入我们的平台！\n\n💰 使用我的邀请码获得专属优惠\n📱 邀请码: ${profile.invite_code}\n🔗 注册链接: ${promotionLink}\n\n立即注册，开启您的财富之旅！`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '推广邀请',
          text: shareText,
          url: promotionLink
        });
      } catch (error) {
        // 用户取消分享或分享失败，回退到复制
        copyPromotionLink();
      }
    } else {
      // 不支持原生分享，复制到剪贴板
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "复制成功",
          description: "推广内容已复制到剪贴板，您可以粘贴到任何地方分享"
        });
      } catch (error) {
        copyPromotionLink();
      }
    }
  };

  // 如果用户信息还在加载中，显示加载状态
  if (!profile) {
    return (
      <InstantAuthCheck>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      </InstantAuthCheck>
    );
  }

  return (
    <InstantAuthCheck>
      <div className="min-h-screen bg-gray-50">
        {/* 头部导航 */}
        <div className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              返回
            </button>
            <h1 className="text-lg font-semibold text-gray-900">推广海报</h1>
            <div className="w-12"></div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* 海报展示 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">推广海报</h2>
              <div className="relative">
                <img
                  src="/lovable-uploads/photo_2025-06-20_18-10-30.jpg"
                  alt="推广海报"
                  className="w-full h-auto rounded-lg shadow-md"
                  style={{ maxHeight: '500px', objectFit: 'contain' }}
                  onError={(e) => {
                    console.error('海报图片加载失败');
                    toast({
                      variant: "destructive",
                      title: "图片加载失败",
                      description: "无法加载推广海报图片"
                    });
                  }}
                />
              </div>
            </div>
          </div>

          {/* 推广信息 */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">推广信息</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">您的邀请码</p>
                  <p className="text-lg font-mono font-semibold text-blue-600">
                    {getInviteCodeDisplay()}
                  </p>
                </div>
                <button
                  onClick={generateQRCode}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="生成二维码"
                >
                  <QrCode className="w-8 h-8 text-gray-400 hover:text-blue-600" />
                </button>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">推广链接</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-mono text-gray-800 flex-1 mr-2 break-all">
                    {getPromotionLink()}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPromotionLink}
                    className="flex-shrink-0"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    复制
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3">
            <Button
              onClick={sharePosterAndLink}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3"
              size="lg"
            >
              <Share2 className="w-5 h-5 mr-2" />
              分享海报和链接
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={downloadPoster}
                variant="outline"
                className="py-3"
              >
                <Download className="w-4 h-4 mr-2" />
                下载海报
              </Button>

              <Button
                onClick={generatePosterWithLink}
                disabled={isGenerating}
                variant="outline"
                className="py-3"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {isGenerating ? '生成中...' : '生成专属海报'}
              </Button>
            </div>
          </div>

          {/* 推广说明 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📢 推广说明</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• 分享您的专属邀请码给好友</p>
              <p>• 好友通过您的链接注册即可获得优惠</p>
              <p>• 您也将获得相应的推广奖励</p>
              <p>• 点击"分享海报和链接"可同时分享海报和推广链接</p>
              <p>• 点击邀请码旁边的二维码图标可生成推广二维码</p>
            </div>
          </div>
        </div>

        {/* 隐藏的画布用于生成海报 */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />

        {/* 二维码弹窗 */}
        {showQRCode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">推广二维码</h3>
                <button
                  onClick={() => setShowQRCode(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="关闭二维码"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border inline-block">
                  <img 
                    src={qrCodeDataUrl} 
                    alt="推广二维码" 
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  扫描二维码注册并获得优惠
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  邀请码: {profile?.invite_code}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={copyPromotionLink}
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  复制链接
                </Button>
                <Button 
                  onClick={() => {
                    // 下载二维码
                    const link = document.createElement('a');
                    link.href = qrCodeDataUrl;
                    link.download = `推广二维码_${profile?.invite_code}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    toast({
                      title: "下载成功",
                      description: "二维码已保存到您的设备"
                    });
                  }}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-1" />
                  下载二维码
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </InstantAuthCheck>
  );
};

export default Poster;
