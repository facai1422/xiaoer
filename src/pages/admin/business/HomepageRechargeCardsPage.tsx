import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Settings, Upload, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RechargeCard {
  id: number;
  title: string;
  discount: string;
  discount_rate: number;
  exchange_rate: number;
  image_url: string;
  route: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const HomepageRechargeCardsPage = () => {
  const [cards, setCards] = useState<RechargeCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<RechargeCard | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    discount: "",
    discount_rate: 0.85,
    exchange_rate: 7.2,
    image_url: "",
    route: "",
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('homepage_recharge_cards')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('获取充值卡片失败:', error);
        toast.error('获取充值卡片失败');
        return;
      }

      setCards(data || []);
    } catch (error) {
      console.error('获取充值卡片失败:', error);
      toast.error('获取充值卡片失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.route.trim()) {
      toast.error('请填写标题和路由');
      return;
    }

    try {
      if (editingCard) {
        // 更新卡片
        const { error } = await supabase
          .from('homepage_recharge_cards')
          .update({
            title: formData.title,
            discount: formData.discount,
            discount_rate: formData.discount_rate,
            exchange_rate: formData.exchange_rate,
            image_url: formData.image_url,
            route: formData.route,
            is_active: formData.is_active,
            display_order: formData.display_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCard.id);

        if (error) throw error;
        toast.success('卡片更新成功');
      } else {
        // 创建新卡片
        const { error } = await supabase
          .from('homepage_recharge_cards')
          .insert([{
            title: formData.title,
            discount: formData.discount,
            discount_rate: formData.discount_rate,
            exchange_rate: formData.exchange_rate,
            image_url: formData.image_url,
            route: formData.route,
            is_active: formData.is_active,
            display_order: formData.display_order,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
        toast.success('卡片创建成功');
      }

      await fetchCards();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('保存卡片失败:', error);
      toast.error('保存卡片失败');
    }
  };

  const handleEdit = (card: RechargeCard) => {
    setEditingCard(card);
    setFormData({
      title: card.title,
      discount: card.discount,
      discount_rate: card.discount_rate,
      exchange_rate: card.exchange_rate,
      image_url: card.image_url,
      route: card.route,
      is_active: card.is_active,
      display_order: card.display_order
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这张卡片吗？')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('homepage_recharge_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchCards();
      toast.success('卡片删除成功');
    } catch (error) {
      console.error('删除卡片失败:', error);
      toast.error('删除卡片失败');
    }
  };

  const toggleActive = async (id: number) => {
    try {
      const currentCard = cards.find(card => card.id === id);
      if (!currentCard) return;

      const { error } = await supabase
        .from('homepage_recharge_cards')
        .update({
          is_active: !currentCard.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchCards();
      toast.success('卡片状态更新成功');
    } catch (error) {
      console.error('更新卡片状态失败:', error);
      toast.error('更新卡片状态失败');
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      discount: "",
      discount_rate: 0.85,
      exchange_rate: 7.2,
      image_url: "",
      route: "",
      is_active: true,
      display_order: 0
    });
    setEditingCard(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // 生成折扣显示文本
  const generateDiscountText = (rate: number) => {
    return `${(rate * 10).toFixed(1)}折充值`;
  };

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">首页快速充值卡片管理</h1>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          添加卡片
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总卡片数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cards.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              启用卡片
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {cards.filter(card => card.is_active).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              禁用卡片
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {cards.filter(card => !card.is_active).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均折扣
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {cards.length > 0 
                ? (cards.reduce((sum, card) => sum + card.discount_rate, 0) / cards.length * 10).toFixed(1)
                : '0.0'
              }折
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 卡片列表 */}
      <Card>
        <CardHeader>
          <CardTitle>卡片列表</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2">加载中...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>卡片信息</TableHead>
                  <TableHead>折扣配置</TableHead>
                  <TableHead>汇率</TableHead>
                  <TableHead>路由</TableHead>
                  <TableHead>排序</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {card.image_url && (
                          <img 
                            src={card.image_url} 
                            alt={card.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{card.title}</div>
                          <div className="text-sm text-gray-500">{card.discount}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {(card.discount_rate * 10).toFixed(1)}折
                      </Badge>
                    </TableCell>
                    <TableCell>{card.exchange_rate}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {card.route}
                      </code>
                    </TableCell>
                    <TableCell>{card.display_order}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={card.is_active}
                          onCheckedChange={() => toggleActive(card.id)}
                        />
                        <Badge variant={card.is_active ? 'default' : 'secondary'}>
                          {card.is_active ? '启用' : '禁用'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(card)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(card.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* 编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? '编辑卡片' : '添加卡片'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">卡片标题</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="普通话费充值"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="route">路由路径</Label>
                <Input
                  id="route"
                  value={formData.route}
                  onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
                  placeholder="/mobile-recharge"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount_rate">折扣率</Label>
                <Input
                  id="discount_rate"
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="1"
                  value={formData.discount_rate}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value) || 0.85;
                    setFormData(prev => ({ 
                      ...prev, 
                      discount_rate: rate,
                      discount: generateDiscountText(rate)
                    }));
                  }}
                  placeholder="0.85"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  当前显示：{generateDiscountText(formData.discount_rate)}
                </p>
              </div>
              
              <div>
                <Label htmlFor="exchange_rate">汇率</Label>
                <Input
                  id="exchange_rate"
                  type="number"
                  step="0.1"
                  min="1"
                  max="20"
                  value={formData.exchange_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, exchange_rate: parseFloat(e.target.value) || 7.2 }))}
                  placeholder="7.2"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="image_url">图片URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="/lovable-uploads/image.png"
                />
                <Button type="button" variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              {formData.image_url && (
                <div className="mt-2">
                  <img 
                    src={formData.image_url} 
                    alt="预览" 
                    className="w-20 h-20 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="display_order">显示顺序</Label>
                <Input
                  id="display_order"
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">数字越小越靠前显示</p>
              </div>
              
              <div>
                <Label>状态</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <span className="text-sm">
                    {formData.is_active ? '启用' : '禁用'}
                  </span>
                </div>
              </div>
            </div>
          </form>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleSubmit}>
              {editingCard ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomepageRechargeCardsPage;