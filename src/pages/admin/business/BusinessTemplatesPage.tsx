import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Copy, Upload, Eye, EyeOff } from "lucide-react";
import { BusinessTemplate, BusinessTemplateField, defaultBusinessTemplates } from "@/config/businessTemplates";

const BusinessTemplatesPage = () => {
  const [templates, setTemplates] = useState<BusinessTemplate[]>(defaultBusinessTemplates);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BusinessTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // 表单状态
  const [formData, setFormData] = useState<BusinessTemplate>({
    id: '',
    name: '',
    displayName: '',
    description: '',
    category: '',
    logo: '',
    defaultLogo: '📋',
    isActive: true,
    formFields: [],
    settings: {
      exchangeRate: 7.2,
      discountRate: 0.85,
      minAmount: 100,
      maxAmount: 50000,
      quickAmounts: [1000, 2000, 5000, 10000, 20000]
    }
  });

  // 获取所有分类
  const categories = Array.from(new Set(templates.map(t => t.category)));

  // 过滤模板
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 添加新字段
  const addFormField = () => {
    const newField: BusinessTemplateField = {
      id: `field_${Date.now()}`,
      name: `field_${formData.formFields.length + 1}`,
      label: '新字段',
      placeholder: '请输入内容',
      type: 'text',
      required: false,
      isEnabled: true,
      order: formData.formFields.length + 1
    };
    
    setFormData(prev => ({
      ...prev,
      formFields: [...prev.formFields, newField]
    }));
  };

  // 删除字段
  const removeFormField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      formFields: prev.formFields.filter(field => field.id !== fieldId)
    }));
  };

  // 更新字段
  const updateFormField = (fieldId: string, updates: Partial<BusinessTemplateField>) => {
    setFormData(prev => ({
      ...prev,
      formFields: prev.formFields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  // 处理新增
  const handleAdd = () => {
    const newTemplate: BusinessTemplate = {
      id: `template_${Date.now()}`,
      name: '',
      displayName: '',
      description: '',
      category: '自定义',
      defaultLogo: '📋',
      isActive: true,
      formFields: [
        {
          id: 'default_name',
          name: 'name',
          label: '姓名',
          placeholder: '请输入姓名',
          type: 'text',
          required: false,
          isEnabled: true,
          order: 1
        },
        {
          id: 'default_phone',
          name: 'phone',
          label: '手机号码',
          placeholder: '请输入手机号码',
          type: 'tel',
          required: true,
          isEnabled: true,
          order: 2
        },
        {
          id: 'default_amount',
          name: 'amount',
          label: '金额',
          placeholder: '请输入金额',
          type: 'number',
          required: true,
          isEnabled: true,
          order: 3,
          validation: { min: 100, max: 50000 }
        }
      ],
      settings: {
        exchangeRate: 7.2,
        discountRate: 0.85,
        minAmount: 100,
        maxAmount: 50000,
        quickAmounts: [1000, 2000, 5000, 10000, 20000]
      }
    };
    
    setFormData(newTemplate);
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  // 处理编辑
  const handleEdit = (template: BusinessTemplate) => {
    setFormData({ ...template });
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  // 处理复制
  const handleCopy = (template: BusinessTemplate) => {
    const copiedTemplate: BusinessTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      name: `${template.name}_copy`,
      displayName: `${template.displayName} (副本)`,
      formFields: template.formFields.map(field => ({
        ...field,
        id: `${field.id}_copy_${Date.now()}`
      }))
    };
    
    setTemplates(prev => [...prev, copiedTemplate]);
    toast.success("模板复制成功！");
  };

  // 处理删除
  const handleDelete = (templateId: string) => {
    if (window.confirm("确定要删除这个模板吗？")) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast.success("模板删除成功！");
    }
  };

  // 切换激活状态
  const toggleActive = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isActive: !template.isActive }
        : template
    ));
  };

  // 保存模板
  const handleSave = () => {
    if (!formData.displayName.trim()) {
      toast.error("请输入模板名称");
      return;
    }

    if (!formData.name.trim()) {
      // 自动生成name
      setFormData(prev => ({ 
        ...prev, 
        name: prev.displayName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      }));
    }

    if (editingTemplate) {
      // 编辑模式
      setTemplates(prev => prev.map(template => 
        template.id === editingTemplate.id ? formData : template
      ));
      toast.success("模板更新成功！");
    } else {
      // 新增模式
      setTemplates(prev => [...prev, formData]);
      toast.success("模板创建成功！");
    }

    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  // 上传LOGO
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          logo: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">业务模板管理</h1>
          <p className="text-gray-500 mt-1">管理业务模板，自定义表单字段和样式</p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新建模板
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="搜索模板名称或描述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="选择分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 模板列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {template.logo || template.defaultLogo}
                </div>
                <div>
                  <h3 className="font-semibold">{template.displayName}</h3>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </div>
              </div>
              <Switch
                checked={template.isActive}
                onCheckedChange={() => toggleActive(template.id)}
              />
            </div>

            <div className="space-y-2 mb-4">
              <Badge variant="outline">{template.category}</Badge>
              <div className="text-sm text-gray-600">
                表单字段: {template.formFields.filter(f => f.isEnabled).length}/{template.formFields.length}
              </div>
              <div className="text-sm text-gray-600">
                折扣率: {(template.settings.discountRate * 10).toFixed(1)}折
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(template)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-1" />
                编辑
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(template)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(template.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">没有找到匹配的模板</p>
        </div>
      )}

      {/* 编辑模板对话框 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? '编辑模板' : '新建模板'}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="fields">表单字段</TabsTrigger>
              <TabsTrigger value="settings">业务设置</TabsTrigger>
              <TabsTrigger value="preview">预览</TabsTrigger>
            </TabsList>

            {/* 基本信息 */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>模板名称 *</Label>
                  <Input
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({...prev, displayName: e.target.value}))}
                    placeholder="请输入模板名称"
                  />
                </div>
                <div>
                  <Label>URL标识</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="自动生成或手动输入"
                  />
                </div>
              </div>

              <div>
                <Label>模板描述</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="请输入模板描述"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>分类</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="金融服务">金融服务</SelectItem>
                      <SelectItem value="生活缴费">生活缴费</SelectItem>
                      <SelectItem value="游戏娱乐">游戏娱乐</SelectItem>
                      <SelectItem value="购物消费">购物消费</SelectItem>
                      <SelectItem value="会员服务">会员服务</SelectItem>
                      <SelectItem value="自定义">自定义</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>状态</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({...prev, isActive: checked}))}
                    />
                    <span className="text-sm">{formData.isActive ? '激活' : '停用'}</span>
                  </div>
                </div>
              </div>

              {/* LOGO设置 */}
              <div>
                <Label>LOGO设置</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-2xl">
                    {formData.logo ? (
                      <img src={formData.logo} alt="Logo" className="w-full h-full object-cover rounded" />
                    ) : (
                      formData.defaultLogo
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        上传图片
                      </Button>
                    </div>
                    <div>
                      <Label className="text-sm">或使用Emoji</Label>
                      <Input
                        value={formData.defaultLogo}
                        onChange={(e) => setFormData(prev => ({...prev, defaultLogo: e.target.value}))}
                        placeholder="输入Emoji"
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 表单字段 */}
            <TabsContent value="fields" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">表单字段配置</h3>
                <Button onClick={addFormField} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  添加字段
                </Button>
              </div>

              <div className="space-y-4">
                {formData.formFields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm">字段标签</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateFormField(field.id, { label: e.target.value })}
                          placeholder="字段标签"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">占位符</Label>
                        <Input
                          value={field.placeholder}
                          onChange={(e) => updateFormField(field.id, { placeholder: e.target.value })}
                          placeholder="占位符文字"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">字段类型</Label>
                        <Select 
                          value={field.type} 
                          onValueChange={(value: any) => updateFormField(field.id, { type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">文本</SelectItem>
                            <SelectItem value="tel">电话</SelectItem>
                            <SelectItem value="email">邮箱</SelectItem>
                            <SelectItem value="number">数字</SelectItem>
                            <SelectItem value="textarea">多行文本</SelectItem>
                            <SelectItem value="select">下拉选择</SelectItem>
                            <SelectItem value="qrcode">二维码</SelectItem>
                            <SelectItem value="link">链接</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={field.required}
                              onCheckedChange={(checked) => updateFormField(field.id, { required: checked })}
                            />
                            <span className="text-sm">必填</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={field.isEnabled}
                              onCheckedChange={(checked) => updateFormField(field.id, { isEnabled: checked })}
                            />
                            <span className="text-sm">启用</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFormField(field.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {field.type === 'select' && (
                      <div className="mt-4">
                        <Label className="text-sm">选项设置</Label>
                        <Input
                          value={field.options?.join(', ') || ''}
                          onChange={(e) => updateFormField(field.id, { 
                            options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          })}
                          placeholder="选项1, 选项2, 选项3"
                        />
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {formData.formFields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  暂无表单字段，点击"添加字段"开始配置
                </div>
              )}
            </TabsContent>

            {/* 业务设置 */}
            <TabsContent value="settings" className="space-y-4">
              <h3 className="text-lg font-semibold">业务参数设置</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>汇率</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.settings.exchangeRate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, exchangeRate: parseFloat(e.target.value) || 7.2 }
                    }))}
                  />
                </div>
                <div>
                  <Label>折扣率</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.settings.discountRate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, discountRate: parseFloat(e.target.value) || 0.85 }
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>最小金额</Label>
                  <Input
                    type="number"
                    value={formData.settings.minAmount}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, minAmount: parseInt(e.target.value) || 100 }
                    }))}
                  />
                </div>
                <div>
                  <Label>最大金额</Label>
                  <Input
                    type="number"
                    value={formData.settings.maxAmount}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, maxAmount: parseInt(e.target.value) || 50000 }
                    }))}
                  />
                </div>
              </div>

              <div>
                <Label>快捷金额</Label>
                <Input
                  value={formData.settings.quickAmounts.join(', ')}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      quickAmounts: e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
                    }
                  }))}
                  placeholder="1000, 2000, 5000, 10000, 20000"
                />
              </div>
            </TabsContent>

            {/* 预览 */}
            <TabsContent value="preview" className="space-y-4">
              <h3 className="text-lg font-semibold">模板预览</h3>
              
              <Card className="p-6 bg-gray-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">
                    {formData.logo ? (
                      <img src={formData.logo} alt="Logo" className="w-8 h-8 object-cover rounded" />
                    ) : (
                      formData.defaultLogo
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{formData.displayName || '模板名称'}</h2>
                    <p className="text-gray-600">{formData.description || '模板描述'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {formData.formFields.filter(f => f.isEnabled).map((field) => (
                    <div key={field.id}>
                      <Label className="flex items-center gap-2">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                        {!field.isEnabled && <EyeOff className="w-4 h-4 text-gray-400" />}
                      </Label>
                      {field.type === 'select' ? (
                        <Select disabled>
                          <SelectTrigger>
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                        </Select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          className="w-full p-2 border rounded-md"
                          placeholder={field.placeholder}
                          disabled
                          rows={3}
                        />
                      ) : (
                        <Input
                          type={field.type === 'tel' ? 'tel' : field.type === 'number' ? 'number' : 'text'}
                          placeholder={field.placeholder}
                          disabled
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>汇率: {formData.settings.exchangeRate}</p>
                    <p>折扣: {(formData.settings.discountRate * 10).toFixed(1)}折</p>
                    <p>金额范围: {formData.settings.minAmount} - {formData.settings.maxAmount}</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              {editingTemplate ? '更新' : '创建'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessTemplatesPage;