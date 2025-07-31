import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getAdminSession } from "@/utils/adminAuth";
import { TutorialEditor } from "@/components/admin/TutorialEditor";
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
  BookOpen
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
import { supabase } from '@/integrations/supabase/client';
import { getTemplateOptions } from '@/config/templates';
import { calculatePrice } from '@/services/pricingService';
import { triggerConfigRefresh } from '@/hooks/useProductConfig';

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

const ProductsPage = () => {
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
    form_config: [] as Array<{
      id: string;
      name: string;
      label: string;
      type: 'text' | 'email' | 'phone' | 'password' | 'url' | 'textarea' | 'number' | 'select' | 'file';
      placeholder?: string;
      required: boolean;
      options?: Array<{ value: string; label: string }>;
      validation?: {
        pattern?: string;
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
      };
    }>,
  });

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
    loadProducts();
  }, []);

  const loadProducts = async () => {
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

      // 从business_products表获取数据
      const { data, error } = await supabase
        .from('business_products' as any)
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        // 如果表不存在，显示友好提示
        if (error.code === '42P01') {
          toast({
            title: "数据表不存在",
            description: "请先执行 ceshi/添加教程内容自定义字段.sql 脚本创建数据表",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      const productsData = (data || []) as Product[];
      setProducts(productsData);

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
      console.error('加载产品失败:', error);
      toast({
        variant: "destructive",
        title: "加载失败",
        description: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 打开添加对话框
  const handleAdd = () => {
    setSelectedProduct(null);
    setProductForm({
      name: '',
      slug: '',
      category: '代还服务',
      description: '',
      logo_url: '',
      animated_logo_url: '',
      logo_type: 'static',
      custom_exchange_rate: 7.2,
      custom_discount_rate: 0.75,
      min_amount: 100,
      max_amount: 50000,
      quick_amounts: [500, 1000, 2000, 5000],
      sort_order: 0,
      status: 'active',
      template_id: '',
      tutorialText: '查看使用教程 →',
      showTutorial: true,
      form_config: [
        {
          id: 'account',
          name: 'account',
          label: '账号',
          type: 'text' as const,
          placeholder: '请输入账号',
          required: true,
          validation: { minLength: 1, maxLength: 50 }
        },
        {
          id: 'name',
          name: 'name', 
          label: '姓名',
          type: 'text' as const,
          placeholder: '请输入姓名',
          required: false,
          validation: { minLength: 2, maxLength: 20 }
        },
        {
          id: 'amount',
          name: 'amount',
          label: '金额',
          type: 'number' as const,
          placeholder: '请输入金额',
          required: true,
          validation: { min: 100, max: 50000 }
        }
      ],
    });
    setQuickAmountInput('500,1000,2000,5000');
    setTutorialContent({
      title: '使用教程',
      steps: []
    });
    setIsEditOpen(true);
  };

  // 打开编辑对话框
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name || '',
      slug: product.slug || '',
      category: product.category || '代还服务',
      description: product.description || '',
      logo_url: product.logo_url || '',
      animated_logo_url: product.animated_logo_url || '',
      logo_type: product.logo_type || 'static',
      custom_exchange_rate: product.custom_exchange_rate || 7.2,
      custom_discount_rate: product.custom_discount_rate || 0.75,
      status: product.status || 'active',
      min_amount: product.min_amount || 100,
      max_amount: product.max_amount || 50000,
      quick_amounts: product.quick_amounts || [500, 1000, 2000, 5000],
      sort_order: product.sort_order || 0,
      template_id: product.template_id || '',
      tutorialText: product.custom_config?.tutorialText || '查看使用教程 →',
      showTutorial: product.custom_config?.showTutorial !== false,
      form_config: (product as any).form_config || [
        {
          id: 'account',
          name: 'account',
          label: '账号',
          type: 'text' as const,
          placeholder: '请输入账号',
          required: true,
          validation: { minLength: 1, maxLength: 50 }
        },
        {
          id: 'name',
          name: 'name', 
          label: '姓名',
          type: 'text' as const,
          placeholder: '请输入姓名',
          required: false,
          validation: { minLength: 2, maxLength: 20 }
        },
        {
          id: 'amount',
          name: 'amount',
          label: '金额',
          type: 'number' as const,
          placeholder: '请输入金额',
          required: true,
          validation: { min: product.min_amount || 100, max: product.max_amount || 50000 }
        }
      ],
    });
    setQuickAmountInput((product.quick_amounts || []).join(','));
    
    // 设置教程内容
    const customConfig = product.custom_config || {};
    setTutorialContent(customConfig.tutorialContent || {
      title: '使用教程',
      steps: []
    });
    
    setIsEditOpen(true);
  };

  // 保存产品
  const handleSaveProduct = async () => {
    try {
      // 验证必填字段
      if (!productForm.name.trim()) {
        toast({
          variant: "destructive",
          title: "验证失败",
          description: "请输入业务名称"
        });
        return;
      }

      // 处理快捷金额
      const quickAmounts = quickAmountInput
        .split(',')
        .map(amount => parseInt(amount.trim()))
        .filter(amount => !isNaN(amount) && amount > 0);

      // 构建自定义配置
      const customConfig = {
        tutorialText: productForm.tutorialText,
        showTutorial: productForm.showTutorial,
        tutorialContent: tutorialContent
      };

      const productData = {
        name: productForm.name.trim(),
        slug: productForm.slug.trim() || generateSlug(productForm.name),
        category: productForm.category,
        description: productForm.description.trim(),
        logo_url: productForm.logo_url.trim(),
        animated_logo_url: productForm.animated_logo_url.trim(),
        logo_type: productForm.logo_type,
        custom_exchange_rate: productForm.custom_exchange_rate,
        custom_discount_rate: productForm.custom_discount_rate,
        status: productForm.status,
        min_amount: productForm.min_amount,
        max_amount: productForm.max_amount,
        quick_amounts: quickAmounts,
        sort_order: productForm.sort_order,
        template_id: productForm.template_id,
        custom_config: customConfig,
        form_config: productForm.form_config,
        updated_at: new Date().toISOString()
      };

      if (selectedProduct) {
        // 更新现有产品
        const { error } = await supabase
          .from('business_products' as any)
          .update(productData)
          .eq('id', selectedProduct.id);

        if (error) throw error;

        // 触发全局配置刷新事件，通知用户端更新
        triggerConfigRefresh(selectedProduct.slug);
        
        toast({
          title: "更新成功",
          description: "产品配置已更新"
        });
      } else {
        // 创建新产品
        const { error } = await supabase
          .from('business_products' as any)
          .insert([{
            ...productData,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;

        // 新产品创建后也触发刷新
        triggerConfigRefresh(productData.slug);

        toast({
          title: "创建成功", 
          description: "新产品已创建"
        });
      }

      setIsEditOpen(false);
      loadProducts();

    } catch (error) {
      console.error('保存产品失败:', error);
      toast({
        variant: "destructive",
        title: "保存失败",
        description: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  // 删除产品
  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`确定要删除产品"${product.name}"吗？`)) return;

    try {
      const { error } = await supabase
        .from('business_products' as any)
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      // 触发全局配置刷新事件，通知用户端更新
      triggerConfigRefresh(product.slug);
      
      toast({
        title: "删除成功",
        description: "产品已删除"
      });

      loadProducts();
    } catch (error) {
      console.error('删除产品失败:', error);
      toast({
        variant: "destructive",
        title: "删除失败",
        description: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  // 切换产品状态
  const toggleProductStatus = async (product: Product) => {
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('business_products' as any)
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (error) throw error;

      // 触发全局配置刷新事件，通知用户端更新
      triggerConfigRefresh(product.slug);
      
      toast({
        title: "状态更新",
        description: `产品已${newStatus === 'active' ? '启用' : '禁用'}`
      });

      loadProducts();
    } catch (error) {
      console.error('切换状态失败:', error);
      toast({
        variant: "destructive",
        title: "状态切换失败",
        description: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  // 生成slug
  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">启用</Badge>;
      case 'inactive':
        return <Badge variant="secondary">禁用</Badge>;
      case 'maintenance':
        return <Badge variant="destructive">维护</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  // 价格计算预览
  const getPreviewCalculation = () => {
    const amount = parseFloat(previewAmount) || 0;
    const rate = productForm.custom_exchange_rate || 7.2;
    const discount = productForm.custom_discount_rate || 0.75;
    
    return calculatePrice(amount, discount, rate);
  };

  // 复制产品配置
  const copyProductConfig = (product: Product) => {
    const config = {
      name: product.name,
      category: product.category,
      custom_exchange_rate: product.custom_exchange_rate,
      custom_discount_rate: product.custom_discount_rate,
      min_amount: product.min_amount,
      max_amount: product.max_amount,
      quick_amounts: product.quick_amounts
    };
    
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    toast({
      title: "配置已复制",
      description: "产品配置已复制到剪贴板"
    });
  };

  // 过滤产品
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和统计 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <Package className="h-6 w-6 mr-2" />
            业务产品管理
          </h1>
          <p className="text-gray-600 mt-1">管理所有业务产品的配置和设置</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            总计: {stats.total} | 启用: {stats.active} | 禁用: {stats.inactive}
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            添加产品
          </Button>
        </div>
      </div>

      {/* 搜索和刷新 */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="搜索产品名称、分类或标识..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={loadProducts}>
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新
        </Button>
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
                <TableHead>产品信息</TableHead>
                <TableHead>汇率/折扣</TableHead>
                <TableHead>金额范围</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {product.logo_url && (
                        <img 
                          src={product.logo_url} 
                          alt={product.name}
                          className="w-8 h-8 object-contain rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-600">{product.category}</div>
                        <div className="text-xs text-gray-500">{product.slug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>汇率: {product.custom_exchange_rate || 7.2}</div>
                      <div>折扣: {((product.custom_discount_rate || 0.75) * 100).toFixed(0)}折</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>¥{product.min_amount.toLocaleString()} - ¥{product.max_amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">
                        快捷: {(product.quick_amounts || []).join(', ')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell>{product.sort_order}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleProductStatus(product)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyProductConfig(product)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProduct(product)}
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
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? '编辑产品' : '添加产品'}
            </DialogTitle>
            <DialogDescription>
              配置产品的基本信息、汇率折扣和其他设置
            </DialogDescription>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">产品名称 *</label>
                  <Input
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="输入产品名称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">产品标识 (slug)</label>
                  <Input
                    value={productForm.slug}
                    onChange={(e) => setProductForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="自动生成或手动输入"
                  />
                  <p className="text-xs text-gray-500 mt-1">用于URL，留空将自动生成</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">产品分类</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">产品描述</label>
                <Textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="输入产品描述"
                  rows={3}
                />
              </div>
            </div>

            {/* 汇率和金额配置 */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Calculator className="h-4 w-4 mr-2" />
                汇率和金额配置
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">汇率设置</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">折扣设置</label>
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
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">预览金额（人民币）</label>
                    <Input
                      type="number"
                      value={previewAmount}
                      onChange={(e) => setPreviewAmount(e.target.value)}
                      placeholder="10000"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="text-sm text-gray-600">计算结果</div>
                    <div className="text-lg font-bold text-blue-600">
                      {getPreviewCalculation()?.usdt_amount.toFixed(4) || '0.0000'} USDT
                    </div>
                  </div>
                </div>
                
                {getPreviewCalculation() && (
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>原价：¥{getPreviewCalculation()!.original_price.toLocaleString()}</div>
                    <div>折扣后：¥{getPreviewCalculation()!.discounted_price.toLocaleString()}</div>
                    <div>节省：¥{getPreviewCalculation()!.savings.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      计算公式：({getPreviewCalculation()!.original_price.toLocaleString()} × {productForm.custom_discount_rate}) ÷ {productForm.custom_exchange_rate} = {getPreviewCalculation()!.usdt_amount.toFixed(4)} USDT
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最小金额</label>
                  <Input
                    type="number"
                    min="1"
                    value={productForm.min_amount}
                    onChange={(e) => setProductForm(prev => ({ ...prev, min_amount: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最大金额</label>
                  <Input
                    type="number"
                    min="1"
                    value={productForm.max_amount}
                    onChange={(e) => setProductForm(prev => ({ ...prev, max_amount: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">快捷金额按钮</label>
                <Input
                  value={quickAmountInput}
                  onChange={(e) => setQuickAmountInput(e.target.value)}
                  placeholder="500,1000,2000,5000"
                />
                <p className="text-xs text-gray-500 mt-1">用逗号分隔多个金额，这些将显示为快捷按钮</p>
                
                {/* 快捷金额预览 */}
                {quickAmountInput && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs text-blue-700 mb-1">预览效果:</p>
                    <div className="flex flex-wrap gap-1">
                      {quickAmountInput.split(',').map((amount, index) => {
                        const num = parseInt(amount.trim());
                        return !isNaN(num) && num > 0 ? (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                            ¥{num}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">排序顺序</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo类型</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">静态Logo URL</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">动态Logo URL</label>
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

            {/* 表单字段配置 */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                表单字段配置
              </h4>
              
              <div className="space-y-3">
                {productForm.form_config.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">字段名称</label>
                        <Input
                          value={field.name}
                          onChange={(e) => {
                            const newFields = [...productForm.form_config];
                            newFields[index] = { ...field, name: e.target.value };
                            setProductForm(prev => ({ ...prev, form_config: newFields }));
                          }}
                          placeholder="字段名称"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">显示标签</label>
                        <Input
                          value={field.label}
                          onChange={(e) => {
                            const newFields = [...productForm.form_config];
                            newFields[index] = { ...field, label: e.target.value };
                            setProductForm(prev => ({ ...prev, form_config: newFields }));
                          }}
                          placeholder="显示标签"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">字段类型</label>
                        <Select
                          value={field.type}
                          onValueChange={(value: any) => {
                            const newFields = [...productForm.form_config];
                            newFields[index] = { ...field, type: value };
                            setProductForm(prev => ({ ...prev, form_config: newFields }));
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
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
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">占位符</label>
                        <Input
                          value={field.placeholder || ''}
                          onChange={(e) => {
                            const newFields = [...productForm.form_config];
                            newFields[index] = { ...field, placeholder: e.target.value };
                            setProductForm(prev => ({ ...prev, form_config: newFields }));
                          }}
                          placeholder="输入占位符文本"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="flex items-center space-x-4 pt-6">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => {
                              const newFields = [...productForm.form_config];
                              newFields[index] = { ...field, required: e.target.checked };
                              setProductForm(prev => ({ ...prev, form_config: newFields }));
                            }}
                            className="rounded"
                          />
                          <span className="text-xs">必填</span>
                        </label>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const newFields = productForm.form_config.filter((_, i) => i !== index);
                            setProductForm(prev => ({ ...prev, form_config: newFields }));
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const newField = {
                      id: `field_${Date.now()}`,
                      name: `field_${productForm.form_config.length + 1}`,
                      label: '新字段',
                      type: 'text' as const,
                      placeholder: '请输入内容',
                      required: false
                    };
                    setProductForm(prev => ({
                      ...prev,
                      form_config: [...prev.form_config, newField]
                    }));
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加字段
                </Button>
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
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
            <Button onClick={handleSaveProduct}>
              <Save className="h-4 w-4 mr-2" />
              {selectedProduct ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage; 