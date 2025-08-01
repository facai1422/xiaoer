import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Settings, Calculator, Package, X } from 'lucide-react';
import { 
  getExchangeRateSettings,
  getDiscountSettings,
  calculatePrice,
  type ExchangeRateSetting,
  type DiscountSetting
} from '@/services/pricingService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { getAdminSession } from "@/utils/adminAuth";
import { TutorialEditor } from "@/components/admin/TutorialEditor";
import { BusinessTemplate, defaultBusinessTemplates } from "@/config/businessTemplates";
import {
  Search,
  RefreshCw,
  Upload,
  Eye,
  Copy,
  BookOpen,
  Tag
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

// 产品类型定义
interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  logo_url?: string;
  animated_logo_url?: string;
  logo_type: 'static' | 'animated' | 'lottie';
  custom_exchange_rate?: number;
  custom_discount_rate?: number;
  status: 'active' | 'inactive' | 'maintenance';
  min_amount: number;
  max_amount: number;
  quick_amounts: number[];
  sort_order: number;
  template_id?: string;
  custom_config?: {
    tutorialText?: string;
    showTutorial?: boolean;
    tutorialContent?: TutorialContent;
  };
  created_at: string;
  updated_at: string;
}

// 教程内容类型定义
interface TutorialContent {
  title: string;
  steps: Array<{
    title: string;
    items: string[];
    type?: 'info' | 'warning' | 'success' | 'default';
  }>;
}

