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
  Bell
} from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_active: boolean;
  is_scrolling: boolean;
  scroll_speed: number;
  display_order: number;
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
  // 弹窗相关字段
  is_popup?: boolean;
  popup_title?: string;
  popup_image_url?: string;
  popup_button_text?: string;
  popup_button_url?: string;
  show_today_no_remind?: boolean;
}

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    is_active: true,
    is_scrolling: true,
    scroll_speed: 50,
    display_order: 0,
    start_time: '',
    end_time: '',
    // 弹窗相关字段
    is_popup: false,
    popup_title: '',
    popup_image_url: '',
    popup_button_text: '我知道了',
    popup_button_url: '',
    show_today_no_remind: true
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      
      const mockData: Announcement[] = [
        {
          id: 1,
          title: "欢迎使用惠享生活平台",
          content: "我们提供便捷的充值缴费服务，享受优惠折扣！",
          type: "info",
          is_active: true,
          is_scrolling: true,
          scroll_speed: 50,
          display_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          title: "新用户福利",
          content: "新注册用户首次充值享受额外95折优惠！",
          type: "success",
          is_active: true,
          is_scrolling: true,
          scroll_speed: 50,
          display_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setAnnouncements(mockData);
    } catch (error) {
      console.error('获取公告失败:', error);
      toast.error('获取公告失败');
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
          updated_at: new Date().toISOString()
        };
        
        setAnnouncements(prev => 
          prev.map(item => 
            item.id === editingAnnouncement.id ? updatedAnnouncement : item
          )
        );
        
        toast.success('公告更新成功');
      } else {
        const newAnnouncement: Announcement = {
          id: Date.now(),
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setAnnouncements(prev => [...prev, newAnnouncement]);
        toast.success('公告创建成功');
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('保存公告失败:', error);
      toast.error('保存公告失败');
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      is_active: announcement.is_active,
      is_scrolling: announcement.is_scrolling,
      scroll_speed: announcement.scroll_speed,
      display_order: announcement.display_order,
      start_time: announcement.start_time || '',
      end_time: announcement.end_time || '',
      // 弹窗相关字段
      is_popup: announcement.is_popup || false,
      popup_title: announcement.popup_title || '',
      popup_image_url: announcement.popup_image_url || '',
      popup_button_text: announcement.popup_button_text || '我知道了',
      popup_button_url: announcement.popup_button_url || '',
      show_today_no_remind: announcement.show_today_no_remind || true
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条公告吗？')) {
      return;
    }
    
    try {
      setAnnouncements(prev => prev.filter(item => item.id !== id));
      toast.success('公告删除成功');
    } catch (error) {
      console.error('删除公告失败:', error);
      toast.error('删除公告失败');
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
      is_scrolling: true,
      scroll_speed: 50,
      display_order: 0,
      start_time: '',
      end_time: '',
      // 弹窗相关字段
      is_popup: false,
      popup_title: '',
      popup_image_url: '',
      popup_button_text: '我知道了',
      popup_button_url: '',
      show_today_no_remind: true
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-orange-100 text-orange-800',
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      info: '信息',
      warning: '警告',
      success: '成功',
      error: '错误'
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors]}>
        {getTypeIcon(type)}
        <span className="ml-1">{labels[type as keyof typeof labels]}</span>
      </Badge>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">网站公告管理</h1>
          <p className="text-gray-600 mt-1">管理首页显示的网站公告内容</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              新建公告
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl dialog-content-fixed">
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement ? '编辑公告' : '新建公告'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
                      <SelectItem value="warning">警告</SelectItem>
                      <SelectItem value="success">成功</SelectItem>
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
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="display_order">显示顺序</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    placeholder="数字越小越靠前"
                  />
                </div>
                
                <div>
                  <Label htmlFor="scroll_speed">滚动速度</Label>
                  <Input
                    id="scroll_speed"
                    type="number"
                    value={formData.scroll_speed}
                    onChange={(e) => setFormData(prev => ({ ...prev, scroll_speed: parseInt(e.target.value) || 50 }))}
                    placeholder="1-100"
                    min="1"
                    max="100"
                  />
                </div>
                
                <div className="flex items-center space-x-4 pt-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">启用</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_scrolling"
                      checked={formData.is_scrolling}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_scrolling: checked }))}
                    />
                    <Label htmlFor="is_scrolling">滚动</Label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">开始时间</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="end_time">结束时间</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
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

      <Card>
        <CardHeader>
          <CardTitle>公告列表</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">加载中...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>顺序</TableHead>
                  <TableHead>滚动</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{announcement.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {announcement.content}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(announcement.type)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={announcement.is_active ? "default" : "secondary"}>
                        {announcement.is_active ? '启用' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell>{announcement.display_order}</TableCell>
                    <TableCell>
                      {announcement.is_scrolling ? '是' : '否'}
                    </TableCell>
                    <TableCell>
                      {new Date(announcement.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(announcement)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(announcement.id)}
                        >
                          {announcement.is_active ? 
                            <EyeOff className="w-4 h-4" /> : 
                            <Eye className="w-4 h-4" />
                          }
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(announcement.id)}
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

export default AnnouncementsPage; 