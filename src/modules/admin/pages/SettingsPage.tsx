
import { useState } from "react";
import { AdminLayout } from "../layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, User, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SettingsPage = () => {
  const [maintenance, setMaintenance] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [username, setUsername] = useState("管理员");
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
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">系统设置</h1>

        {/* 管理员资料卡片 */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">管理员资料</h3>
          <div className="flex items-center space-x-6">
            {/* 头像上传 */}
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-white shadow-md">
                <AvatarImage src={avatarUrl} alt="管理员头像" />
                <AvatarFallback className="bg-blue-100 text-blue-500">
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <label htmlFor="admin-avatar-upload" className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full cursor-pointer shadow-md hover:bg-blue-600 transition-colors">
                <Camera className="h-4 w-4" />
                <input 
                  id="admin-avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            
            {/* 管理员昵称 */}
            <div className="flex-1">
              <Label className="block mb-1">管理员昵称</Label>
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
                <div className="flex items-center space-x-2">
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

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">基本设置</TabsTrigger>
            <TabsTrigger value="security">安全设置</TabsTrigger>
            <TabsTrigger value="payment">支付设置</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>系统维护模式</Label>
                    <p className="text-sm text-gray-500">
                      启用后用户将无法访问系统
                    </p>
                  </div>
                  <Switch
                    checked={maintenance}
                    onCheckedChange={setMaintenance}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>开放注册</Label>
                    <p className="text-sm text-gray-500">
                      是否允许新用户注册
                    </p>
                  </div>
                  <Switch
                    checked={registrationEnabled}
                    onCheckedChange={setRegistrationEnabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label>系统名称</Label>
                  <Input placeholder="请输入系统名称" />
                </div>

                <div className="space-y-2">
                  <Label>联系邮箱</Label>
                  <Input type="email" placeholder="请输入联系邮箱" />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>密码最小长度</Label>
                  <Input type="number" min="6" max="32" placeholder="请输入密码最小长度" />
                </div>

                <div className="space-y-2">
                  <Label>登录失败次数限制</Label>
                  <Input type="number" placeholder="请输入登录失败次数限制" />
                </div>

                <div className="space-y-2">
                  <Label>IP黑名单</Label>
                  <Input placeholder="请输入IP地址，多个用逗号分隔" />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>最小充值金额</Label>
                  <Input type="number" placeholder="请输入最小充值金额" />
                </div>

                <div className="space-y-2">
                  <Label>最大充值金额</Label>
                  <Input type="number" placeholder="请输入最大充值金额" />
                </div>

                <div className="space-y-2">
                  <Label>手续费率(%)</Label>
                  <Input type="number" step="0.01" placeholder="请输入手续费率" />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Button onClick={handleSave}>保存设置</Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