const NewProductsPage = () => {
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateSetting[]>([]);
  const [discounts, setDiscounts] = useState<DiscountSetting[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 对话框状态
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // 表单状态
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    category: '代还服务',
    description: '',
    logo_url: '',
    animated_logo_url: '',
    logo_type: 'static' as 'static' | 'animated' | 'lottie',
    custom_exchange_rate: 7.2,
    custom_discount_rate: 0.75,
    status: 'active' as 'active' | 'inactive' | 'maintenance',
    min_amount: 100,
    max_amount: 50000,
    quick_amounts: [500, 1000, 2000, 5000],
    sort_order: 0,
    template_id: '',
    tutorialText: '查看使用教程 →',
    showTutorial: true,
    form_config: [] as any[],
  });

  // 业务模板相关状态
  const [selectedTemplate, setSelectedTemplate] = useState<BusinessTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // 快捷金额编辑状态
  const [quickAmountInput, setQuickAmountInput] = useState('');
  
  // 价格计算预览
  const [previewAmount, setPreviewAmount] = useState('10000');

  // 教程内容状态
  const [tutorialContent, setTutorialContent] = useState<TutorialContent>({
    title: '使用教程',
    steps: []
  });

  // 统计数据
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    maintenance: 0,
    categories: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [exchangeRatesData, discountsData, productsData] = await Promise.all([
        getExchangeRateSettings(),
        getDiscountSettings(),
        loadProducts()
      ]);
      
      setExchangeRates(exchangeRatesData);
      setDiscounts(discountsData);
      setProducts(productsData);
      
      // 设置默认值
      const defaultRate = exchangeRatesData.find(r => r.is_default);
      const defaultDiscount = discountsData.find(d => d.is_default);
      if (defaultRate) {
        setProductForm(prev => ({ ...prev, custom_exchange_rate: defaultRate.rate }));
      }
      if (defaultDiscount) {
        setProductForm(prev => ({ ...prev, custom_discount_rate: defaultDiscount.discount_rate }));
      }
      
      // 更新统计数据
      const categories = new Set(productsData.map(p => p.category));
      setStats({
        total: productsData.length,
        active: productsData.filter(p => p.status === 'active').length,
        inactive: productsData.filter(p => p.status === 'inactive').length,
        maintenance: productsData.filter(p => p.status === 'maintenance').length,
        categories: categories.size
      });
      
    } catch (error) {
      console.error('加载数据失败:', error);
      toast('加载数据失败', { variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from('business_products')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        if (error.code === '42P01') {
          toast('业务产品表不存在，请先创建数据表', { variant: 'destructive' });
          return [];
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('加载产品失败:', error);
      return [];
    }
  };

  // 产品相关操作
  const handleCreateProduct = async () => {
    try {
      if (!productForm.name || !productForm.custom_exchange_rate || !productForm.custom_discount_rate) {
        toast('请填写完整信息', { variant: 'destructive' });
        return;
      }

      const { error } = await supabase
        .from('business_products')
        .insert([{
          name: productForm.name,
          slug: productForm.slug || generateSlug(productForm.name),
          category: productForm.category,
          description: productForm.description,
          logo_url: productForm.logo_url,
          animated_logo_url: productForm.animated_logo_url,
          logo_type: productForm.logo_type,
          custom_exchange_rate: productForm.custom_exchange_rate,
          custom_discount_rate: productForm.custom_discount_rate,
          status: productForm.status,
          min_amount: productForm.min_amount,
          max_amount: productForm.max_amount,
          quick_amounts: productForm.quick_amounts,
          sort_order: productForm.sort_order,
          template_id: productForm.template_id,
          form_config: productForm.form_config,
          custom_config: {
            tutorialText: productForm.tutorialText,
            showTutorial: productForm.showTutorial,
            tutorialContent: tutorialContent
          },
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast('产品创建成功', { variant: 'success' });
      setProductDialog(false);
      resetProductForm();
      loadData();
    } catch (error) {
      console.error('创建产品失败:', error);
      toast('创建失败', { variant: 'destructive' });
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    
    try {
      const { error } = await supabase
        .from('business_products')
        .update({
          name: productForm.name,
          slug: productForm.slug,
          category: productForm.category,
          description: productForm.description,
          logo_url: productForm.logo_url,
          animated_logo_url: productForm.animated_logo_url,
          logo_type: productForm.logo_type,
          custom_exchange_rate: productForm.custom_exchange_rate,
          custom_discount_rate: productForm.custom_discount_rate,
          status: productForm.status,
          min_amount: productForm.min_amount,
          max_amount: productForm.max_amount,
          quick_amounts: productForm.quick_amounts,
          sort_order: productForm.sort_order,
          template_id: productForm.template_id,
          form_config: productForm.form_config,
          custom_config: {
            tutorialText: productForm.tutorialText,
            showTutorial: productForm.showTutorial,
            tutorialContent: tutorialContent
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast('产品更新成功', { variant: 'success' });
      setProductDialog(false);
      setEditingProduct(null);
      resetProductForm();
      loadData();
    } catch (error) {
      console.error('更新产品失败:', error);
      toast('更新失败', { variant: 'destructive' });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('确定要删除这个产品吗？')) return;
    
    try {
      const { error } = await supabase
        .from('business_products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast('产品删除成功', { variant: 'success' });
      loadData();
    } catch (error) {
      console.error('删除产品失败:', error);
      toast('删除失败', { variant: 'destructive' });
    }
  };

  const resetProductForm = () => {
    const defaultRate = exchangeRates.find(r => r.is_default);
    const defaultDiscount = discounts.find(d => d.is_default);
    
    setProductForm({
      name: '',
      slug: '',
      category: '代还服务',
      description: '',
      logo_url: '',
      animated_logo_url: '',
      logo_type: 'static',
      custom_exchange_rate: defaultRate?.rate || 7.2,
      custom_discount_rate: defaultDiscount?.discount_rate || 0.75,
      status: 'active',
      min_amount: 100,
      max_amount: 50000,
      quick_amounts: [500, 1000, 2000, 5000],
      sort_order: 0,
      template_id: '',
      tutorialText: '查看使用教程 →',
      showTutorial: true,
      form_config: [],
    });
    setQuickAmountInput('500,1000,2000,5000');
    setTutorialContent({
      title: '使用教程',
      steps: []
    });
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      slug: product.slug,
      category: product.category,
      description: product.description,
      logo_url: product.logo_url || '',
      animated_logo_url: product.animated_logo_url || '',
      logo_type: product.logo_type,
      custom_exchange_rate: product.custom_exchange_rate || 7.2,
      custom_discount_rate: product.custom_discount_rate || 0.75,
      status: product.status,
      min_amount: product.min_amount,
      max_amount: product.max_amount,
      quick_amounts: product.quick_amounts,
      sort_order: product.sort_order,
      template_id: product.template_id || '',
      tutorialText: product.custom_config?.tutorialText || '查看使用教程 →',
      showTutorial: product.custom_config?.showTutorial !== false,
      form_config: product.form_config || [],
    });
    setQuickAmountInput(product.quick_amounts.join(','));
    setTutorialContent(product.custom_config?.tutorialContent || {
      title: '使用教程',
      steps: []
    });
    setProductDialog(true);
  };

  // 模板处理函数
  const handleSelectTemplate = (template: BusinessTemplate) => {
    setSelectedTemplate(template);
    
    // 转换模板字段到表单配置
    const formConfig = template.formFields
      .filter(field => field.isEnabled)
      .sort((a, b) => a.order - b.order)
      .map(field => ({
        id: field.id,
        name: field.name,
        label: field.label,
        type: field.type,
        placeholder: field.placeholder,
        required: field.required,
        order: field.order,
        options: field.options,
        validation: field.validation
      }));

    // 填充产品表单
    setProductForm(prev => ({
      ...prev,
      name: template.displayName,
      slug: template.name,
      category: template.category,
      description: template.description,
      logo_url: template.logo || '',
      template_id: template.id,
      custom_exchange_rate: template.settings.exchangeRate,
      custom_discount_rate: template.settings.discountRate,
      min_amount: template.settings.minAmount,
      max_amount: template.settings.maxAmount,
      quick_amounts: template.settings.quickAmounts,
      form_config: formConfig
    }));

    setQuickAmountInput(template.settings.quickAmounts.join(','));
    setShowTemplateModal(false);
  };

  const resetTemplateSelection = () => {
    setSelectedTemplate(null);
    setProductForm(prev => ({
      ...prev,
      template_id: '',
      form_config: []
    }));
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: '启用', variant: 'default' as const },
      inactive: { label: '禁用', variant: 'secondary' as const },
      maintenance: { label: '维护', variant: 'destructive' as const }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // 获取汇率和折扣信息用于显示
  const getExchangeRateInfo = (id?: string) => {
    const rate = exchangeRates.find(r => r.id === id);
    return rate ? `${rate.name} (${rate.rate})` : '未设置';
  };

  const getDiscountInfo = (id?: string) => {
    const discount = discounts.find(d => d.id === id);
    return discount ? discount.name : '未设置';
  };

  // 价格计算预览
  const getPreviewCalculation = () => {
    const amount = parseFloat(previewAmount) || 0;
    const rate = productForm.custom_exchange_rate || 7.2;
    const discount = productForm.custom_discount_rate || 0.75;
    
    return calculatePrice(amount, discount, rate);
  };

  const previewCalculation = getPreviewCalculation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">业务产品管理（自定义汇率/折扣）</h1>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => {
            setEditingProduct(null);
            resetProductForm();
            setShowTemplateModal(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            从模板添加产品
          </Button>
          <Button variant="outline" onClick={() => {
            setEditingProduct(null);
            resetProductForm();
            setProductDialog(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            手动添加产品
          </Button>
        </div>

        <Dialog open={productDialog} onOpenChange={setProductDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? '编辑产品' : '添加产品'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  基本信息
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>产品名称</Label>
                    <Input
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="信用卡代还"
                    />
                  </div>
                  <div>
                    <Label>产品标识</Label>
                    <Input
                      value={productForm.slug}
                      onChange={(e) => setProductForm(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="creditcard-repay"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>产品分类</Label>
                    <Select value={productForm.category} onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="代还服务">代还服务</SelectItem>
                        <SelectItem value="充值服务">充值服务</SelectItem>
                        <SelectItem value="金融服务">金融服务</SelectItem>
                        <SelectItem value="其他服务">其他服务</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>状态</Label>
                    <Select value={productForm.status} onValueChange={(value: 'active' | 'inactive' | 'maintenance') => setProductForm(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">启用</SelectItem>
                        <SelectItem value="inactive">禁用</SelectItem>
                        <SelectItem value="maintenance">维护</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>产品描述</Label>
                  <Textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="产品详细描述"
                  />
                </div>
              </div>

              {/* 自定义表单字段配置 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    自定义表单字段配置
                  </h4>
                  {selectedTemplate && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">模板：{selectedTemplate.displayName}</Badge>
                      <Button variant="ghost" size="sm" onClick={resetTemplateSelection}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {productForm.form_config.length > 0 ? (
                  <div className="space-y-3">
                    {productForm.form_config.map((field: any, index: number) => (
                      <div key={field.id || index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{field.label}</span>
                          <Badge variant="secondary">{field.type}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>字段名：{field.name}</p>
                          <p>占位符：{field.placeholder}</p>
                          <p>必填：{field.required ? '是' : '否'}</p>
                          {field.options && (
                            <p>选项：{field.options.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <p className="text-gray-500">暂无自定义表单字段</p>
                    <p className="text-sm text-gray-400 mt-1">使用"从模板添加产品"来快速配置表单字段</p>
                  </div>
                )}
              </div>

              {/* 汇率和折扣配置 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <Calculator className="h-4 w-4 mr-2" />
                  汇率和折扣配置
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>汇率设置</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="1"
                      max="20"
                      value={productForm.custom_exchange_rate}
                      onChange={(e) => setProductForm(prev => ({ ...prev, custom_exchange_rate: parseFloat(e.target.value) || 7.2 }))}
                      placeholder="7.2"
                    />
                    <p className="text-xs text-gray-500 mt-1">输入汇率值，如：6.9、7.0、7.2等</p>
                  </div>
                  <div>
                    <Label>折扣设置</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.1"
                      max="1"
                      value={productForm.custom_discount_rate}
                      onChange={(e) => setProductForm(prev => ({ ...prev, custom_discount_rate: parseFloat(e.target.value) || 0.75 }))}
                      placeholder="0.75"
                    />
                    <p className="text-xs text-gray-500 mt-1">输入折扣率，如：0.75（75折）、0.80（80折）</p>
                  </div>
                </div>

                {/* 价格计算预览 */}
                {previewCalculation && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <Label className="text-sm">预览金额（人民币）</Label>
                        <Input
                          type="number"
                          value={previewAmount}
                          onChange={(e) => setPreviewAmount(e.target.value)}
                          placeholder="10000"
                        />
                      </div>
                      <div className="flex flex-col justify-end">
                        <div className="text-sm text-gray-600">计算结果</div>
                        <div className="text-lg font-bold text-blue-600">
                          {previewCalculation.usdt_amount.toFixed(4)} USDT
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>原价：¥{previewCalculation.original_price.toLocaleString()}</div>
                      <div>折扣后：¥{previewCalculation.discounted_price.toLocaleString()}</div>
                      <div>节省：¥{previewCalculation.savings.toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* 金额配置 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">金额配置</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>最小金额</Label>
                    <Input
                      type="number"
                      min="1"
                      value={productForm.min_amount}
                      onChange={(e) => setProductForm(prev => ({ ...prev, min_amount: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label>最大金额</Label>
                    <Input
                      type="number"
                      min="1"
                      value={productForm.max_amount}
                      onChange={(e) => setProductForm(prev => ({ ...prev, max_amount: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>快捷金额按钮</Label>
                  <Input
                    value={quickAmountInput}
                    onChange={(e) => {
                      setQuickAmountInput(e.target.value);
                      const amounts = e.target.value.split(',').map(a => parseInt(a.trim())).filter(a => !isNaN(a) && a > 0);
                      setProductForm(prev => ({ ...prev, quick_amounts: amounts }));
                    }}
                    placeholder="500,1000,2000,5000"
                  />
                  <p className="text-xs text-gray-500 mt-1">用逗号分隔多个金额</p>
                </div>

                <div>
                  <Label>排序顺序</Label>
                  <Input
                    type="number"
                    min="0"
                    value={productForm.sort_order}
                    onChange={(e) => setProductForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">数字越小越靠前显示</p>
                </div>
              </div>

              {/* Logo和外观设置 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Logo和外观设置
                </h4>
                
                <div>
                  <Label>Logo类型</Label>
                  <Select value={productForm.logo_type} onValueChange={(value: 'static' | 'animated' | 'lottie') => setProductForm(prev => ({ ...prev, logo_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="static">静态图片</SelectItem>
                      <SelectItem value="animated">动态图片</SelectItem>
                      <SelectItem value="lottie">Lottie动画</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>静态Logo URL</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={productForm.logo_url}
                      onChange={(e) => setProductForm(prev => ({ ...prev, logo_url: e.target.value }))}
                      placeholder="/lovable-uploads/logo.png"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {productForm.logo_url && (
                    <div className="mt-2">
                      <img 
                        src={productForm.logo_url} 
                        alt="Logo预览" 
                        className="w-16 h-16 object-contain rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label>动态Logo URL</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={productForm.animated_logo_url}
                      onChange={(e) => setProductForm(prev => ({ ...prev, animated_logo_url: e.target.value }))}
                      placeholder="/lovable-uploads/animated-logo.gif"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {productForm.animated_logo_url && (
                    <div className="mt-2">
                      <img 
                        src={productForm.animated_logo_url} 
                        alt="动态Logo预览" 
                        className="w-16 h-16 object-contain rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 教程配置 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  教程配置
                </h4>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={productForm.showTutorial}
                    onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, showTutorial: checked }))}
                  />
                  <label className="text-sm font-medium">显示使用教程</label>
                </div>

                {productForm.showTutorial && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">教程按钮文本</label>
                      <Input
                        value={productForm.tutorialText}
                        onChange={(e) => setProductForm(prev => ({ ...prev, tutorialText: e.target.value }))}
                        placeholder="查看使用教程 →"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">教程内容</label>
                      <TutorialEditor
                        content={tutorialContent}
                        onChange={setTutorialContent}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setProductDialog(false)}
              >
                取消
              </Button>
              <Button
                onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
              >
                {editingProduct ? '更新' : '创建'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 产品列表 */}
      <Card>
        <CardHeader>
          <CardTitle>产品列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>产品名称</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>汇率设置</TableHead>
                <TableHead>折扣设置</TableHead>
                <TableHead>金额范围</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{getExchangeRateInfo(product.custom_exchange_rate?.toString())}</TableCell>
                  <TableCell>{getDiscountInfo(product.custom_discount_rate?.toString())}</TableCell>
                  <TableCell>¥{product.min_amount.toLocaleString()} - ¥{product.max_amount.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProduct(product.id)}
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

      {/* 模板选择对话框 */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>选择业务模板</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {defaultBusinessTemplates.filter(template => template.isActive).map((template) => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{template.defaultLogo}</div>
                    <div>
                      <CardTitle className="text-lg">{template.displayName}</CardTitle>
                      <p className="text-sm text-gray-500">{template.category}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="space-y-1 text-xs text-gray-500">
                    <p>汇率: {template.settings.exchangeRate}</p>
                    <p>折扣: {(template.settings.discountRate * 10).toFixed(1)}折</p>
                    <p>表单字段: {template.formFields.filter(f => f.isEnabled).length}个</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewProductsPage;
