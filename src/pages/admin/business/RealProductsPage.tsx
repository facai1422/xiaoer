import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { triggerConfigRefresh } from '@/hooks/useProductConfig';

// 导入真实的业务产品服务
import { 
  getAllBusinessProducts, 
  createBusinessProduct, 
  updateBusinessProduct, 
  deleteBusinessProduct,
  type BusinessProduct 
} from '../../../services/businessProductsService';

// 数据库函数返回类型
interface UpdateProductStatusResult {
  success: boolean;
  message: string;
}

// 基础样式定义
const styles = {
  container: {
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '24px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '8px'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '14px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  button: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '8px',
    marginBottom: '8px'
  },
  buttonSecondary: {
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '8px',
    marginBottom: '8px'
  },
  buttonSuccess: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '8px',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '12px'
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '12px',
    backgroundColor: 'white'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: 'white'
  },
  th: {
    padding: '12px',
    textAlign: 'left' as const,
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    fontWeight: '600',
    fontSize: '14px',
    color: '#374151'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px',
    color: '#374151'
  },
  modal: {
    position: 'fixed' as const,
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'auto'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '4px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500'
  },
  badgeActive: {
    backgroundColor: '#dcfce7',
    color: '#166534'
  },
  badgeInactive: {
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  },
  badgeMaintenance: {
    backgroundColor: '#fef3c7',
    color: '#92400e'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    textAlign: 'center' as const
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e293b'
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e293b'
  },
  tr: {
    backgroundColor: '#f9fafb'
  },
  actionButton: {
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '8px'
  }
};

