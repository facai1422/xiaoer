
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Camera, User, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [username, setUsername] = useState("用户昵称");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("/lovable-uploads/fed27bfa-2d72-4a2e-a004-8b21c76ad241.png");
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = () => {
    toast.success("设置已保存");
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 文件类型和大小检查
    if (!file.type.startsWith('image/')) {
      toast.error("请上传图片文件");
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB限制
      toast.error("图片不能超过2MB");
      return;
    }

    try {
      setIsUploading(true);
      // 使用当前时间戳创建唯一文件名
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 上传文件到Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 获取上传文件的公共URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 更新头像URL
      setAvatarUrl(data.publicUrl);
      toast.success("头像上传成功");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("头像上传失败，请重试");
    } finally {
      setIsUploading(false);
    }
  };

  const saveUsername = () => {
    if (username.trim()) {
      setIsEditingUsername(false);
      toast.success("昵称已更新");
    } else {
      toast.error("昵称不能为空");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center">
        <Button 
          variant="ghost" 
          className="p-0 mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold flex-1 text-center mr-6">商户设置</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* 用户资料卡片 */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">个人资料</h3>
          <div className="flex flex-col items-center space-y-4">
            {/* 头像上传 */}
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-white shadow-md">
                <AvatarImage src={avatarUrl} alt="用户头像" />
                <AvatarFallback className="bg-blue-100 text-blue-500">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full cursor-pointer shadow-md hover:bg-blue-600 transition-colors">
                <Camera className="h-4 w-4" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            
            {/* 用户昵称 */}
            <div className="w-full">
              {isEditingUsername ? (
                <div className="flex items-center space-x-2">
                  <Input 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1"
                    placeholder="请输入昵称"
                    autoFocus
                  />
                  <Button onClick={saveUsername} size="sm">保存</Button>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg font-medium">{username}</span>
                  <button 
                    onClick={() => setIsEditingUsername(true)} 
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">通知设置</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>新订单通知</Label>
                <p className="text-sm text-gray-500">接收新订单提醒</p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>自动接单</Label>
                <p className="text-sm text-gray-500">自动接受新订单</p>
              </div>
              <Switch
                checked={autoAccept}
                onCheckedChange={setAutoAccept}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">支付设置</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>最小接单金额</Label>
              <Input type="number" placeholder="请输入最小接单金额" />
            </div>
            <div className="space-y-2">
              <Label>最大接单金额</Label>
              <Input type="number" placeholder="请输入最大接单金额" />
            </div>
          </div>
        </Card>

        <Button className="w-full" onClick={handleSave}>
          保存设置
        </Button>
      </div>
    </div>
  );
};

export default Settings;
