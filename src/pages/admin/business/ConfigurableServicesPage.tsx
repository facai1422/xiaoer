import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getAdminSession } from "@/utils/adminAuth";
import { 
  Search, 
  RefreshCw, 
  Plus,
  Edit,
  Trash2,
  Package,
  Settings,
  Save,
  X,
  Upload,
  Link as LinkIcon,
  Eye,
  Copy,
  DollarSign,
  Percent,
  Tag,
  Calculator,
  BookOpen,
  FileText,
  Phone,
  Mail,
  Lock,
  QrCode
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  getAllConfigurableServices,
  updateConfigurableService,
  toggleServiceStatus,
  deleteConfigurableService,
  getDefaultFormFieldTemplates,
  type ConfigurableService,
  type ConfigurableFormField,
  type TutorialStep
} from "@/services/configurableServicesService";

const ConfigurableServicesPage = () => {
  const { toast } = useToast();
  
  // 状态管理
  const [services, setServices] = useState<ConfigurableService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // 对话框状态
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ConfigurableService | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingService, setDeletingService] = useState<ConfigurableService | null>(null);
  
  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo_url: '',
    exchange_rate: 7.2,
    discount_rate: 0.8,
    min_amount: 1,
    max_amount: 10000,
    quick_amounts: [100, 200, 500, 1000, 2000, 5000],
    tutorial_title: '',
    tutorial_content: '',
    show_tutorial: false,
    tutorial_steps: [] as TutorialStep[],
    form_fields: [] as ConfigurableFormField[]
  });

  // 统计数据
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setIsLoading(true);

      // 检查管理员权限
      const adminSession = getAdminSession();
      if (!adminSession) {
        toast({
          variant: "destructive",
          title: "权限错误",
          description: "请先登录管理员账户"
        });
        return;
      }

      const servicesData = await getAllConfigurableServices();
      setServices(servicesData);

      // 更新统计数据
      setStats({
        total: servicesData.length,
        active: servicesData.filter(s => s.status === 'active').length,
        inactive: servicesData.filter(s => s.status === 'inactive').length
      });

    } catch (error) {
      console.error('加载服务失败:', error);
      toast({
        variant: "destructive",
        title: "加载失败",
        description: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 打开编辑对话框
  const handleEdit = (service: ConfigurableService) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      logo_url: service.logo_url,
      exchange_rate: service.exchange_rate,
      discount_rate: service.discount_rate,
      min_amount: service.min_amount,
      max_amount: service.max_amount,
      quick_amounts: service.quick_amounts || [100, 200, 500, 1000, 2000, 5000],
      tutorial_title: service.tutorial_title,
      tutorial_content: service.tutorial_content,
      show_tutorial: service.show_tutorial,
      tutorial_steps: service.tutorial_steps || [],
      form_fields: service.form_fields || []
    });
    setIsEditDialogOpen(true);
  };

  // 保存编辑
  const handleSave = async () => {
    if (!editingService) return;

    try {
      await updateConfigurableService(editingService.id, {
        name: formData.name,
        description: formData.description,
        logo_url: formData.logo_url,
        exchange_rate: formData.exchange_rate,
        discount_rate: formData.discount_rate,
        min_amount: formData.min_amount,
        max_amount: formData.max_amount,
        quick_amounts: formData.quick_amounts,
        tutorial_title: formData.tutorial_title,
        tutorial_content: formData.tutorial_content,
        show_tutorial: formData.show_tutorial,
        tutorial_steps: formData.tutorial_steps,
        form_fields: formData.form_fields
      });

      toast({
        title: "保存成功",
        description: "服务配置已更新"
      });

      setIsEditDialogOpen(false);
      setEditingService(null);
      loadServices();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "保存失败",
        description: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  // 切换状态
  const handleToggleStatus = async (service: ConfigurableService) => {
    try {
      await toggleServiceStatus(service.id);
      toast({
        title: "状态更新成功",
        description: `服务已${service.status === 'active' ? '禁用' : '启用'}`
      });
      loadServices();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "状态更新失败",
        description: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  // 删除服务
  const handleDelete = async () => {
    if (!deletingService) return;

    try {
      await deleteConfigurableService(deletingService.id);
      toast({
        title: "删除成功",
        description: "服务已删除"
      });
      setIsDeleteDialogOpen(false);
      setDeletingService(null);
      loadServices();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "删除失败",
        description: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  // 添加表单字段
  const handleAddFormField = () => {
    const newField: ConfigurableFormField = {
      id: `field_${Date.now()}`,
      name: `field_${formData.form_fields.length + 1}`,
      label: '新字段',
      type: 'text',
      placeholder: '请输入内容',
      required: false
    };
    setFormData(prev => ({
      ...prev,
      form_fields: [...prev.form_fields, newField]
    }));
  };

  // 删除表单字段
  const handleRemoveFormField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      form_fields: prev.form_fields.filter((_, i) => i !== index)
    }));
  };

  // 更新表单字段
  const handleUpdateFormField = (index: number, field: ConfigurableFormField) => {
    setFormData(prev => ({
      ...prev,
      form_fields: prev.form_fields.map((f, i) => i === index ? field : f)
    }));
  };

  // 添加教程步骤
  const handleAddTutorialStep = () => {
    const newStep: TutorialStep = {
      id: `step_${Date.now()}`,
      title: '新步骤',
      description: '步骤描述',
      type: 'default'
    };
    setFormData(prev => ({
      ...prev,
      tutorial_steps: [...prev.tutorial_steps, newStep]
    }));
  };

  // 删除教程步骤
  const handleRemoveTutorialStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tutorial_steps: prev.tutorial_steps.filter((_, i) => i !== index)
    }));
  };

  // 更新教程步骤
  const handleUpdateTutorialStep = (index: number, step: TutorialStep) => {
    setFormData(prev => ({
      ...prev,
      tutorial_steps: prev.tutorial_steps.map((s, i) => i === index ? step : s)
    }));
  };

  // 过滤服务
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 表单字段类型图标
  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'password': return <Lock className="w-4 h-4" />;
      case 'url': return <LinkIcon className="w-4 h-4" />;
      case 'qrcode': return <QrCode className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">可配置在线业务</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理自定义在线业务服务，支持灵活配置表单和流程
          </p>
        </div>
        <Button onClick={loadServices} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总服务数</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已启用</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已禁用</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索服务名称或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">已启用</SelectItem>
                <SelectItem value="inactive">已禁用</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 服务列表 */}
      <Card>
        <CardHeader>
          <CardTitle>服务列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>服务名称</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>汇率</TableHead>
                <TableHead>折扣</TableHead>
                <TableHead>表单字段</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {service.logo_url && (
                        <img 
                          src={service.logo_url} 
                          alt={service.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-500">{service.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                      {service.status === 'active' ? '已启用' : '已禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell>{service.exchange_rate}</TableCell>
                  <TableCell>{(service.discount_rate * 10).toFixed(1)}折</TableCell>
                  <TableCell>{service.form_fields?.length || 0}个字段</TableCell>
                  <TableCell>
                    {new Date(service.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={service.status === 'active'}
                        onCheckedChange={() => handleToggleStatus(service)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDeletingService(service);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑服务配置</DialogTitle>
            <DialogDescription>
              配置服务的基本信息、价格策略、表单字段和教程内容
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">基本信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">服务名称</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="请输入服务名称"
                  />
                </div>
                <div>
                  <Label htmlFor="logo_url">LOGO地址</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="请输入LOGO图片地址"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">服务描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="请输入服务描述"
                />
              </div>
            </div>

            {/* 价格配置 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">价格配置</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="exchange_rate">汇率</Label>
                  <Input
                    id="exchange_rate"
                    type="number"
                    step="0.01"
                    value={formData.exchange_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, exchange_rate: parseFloat(e.target.value) || 7.2 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="discount_rate">折扣率</Label>
                  <Input
                    id="discount_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.discount_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_rate: parseFloat(e.target.value) || 0.8 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="min_amount">最小金额</Label>
                  <Input
                    id="min_amount"
                    type="number"
                    value={formData.min_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_amount: parseFloat(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="max_amount">最大金额</Label>
                  <Input
                    id="max_amount"
                    type="number"
                    value={formData.max_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_amount: parseFloat(e.target.value) || 10000 }))}
                  />
                </div>
              </div>
            </div>

            {/* 表单字段配置 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">表单字段配置</h3>
                <Button onClick={handleAddFormField} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  添加字段
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.form_fields.map((field, index) => (
                  <div key={field.id} className="border p-4 rounded-lg">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label>字段名称</Label>
                        <Input
                          value={field.name}
                          onChange={(e) => handleUpdateFormField(index, { ...field, name: e.target.value })}
                          placeholder="字段名称"
                        />
                      </div>
                      <div>
                        <Label>显示标签</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => handleUpdateFormField(index, { ...field, label: e.target.value })}
                          placeholder="显示标签"
                        />
                      </div>
                      <div>
                        <Label>字段类型</Label>
                        <Select value={field.type} onValueChange={(value: any) => handleUpdateFormField(index, { ...field, type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">文本</SelectItem>
                            <SelectItem value="email">邮箱</SelectItem>
                            <SelectItem value="phone">手机号</SelectItem>
                            <SelectItem value="password">密码</SelectItem>
                            <SelectItem value="url">链接</SelectItem>
                            <SelectItem value="textarea">多行文本</SelectItem>
                            <SelectItem value="number">数字</SelectItem>
                            <SelectItem value="select">下拉选择</SelectItem>
                            <SelectItem value="file">文件上传</SelectItem>
                            <SelectItem value="qrcode">二维码</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end space-x-2">
                        <div className="flex items-center space-x-2">
                          <input
                            id={`required-checkbox-${field.id}`}
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleUpdateFormField(index, { ...field, required: e.target.checked })}
                            title="是否必填"
                            aria-label="是否必填"
                          />
                          <Label className="text-sm">必填</Label>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveFormField(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Label>占位符</Label>
                      <Input
                        value={field.placeholder || ''}
                        onChange={(e) => handleUpdateFormField(index, { ...field, placeholder: e.target.value })}
                        placeholder="输入占位符文本"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 教程配置 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">教程配置</h3>
                <div className="flex items-center space-x-2">
                  <Label>显示教程</Label>
                  <Switch
                    checked={formData.show_tutorial}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_tutorial: checked }))}
                  />
                </div>
              </div>
              
              {formData.show_tutorial && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tutorial_title">教程标题</Label>
                    <Input
                      id="tutorial_title"
                      value={formData.tutorial_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, tutorial_title: e.target.value }))}
                      placeholder="请输入教程标题"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tutorial_content">教程内容</Label>
                    <Textarea
                      id="tutorial_content"
                      value={formData.tutorial_content}
                      onChange={(e) => setFormData(prev => ({ ...prev, tutorial_content: e.target.value }))}
                      placeholder="请输入教程内容"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <Label>教程步骤</Label>
                      <Button onClick={handleAddTutorialStep} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        添加步骤
                      </Button>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                      {formData.tutorial_steps.map((step, index) => (
                        <div key={step.id} className="border p-3 rounded">
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-4">
                              <Input
                                value={step.title}
                                onChange={(e) => handleUpdateTutorialStep(index, { ...step, title: e.target.value })}
                                placeholder="步骤标题"
                              />
                            </div>
                            <div className="col-span-6">
                              <Input
                                value={step.description}
                                onChange={(e) => handleUpdateTutorialStep(index, { ...step, description: e.target.value })}
                                placeholder="步骤描述"
                              />
                            </div>
                            <div className="col-span-1">
                              <Select value={step.type} onValueChange={(value: any) => handleUpdateTutorialStep(index, { ...step, type: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="default">默认</SelectItem>
                                  <SelectItem value="info">信息</SelectItem>
                                  <SelectItem value="warning">警告</SelectItem>
                                  <SelectItem value="success">成功</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveTutorialStep(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除服务 "{deletingService?.name}" 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConfigurableServicesPage;