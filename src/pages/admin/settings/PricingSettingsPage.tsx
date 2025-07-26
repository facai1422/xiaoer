import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Edit, Trash2, Settings, Calculator, Percent } from 'lucide-react';
import { 
  getExchangeRateSettings,
  getDiscountSettings,
  createExchangeRateSetting,
  createDiscountSetting,
  updateExchangeRateSetting,
  updateDiscountSetting,
  deleteExchangeRateSetting,
  deleteDiscountSetting,
  calculatePrice,
  type ExchangeRateSetting,
  type DiscountSetting
} from '@/services/pricingService';

const PricingSettingsPage = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateSetting[]>([]);
  const [discounts, setDiscounts] = useState<DiscountSetting[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 对话框状态
  const [exchangeRateDialog, setExchangeRateDialog] = useState(false);
  const [discountDialog, setDiscountDialog] = useState(false);
  const [editingExchangeRate, setEditingExchangeRate] = useState<ExchangeRateSetting | null>(null);
  const [editingDiscount, setEditingDiscount] = useState<DiscountSetting | null>(null);
  
  // 表单状态
  const [exchangeRateForm, setExchangeRateForm] = useState({
    name: '',
    rate: '',
    description: '',
    is_default: false
  });
  
  const [discountForm, setDiscountForm] = useState({
    name: '',
    discount_rate: '',
    description: '',
    is_default: false
  });
  
  // 价格计算预览
  const [previewAmount, setPreviewAmount] = useState('10000');
  const [selectedExchangeRate, setSelectedExchangeRate] = useState<number>(7.2);
  const [selectedDiscountRate, setSelectedDiscountRate] = useState<number>(0.75);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [exchangeRatesData, discountsData] = await Promise.all([
        getExchangeRateSettings(),
        getDiscountSettings()
      ]);
      
      setExchangeRates(exchangeRatesData);
      setDiscounts(discountsData);
      
      // 设置默认值用于预览
      const defaultRate = exchangeRatesData.find(r => r.is_default);
      const defaultDiscount = discountsData.find(d => d.is_default);
      if (defaultRate) setSelectedExchangeRate(defaultRate.rate);
      if (defaultDiscount) setSelectedDiscountRate(defaultDiscount.discount_rate);
      
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 汇率相关操作
  const handleCreateExchangeRate = async () => {
    try {
      if (!exchangeRateForm.name || !exchangeRateForm.rate) {
        toast.error('请填写完整信息');
        return;
      }

      const rate = parseFloat(exchangeRateForm.rate);
      if (isNaN(rate) || rate <= 0) {
        toast.error('请输入有效的汇率');
        return;
      }

      await createExchangeRateSetting({
        name: exchangeRateForm.name,
        rate: rate,
        description: exchangeRateForm.description,
        is_default: exchangeRateForm.is_default,
        status: 'active'
      });

      toast.success('汇率设置创建成功');
      setExchangeRateDialog(false);
      resetExchangeRateForm();
      loadData();
    } catch (error) {
      console.error('创建汇率设置失败:', error);
      toast.error('创建失败');
    }
  };

  const handleUpdateExchangeRate = async () => {
    if (!editingExchangeRate) return;
    
    try {
      const rate = parseFloat(exchangeRateForm.rate);
      if (isNaN(rate) || rate <= 0) {
        toast.error('请输入有效的汇率');
        return;
      }

      await updateExchangeRateSetting(editingExchangeRate.id, {
        name: exchangeRateForm.name,
        rate: rate,
        description: exchangeRateForm.description,
        is_default: exchangeRateForm.is_default,
        status: 'active'
      });

      toast.success('汇率设置更新成功');
      setExchangeRateDialog(false);
      setEditingExchangeRate(null);
      resetExchangeRateForm();
      loadData();
    } catch (error) {
      console.error('更新汇率设置失败:', error);
      toast.error('更新失败');
    }
  };

  const handleDeleteExchangeRate = async (id: string) => {
    if (!confirm('确定要删除这个汇率设置吗？')) return;
    
    try {
      await deleteExchangeRateSetting(id);
      toast.success('汇率设置删除成功');
      loadData();
    } catch (error) {
      console.error('删除汇率设置失败:', error);
      toast.error('删除失败');
    }
  };

  // 折扣相关操作
  const handleCreateDiscount = async () => {
    try {
      if (!discountForm.name || !discountForm.discount_rate) {
        toast.error('请填写完整信息');
        return;
      }

      const rate = parseFloat(discountForm.discount_rate);
      if (isNaN(rate) || rate <= 0 || rate > 1) {
        toast.error('请输入有效的折扣率（0-1之间）');
        return;
      }

      await createDiscountSetting({
        name: discountForm.name,
        discount_rate: rate,
        description: discountForm.description,
        is_default: discountForm.is_default,
        status: 'active'
      });

      toast.success('折扣设置创建成功');
      setDiscountDialog(false);
      resetDiscountForm();
      loadData();
    } catch (error) {
      console.error('创建折扣设置失败:', error);
      toast.error('创建失败');
    }
  };

  const handleUpdateDiscount = async () => {
    if (!editingDiscount) return;
    
    try {
      const rate = parseFloat(discountForm.discount_rate);
      if (isNaN(rate) || rate <= 0 || rate > 1) {
        toast.error('请输入有效的折扣率（0-1之间）');
        return;
      }

      await updateDiscountSetting(editingDiscount.id, {
        name: discountForm.name,
        discount_rate: rate,
        description: discountForm.description,
        is_default: discountForm.is_default,
        status: 'active'
      });

      toast.success('折扣设置更新成功');
      setDiscountDialog(false);
      setEditingDiscount(null);
      resetDiscountForm();
      loadData();
    } catch (error) {
      console.error('更新折扣设置失败:', error);
      toast.error('更新失败');
    }
  };

  const handleDeleteDiscount = async (id: string) => {
    if (!confirm('确定要删除这个折扣设置吗？')) return;
    
    try {
      await deleteDiscountSetting(id);
      toast.success('折扣设置删除成功');
      loadData();
    } catch (error) {
      console.error('删除折扣设置失败:', error);
      toast.error('删除失败');
    }
  };

  // 表单重置
  const resetExchangeRateForm = () => {
    setExchangeRateForm({
      name: '',
      rate: '',
      description: '',
      is_default: false
    });
  };

  const resetDiscountForm = () => {
    setDiscountForm({
      name: '',
      discount_rate: '',
      description: '',
      is_default: false
    });
  };

  // 编辑操作
  const openEditExchangeRate = (rate: ExchangeRateSetting) => {
    setEditingExchangeRate(rate);
    setExchangeRateForm({
      name: rate.name,
      rate: rate.rate.toString(),
      description: rate.description || '',
      is_default: rate.is_default
    });
    setExchangeRateDialog(true);
  };

  const openEditDiscount = (discount: DiscountSetting) => {
    setEditingDiscount(discount);
    setDiscountForm({
      name: discount.name,
      discount_rate: discount.discount_rate.toString(),
      description: discount.description || '',
      is_default: discount.is_default
    });
    setDiscountDialog(true);
  };

  // 价格计算预览
  const previewCalculation = calculatePrice(
    parseFloat(previewAmount) || 0,
    selectedDiscountRate,
    selectedExchangeRate
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-semibold">价格设置</h1>
      </div>

      {/* 价格计算预览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>价格计算预览</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>原价（人民币）</Label>
              <Input
                type="number"
                value={previewAmount}
                onChange={(e) => setPreviewAmount(e.target.value)}
                placeholder="10000"
              />
            </div>
            <div>
              <Label>汇率</Label>
              <Input
                type="number"
                step="0.1"
                min="1"
                max="20"
                value={selectedExchangeRate}
                onChange={(e) => setSelectedExchangeRate(parseFloat(e.target.value) || 7.2)}
                placeholder="7.2"
              />
              <div className="text-xs text-gray-500 mt-1">
                输入汇率值，如：6.9、7.0、7.2等
              </div>
            </div>
            <div>
              <Label>折扣率</Label>
              <Input
                type="number"
                step="0.01"
                min="0.1"
                max="1"
                value={selectedDiscountRate}
                onChange={(e) => setSelectedDiscountRate(parseFloat(e.target.value) || 0.75)}
                placeholder="0.75"
              />
              <div className="text-xs text-gray-500 mt-1">
                输入折扣率，如：0.75（75折）、0.80（80折）
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <div className="text-sm text-gray-600">计算结果</div>
              <div className="text-lg font-bold text-blue-600">
                {previewCalculation.usdt_amount.toFixed(4)} USDT
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">计算明细：</div>
            <div className="space-y-1 text-sm">
              <div>原价：¥{previewCalculation.original_price.toLocaleString()}</div>
              <div>折扣率：{(selectedDiscountRate * 100).toFixed(0)}折 ({(selectedDiscountRate * 100).toFixed(1)}%)</div>
              <div>折扣后价格：¥{previewCalculation.discounted_price.toLocaleString()}</div>
              <div>汇率：1 USDT = ¥{selectedExchangeRate.toFixed(1)}</div>
              <div className="font-medium text-blue-600">
                最终USDT金额：{previewCalculation.usdt_amount.toFixed(4)} USDT
              </div>
              <div className="text-green-600">
                节省：¥{previewCalculation.savings.toLocaleString()}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                计算公式：最终USDT金额 = (原价 × 折扣率) ÷ 汇率
              </div>
              <div className="text-xs text-gray-500 mt-1">
                即：({previewCalculation.original_price.toLocaleString()} × {selectedDiscountRate}) ÷ {selectedExchangeRate.toFixed(1)} = {previewCalculation.usdt_amount.toFixed(4)} USDT
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 汇率设置 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>汇率设置</span>
          </CardTitle>
          <Dialog open={exchangeRateDialog} onOpenChange={setExchangeRateDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingExchangeRate(null);
                resetExchangeRateForm();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                添加汇率
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingExchangeRate ? '编辑汇率' : '添加汇率'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>汇率名称</Label>
                  <Input
                    value={exchangeRateForm.name}
                    onChange={(e) => setExchangeRateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="例如：汇率 7.2"
                  />
                </div>
                <div>
                  <Label>汇率值</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={exchangeRateForm.rate}
                    onChange={(e) => setExchangeRateForm(prev => ({ ...prev, rate: e.target.value }))}
                    placeholder="7.2"
                  />
                </div>
                <div>
                  <Label>说明</Label>
                  <Textarea
                    value={exchangeRateForm.description}
                    onChange={(e) => setExchangeRateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="汇率说明（可选）"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={exchangeRateForm.is_default}
                    onCheckedChange={(checked) => setExchangeRateForm(prev => ({ ...prev, is_default: checked }))}
                  />
                  <Label>设为默认汇率</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setExchangeRateDialog(false)}
                >
                  取消
                </Button>
                <Button
                  onClick={editingExchangeRate ? handleUpdateExchangeRate : handleCreateExchangeRate}
                >
                  {editingExchangeRate ? '更新' : '创建'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>汇率</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>说明</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exchangeRates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="font-medium">{rate.name}</TableCell>
                  <TableCell>{rate.rate}</TableCell>
                  <TableCell>
                    {rate.is_default && (
                      <Badge variant="default">默认</Badge>
                    )}
                    <Badge variant="secondary" className="ml-1">
                      {rate.status === 'active' ? '启用' : '禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {rate.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditExchangeRate(rate)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteExchangeRate(rate.id)}
                        disabled={rate.is_default}
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

      {/* 折扣设置 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Percent className="h-5 w-5" />
            <span>折扣设置</span>
          </CardTitle>
          <Dialog open={discountDialog} onOpenChange={setDiscountDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingDiscount(null);
                resetDiscountForm();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                添加折扣
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingDiscount ? '编辑折扣' : '添加折扣'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>折扣名称</Label>
                  <Input
                    value={discountForm.name}
                    onChange={(e) => setDiscountForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="例如：75折"
                  />
                </div>
                <div>
                  <Label>折扣率</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={discountForm.discount_rate}
                    onChange={(e) => setDiscountForm(prev => ({ ...prev, discount_rate: e.target.value }))}
                    placeholder="0.75"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    输入0-1之间的小数，如0.75表示75折
                  </div>
                </div>
                <div>
                  <Label>说明</Label>
                  <Textarea
                    value={discountForm.description}
                    onChange={(e) => setDiscountForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="折扣说明（可选）"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={discountForm.is_default}
                    onCheckedChange={(checked) => setDiscountForm(prev => ({ ...prev, is_default: checked }))}
                  />
                  <Label>设为默认折扣</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDiscountDialog(false)}
                >
                  取消
                </Button>
                <Button
                  onClick={editingDiscount ? handleUpdateDiscount : handleCreateDiscount}
                >
                  {editingDiscount ? '更新' : '创建'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>折扣率</TableHead>
                <TableHead>显示名称</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>说明</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell className="font-medium">{discount.name}</TableCell>
                  <TableCell>{discount.discount_rate}</TableCell>
                  <TableCell>{discount.name}</TableCell>
                  <TableCell>
                    {discount.is_default && (
                      <Badge variant="default">默认</Badge>
                    )}
                    <Badge variant="secondary" className="ml-1">
                      {discount.status === 'active' ? '启用' : '禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {discount.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDiscount(discount)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDiscount(discount.id)}
                        disabled={discount.is_default}
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
    </div>
  );
};

export default PricingSettingsPage; 