const RealProductsPage: React.FC = () => {
  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BusinessProduct | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '代还服务',
    description: '',
    logo_url: '',
    exchange_rate: 7.2, // 汇率 (USD to CNY)
    discount_rate: 0.75, // 折扣率 (75折)
    status: 'active' as 'active' | 'inactive' | 'maintenance',
    min_amount: 100,
    max_amount: 50000,
    quick_amounts: '500,1000,2000,5000',
    sort_order: 0,
    is_featured: false
  });

  // 加载真实数据
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllBusinessProducts();
      setProducts(data);
    } catch (error) {
      console.error('加载产品失败:', error);
      alert('加载产品数据失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleEdit = (product: BusinessProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      category: product.category,
      description: product.description || '',
      logo_url: product.logo_url || '',
      exchange_rate: product.base_rate || 7.2, // 临时兼容旧字段名
      discount_rate: product.discount_rate || 0.75,
      status: product.status,
      min_amount: product.min_amount,
      max_amount: product.max_amount,
      quick_amounts: product.quick_amounts.join(','),
      sort_order: product.sort_order,
      is_featured: product.is_featured
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      category: '代还服务',
      description: '',
      logo_url: '',
      exchange_rate: 7.2, // 汇率
      discount_rate: 0.75, // 折扣率
      status: 'active',
      min_amount: 100,
      max_amount: 50000,
      quick_amounts: '500,1000,2000,5000',
      sort_order: 0,
      is_featured: false
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const productData = {
        name: formData.name,
        slug: formData.slug,
        category: formData.category,
        description: formData.description,
        logo_url: formData.logo_url,
        base_rate: formData.exchange_rate, // 保存到base_rate字段以兼容现有数据库
        discount_rate: formData.discount_rate,
        status: formData.status,
        min_amount: formData.min_amount,
        max_amount: formData.max_amount,
        quick_amounts: formData.quick_amounts.split(',').map(amount => parseInt(amount.trim())).filter(amount => !isNaN(amount)),
        sort_order: formData.sort_order,
        is_featured: formData.is_featured
      };

      console.log('保存产品数据:', productData);

      if (editingProduct) {
        await updateBusinessProduct(editingProduct.id, productData);
        
        // 触发全局配置刷新事件，通知用户端更新
        triggerConfigRefresh(editingProduct.slug);
        
        alert('产品更新成功！');
      } else {
        await createBusinessProduct(productData);
        
        // 新产品创建后也触发刷新
        triggerConfigRefresh(productData.slug);
        
        alert('产品创建成功！');
      }
      
      setShowModal(false);
      await loadProducts(); // 重新加载数据
    } catch (error) {
      console.error('保存产品失败:', error);
      alert(`保存失败: ${error.message || '请重试'}`);
    }
  };

  const handleDelete = async (product: BusinessProduct) => {
    if (confirm(`确定要删除产品 "${product.name}" 吗？`)) {
      try {
        console.log('正在删除产品:', product.id);
        
        await deleteBusinessProduct(product.id);

        // 触发全局配置刷新事件，通知用户端更新
        triggerConfigRefresh(product.slug);

        alert('产品删除成功！');
        await loadProducts(); // 重新加载数据
      } catch (error) {
        console.error('删除产品失败:', error);
        alert(`删除失败: ${error.message || '请重试'}`);
      }
    }
  };

  const toggleStatus = async (product: BusinessProduct) => {
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      console.log('正在更新产品状态:', { productId: product.id, oldStatus: product.status, newStatus });
      
      // 使用已认证的Supabase客户端调用数据库函数
      const { data, error } = await (supabase as unknown as { rpc: (name: string, params: Record<string, unknown>) => Promise<{ data: UpdateProductStatusResult | null; error: unknown }> }).rpc('update_product_status', {
        product_id: product.id,
        new_status: newStatus
      });

      console.log('数据库函数调用结果:', { data, error });

      if (error) {
        console.error('数据库函数调用失败:', error);
        throw new Error(`更新失败: ${(error as { message?: string })?.message || '未知错误'}`);
      }

      if (data && !data.success) {
        throw new Error(data.message || '更新失败');
      }

      // 触发全局配置刷新事件，通知用户端更新
      triggerConfigRefresh(product.slug);

      alert(`产品状态已更新为 ${newStatus === 'active' ? '启用' : '禁用'}`);
      await loadProducts(); // 重新加载数据
    } catch (error) {
      console.error('更新状态失败:', error);
      alert(`状态更新失败: ${error.message || '请重试'}`);
    }
  };

  // 计算价格预览 - 修正的汇率和折扣逻辑
  const calculatePrice = (amount: number, exchangeRate: number, discountRate: number) => {
    const discountedPrice = amount * discountRate; // 折扣后价格
    const usdtAmount = discountedPrice / exchangeRate; // USDT金额
    const savings = amount - discountedPrice; // 节省金额
    return {
      original: amount,
      discountedPrice,
      usdtAmount,
      savings,
      exchangeRate,
      discountRate
    };
  };

  const getPreview = () => {
    return calculatePrice(10000, formData.exchange_rate, formData.discount_rate);
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'active':
        return { ...styles.badge, ...styles.badgeActive };
      case 'inactive':
        return { ...styles.badge, ...styles.badgeInactive };
      case 'maintenance':
        return { ...styles.badge, ...styles.badgeMaintenance };
      default:
        return { ...styles.badge, ...styles.badgeInactive };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '启用';
      case 'inactive':
        return '禁用';
      case 'maintenance':
        return '维护中';
      default:
        return '未知';
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '18px', color: '#6b7280' }}>加载中...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* 页面头部 */}
      <div style={styles.header}>
        <h1 style={styles.title}>业务产品管理</h1>
        <p style={styles.subtitle}>管理系统中的所有业务产品，包括汇率设置、折扣配置等</p>
      </div>

      {/* 统计卡片 */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>总产品数</div>
          <div style={styles.statValue}>{products.length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>启用产品</div>
          <div style={styles.statValue}>{products.filter(p => p.status === 'active').length}</div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div style={styles.card}>
        <button style={styles.button} onClick={handleAdd}>
          + 新增产品
        </button>
        <button style={styles.buttonSecondary} onClick={loadProducts}>
          🔄 刷新数据
        </button>
        <button style={styles.buttonSuccess} onClick={() => alert('功能开发中...')}>
          📊 导出数据
        </button>
      </div>

      {/* 产品列表 */}
      <div style={styles.card}>
        <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>产品列表</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>产品名称</th>
              <th style={styles.th}>分类</th>
              <th style={styles.th}>汇率设置</th>
              <th style={styles.th}>折扣设置</th>
              <th style={styles.th}>金额范围</th>
              <th style={styles.th}>状态</th>
              <th style={styles.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{product.slug}</div>
                </td>
                <td style={styles.td}>{product.category}</td>
                <td style={styles.td}>{product.base_rate || 7.2}</td>
                <td style={styles.td}>{Math.round((product.discount_rate || 0.75) * 100)}折</td>
                <td style={styles.td}>¥{product.min_amount.toLocaleString()} - ¥{product.max_amount.toLocaleString()}</td>
                <td style={styles.td}>
                  <span style={getStatusBadgeStyle(product.status)}>
                    {getStatusText(product.status)}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      style={styles.actionButton}
                      onClick={() => handleEdit(product)}
                    >
                      编辑
                    </button>
                    <button 
                      style={{...styles.actionButton, backgroundColor: product.status === 'active' ? '#ef4444' : '#10b981'}}
                      onClick={() => toggleStatus(product)}
                    >
                      {product.status === 'active' ? '禁用' : '启用'}
                    </button>
                    <button 
                      style={{...styles.actionButton, backgroundColor: '#ef4444'}}
                      onClick={() => handleDelete(product)}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 编辑/新增模态框 */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>
              {editingProduct ? '编辑产品' : '新增产品'}
            </h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>产品名称</label>
              <input
                style={styles.input}
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="请输入产品名称"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>产品标识(slug)</label>
              <input
                style={styles.input}
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="自动生成或手动输入"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>产品分类</label>
              <select
                style={styles.select}
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="代还服务">代还服务</option>
                <option value="充值服务">充值服务</option>
                <option value="生活缴费">生活缴费</option>
                <option value="游戏充值">游戏充值</option>
                <option value="金融服务">金融服务</option>
                <option value="通信服务">通信服务</option>
                <option value="其他服务">其他服务</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>产品描述</label>
              <input
                style={styles.input}
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="请输入产品描述"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Logo URL</label>
              <input
                style={styles.input}
                type="text"
                value={formData.logo_url}
                onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                placeholder="请输入Logo图片URL"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>汇率设置</label>
                <input
                  style={styles.input}
                  type="number"
                  step="0.1"
                  min="1"
                  max="20"
                  value={formData.exchange_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, exchange_rate: parseFloat(e.target.value) || 7.2 }))}
                  placeholder="7.2"
                />
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  输入汇率值，如：6.9、7.0、7.2等
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>折扣设置</label>
                <input
                  style={styles.input}
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="1"
                  value={formData.discount_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_rate: parseFloat(e.target.value) || 0.75 }))}
                  placeholder="0.75"
                />
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  输入折扣率，如：0.75（75折）、0.80（80折）
                </div>
              </div>
            </div>

            {/* 价格计算预览 */}
            <div style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>
                💰 价格计算预览 (¥10,000)
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                原价: ¥10,000<br/>
                汇率: {formData.exchange_rate}<br/>
                折扣率: {Math.round(formData.discount_rate * 100)}%<br/>
                折扣后价格: ¥{(10000 * formData.discount_rate).toLocaleString()}<br/>
                USDT金额: {((10000 * formData.discount_rate) / formData.exchange_rate).toFixed(4)} USDT<br/>
                节省金额: ¥{(10000 * (1 - formData.discount_rate)).toLocaleString()}<br/>
                <div style={{ marginTop: '8px', fontStyle: 'italic', color: '#9ca3af' }}>
                  计算公式: (¥10,000 × {formData.discount_rate}) ÷ {formData.exchange_rate} = {((10000 * formData.discount_rate) / formData.exchange_rate).toFixed(4)} USDT
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>最小金额</label>
                <input
                  style={styles.input}
                  type="number"
                  min="1"
                  value={formData.min_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_amount: parseInt(e.target.value) || 100 }))}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>最大金额</label>
                <input
                  style={styles.input}
                  type="number"
                  min="1"
                  value={formData.max_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_amount: parseInt(e.target.value) || 50000 }))}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>快捷金额 (用逗号分隔)</label>
              <input
                style={styles.input}
                type="text"
                value={formData.quick_amounts}
                onChange={(e) => setFormData(prev => ({ ...prev, quick_amounts: e.target.value }))}
                placeholder="500,1000,2000,5000"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>状态</label>
                <select
                  style={styles.select}
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'maintenance' }))}
                >
                  <option value="active">启用</option>
                  <option value="inactive">禁用</option>
                  <option value="maintenance">维护中</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>排序顺序</label>
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                  style={{ marginRight: '8px' }}
                />
                设为推荐产品
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button 
                style={styles.buttonSecondary}
                onClick={() => setShowModal(false)}
              >
                取消
              </button>
              <button 
                style={styles.button}
                onClick={handleSave}
              >
                {editingProduct ? '更新' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealProductsPage; 