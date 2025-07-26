import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  Monitor,
  Bell,
  Upload,
  ExternalLink,
  RefreshCw,
  Settings
} from "lucide-react";
import { getPopupStatus, resetPopupStatus, formatDateTime } from "@/components/home/PopupAnnouncementUtils";

interface PopupAnnouncement {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_active: boolean;
  display_order: number;
  // 弹窗相关字段
  is_popup: boolean;
  popup_title: string;
  popup_image_url?: string;
  popup_text_content?: string; // 新增：图片上的文字内容
  show_today_no_remind: boolean;
  created_at: string;
  updated_at: string;
}

const PopupAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<PopupAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<PopupAnnouncement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    is_active: true,
    display_order: 0,
    popup_title: '',
    popup_image_url: '',
    popup_text_content: '',
    show_today_no_remind: true
  });

  useEffect(() => {
    fetchPopupAnnouncements();
  }, []);

  const fetchPopupAnnouncements = async () => {
    try {
      setIsLoading(true);
      
      // 模拟数据，实际应从数据库获取
      const mockData: PopupAnnouncement[] = [
        {
          id: 1,
                  title: "欢迎来到惠享生活",
        content: "感谢您访问惠享生活平台！我们为您提供便捷的充值缴费服务，享受超值优惠折扣。新用户首次充值可享受额外优惠，快来体验吧！",
          type: "success",
          is_active: true,
          display_order: 1,
          is_popup: true,
          popup_title: "🎉 欢迎来到惠享生活平台",
          popup_image_url: "/lovable-uploads/gonggao.png",
          popup_text_content: "感谢您访问惠享生活平台！\n我们为您提供便捷的充值缴费服务\n享受超值优惠折扣\n新用户首次充值可享受额外优惠\n快来体验吧！",
          show_today_no_remind: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setAnnouncements(mockData);
    } catch (error) {
      console.error('获取弹窗公告失败:', error);
      toast.error('获取弹窗公告失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAnnouncement) {
        const updatedAnnouncement = {
          ...editingAnnouncement,
          ...formData,
          is_popup: true,
          updated_at: new Date().toISOString()
        };
        
        setAnnouncements(prev => 
          prev.map(item => 
            item.id === editingAnnouncement.id ? updatedAnnouncement : item
          )
        );
        
        // 当更新公告时，清除用户的"今日不再提示"设置，这样用户就能看到更新的公告
        localStorage.removeItem('popup_no_remind_until');
        
        toast.success('弹窗公告更新成功，更新的公告将重新显示给用户');
      } else {
        const newAnnouncement: PopupAnnouncement = {
          id: Date.now(),
          ...formData,
          is_popup: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setAnnouncements(prev => [...prev, newAnnouncement]);
        toast.success('弹窗公告创建成功');
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('保存弹窗公告失败:', error);
      toast.error('保存弹窗公告失败');
    }
  };

  const handleEdit = (announcement: PopupAnnouncement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      is_active: announcement.is_active,
      display_order: announcement.display_order,
      popup_title: announcement.popup_title,
      popup_image_url: announcement.popup_image_url || '',
      popup_text_content: announcement.popup_text_content || '',
      show_today_no_remind: announcement.show_today_no_remind
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条弹窗公告吗？')) {
      return;
    }
    
    try {
      setAnnouncements(prev => prev.filter(item => item.id !== id));
      toast.success('弹窗公告删除成功');
    } catch (error) {
      console.error('删除弹窗公告失败:', error);
      toast.error('删除弹窗公告失败');
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      setAnnouncements(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, is_active: !item.is_active, updated_at: new Date().toISOString() }
            : item
        )
      );
      toast.success('状态更新成功');
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新状态失败');
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      type: 'info',
      is_active: true,
      display_order: 0,
      popup_title: '',
      popup_image_url: '',
      popup_text_content: '',
      show_today_no_remind: true
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      info: 'default',
      warning: 'secondary',
      success: 'default',
      error: 'destructive'
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants]} className="flex items-center gap-1">
        {getTypeIcon(type)}
        {type === 'info' ? '信息' : type === 'warning' ? '警告' : type === 'success' ? '成功' : '错误'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">弹窗公告管理</h1>
          <p className="text-gray-600 mt-1">管理网站首次访问弹窗公告内容</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => {
              resetPopupStatus();
              toast.success('弹窗状态已重置，刷新页面后首次访问弹窗将重新显示');
              // 强制重新渲染以更新状态显示
              window.location.reload();
            }}
          >
            <RefreshCw className="w-4 h-4" />
            重置弹窗状态
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => {
              // 清除所有用户的"今日不再提示"状态
              localStorage.removeItem('popup_no_remind_until');
              // 清除今日已显示标记
              const today = new Date().toISOString().split('T')[0];
              sessionStorage.removeItem(`popup_shown_${today}`);
              
              toast.success('已强制重新显示弹窗，所有用户将重新看到弹窗公告');
            }}
          >
            <Bell className="w-4 h-4" />
            强制重新显示
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                新建弹窗公告
              </Button>
            </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement ? '编辑弹窗公告' : '新建弹窗公告'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    基础设置
                  </TabsTrigger>
                  <TabsTrigger value="popup" className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    弹窗设置
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">公告标题</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="请输入公告标题"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="type">公告类型</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value: 'info' | 'warning' | 'success' | 'error') => 
                          setFormData(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">信息</SelectItem>
                          <SelectItem value="success">成功</SelectItem>
                          <SelectItem value="warning">警告</SelectItem>
                          <SelectItem value="error">错误</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="content">公告内容</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="请输入公告内容"
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="display_order">显示顺序</Label>
                      <Input
                        id="display_order"
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label htmlFor="is_active">立即启用</Label>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="popup" className="space-y-4">
                  <div>
                    <Label htmlFor="popup_title">弹窗标题</Label>
                    <Input
                      id="popup_title"
                      value={formData.popup_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, popup_title: e.target.value }))}
                      placeholder="请输入弹窗标题"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="popup_image_url">弹窗图片URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="popup_image_url"
                        value={formData.popup_image_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, popup_image_url: e.target.value }))}
                        placeholder="/lovable-uploads/gonggao.png"
                      />
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">默认使用: /lovable-uploads/gonggao.png</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="popup_text_content">图片文字内容</Label>
                    <Textarea
                      id="popup_text_content"
                      value={formData.popup_text_content}
                      onChange={(e) => setFormData(prev => ({ ...prev, popup_text_content: e.target.value }))}
                      placeholder="请输入要显示在图片白色区域的文字内容，支持换行"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">文字将显示在图片的白色区域，支持使用 \n 换行</p>
                  </div>
                  

                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_today_no_remind"
                      checked={formData.show_today_no_remind}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_today_no_remind: checked }))}
                    />
                    <Label htmlFor="show_today_no_remind">显示"今日不再提示"选项</Label>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  取消
                </Button>
                <Button type="submit">
                  {editingAnnouncement ? '更新' : '创建'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* 弹窗状态信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            弹窗状态信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(() => {
              const status = getPopupStatus();
              return (
                <>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">首次访问状态</div>
                    <div className="font-medium">
                      {status.isFirstVisit ? (
                        <span className="text-green-600">✅ 未显示（首次访问）</span>
                      ) : (
                        <span className="text-gray-600">❌ 已显示过</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">首次显示时间</div>
                    <div className="font-medium text-xs">
                      {formatDateTime(status.firstVisitDate)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">最后显示时间</div>
                    <div className="font-medium text-xs">
                      {formatDateTime(status.lastShownTime)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">不再提示到期</div>
                    <div className="font-medium text-xs">
                      {status.noRemindUntil || '未设置'}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* 公告列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            弹窗公告列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无弹窗公告</p>
              <p className="text-sm text-gray-400 mt-2">点击上方按钮创建第一条弹窗公告</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>弹窗标题</TableHead>
                  <TableHead>图片文字</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium">
                      {announcement.title}
                    </TableCell>
                    <TableCell>
                      {announcement.popup_title}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-32 truncate text-sm text-gray-600">
                        {announcement.popup_text_content ? 
                          announcement.popup_text_content.replace(/\n/g, ' ') : 
                          '无文字内容'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(announcement.type)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(announcement.id)}
                        className={`flex items-center gap-1 ${
                          announcement.is_active 
                            ? 'text-green-600 hover:text-green-700' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {announcement.is_active ? (
                          <>
                            <Eye className="w-4 h-4" />
                            启用中
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" />
                            已禁用
                          </>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {new Date(announcement.created_at).toLocaleDateString('zh-CN')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(announcement)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(announcement.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PopupAnnouncementsPage; 