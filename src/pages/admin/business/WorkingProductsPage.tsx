import * as React from 'react';
const { useState, useEffect } = React;

// 导入真实的业务产品服务
import { 
  getAllBusinessProducts, 
  createBusinessProduct, 
  updateBusinessProduct, 
  deleteBusinessProduct,
  type BusinessProduct 
} from '../../../services/businessProductsService';

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
    width: '95%',
    maxWidth: '800px',
    maxHeight: '95vh',
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
  }
};

// 使用真实的产品接口
type Product = BusinessProduct;

const WorkingProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '代还服务',
    description: '',
    logo_url: '',
    base_rate: 0.75,
    discount_rate: 0.05,
    status: 'active' as 'active' | 'inactive' | 'maintenance',
    min_amount: 100,
    max_amount: 50000,
    quick_amounts: '500,1000,2000,5000',
    sort_order: 0,
    form_config: [] as Array<{
      id: string;
      label: string;
      type: 'text' | 'tel' | 'email' | 'link' | 'textarea' | 'number' | 'qrcode' | 'select';
      placeholder?: string;
      required: boolean;
      order: number;
      options?: string[];
    }>
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      category: product.category,
      description: product.description || '',
      logo_url: product.logo_url || '',
      base_rate: product.base_rate,
      discount_rate: product.discount_rate,
      status: product.status,
      min_amount: product.min_amount,
      max_amount: product.max_amount,
      quick_amounts: product.quick_amounts.join(','),
      sort_order: product.sort_order,
      form_config: product.form_config || []
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
      base_rate: 0.75,
      discount_rate: 0.05,
      status: 'active',
      min_amount: 100,
      max_amount: 50000,
      quick_amounts: '500,1000,2000,5000',
      sort_order: 0,
      form_config: [
        {
          id: 'name',
          label: '姓名',
          type: 'text',
          placeholder: '请输入姓名',
          required: false,
          order: 1
        },
        {
          id: 'phone',
          label: '手机号',
          type: 'tel',
          placeholder: '请输入手机号',
          required: true,
          order: 2
        },
        {
          id: 'baitiao_link',
          label: '白条链接',
          type: 'link',
          placeholder: '请输入白条链接',
          required: true,
          order: 3
        },
        {
          id: 'amount',
          label: '金额',
          type: 'number',
          placeholder: '请输入金额',
          required: true,
          order: 4
        }
      ]
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const quickAmounts = formData.quick_amounts.split(',').map(a => parseInt(a.trim())).filter(a => !isNaN(a));
      
      const productData = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        category: formData.category,
        description: formData.description,
        logo_url: formData.logo_url,
        base_rate: formData.base_rate,
        discount_rate: formData.discount_rate,
        status: formData.status,
        min_amount: formData.min_amount,
        max_amount: formData.max_amount,
        quick_amounts: quickAmounts,
        sort_order: formData.sort_order,
        logo_type: 'static' as const,
        is_featured: false,
        form_config: formData.form_config,
        workflow_config: []
      };

      if (editingProduct) {
        await updateBusinessProduct(editingProduct.id, productData);
        alert('产品更新成功！');
      } else {
        await createBusinessProduct(productData);
        alert('产品创建成功！');
      }
      
      setShowModal(false);
      await loadProducts(); // 重新加载数据
    } catch (error) {
      console.error('保存产品失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`确定要删除产品 "${product.name}" 吗？`)) {
      try {
        await deleteBusinessProduct(product.id);
        alert('产品删除成功！');
        await loadProducts(); // 重新加载数据
      } catch (error) {
        console.error('删除产品失败:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const toggleStatus = async (product: Product) => {
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      await updateBusinessProduct(product.id, { ...product, status: newStatus });
      alert(`产品状态已更新为 ${newStatus === 'active' ? '启用' : '禁用'}`);
      await loadProducts(); // 重新加载数据
    } catch (error) {
      console.error('更新状态失败:', error);
      alert('状态更新失败，请重试');
    }
  };

  const calculatePrice = (amount: number, baseRate: number, discountRate: number) => {
    const finalRate = baseRate - discountRate; // 最终费率 = 基础费率 - 折扣
    const finalAmount = amount * finalRate;
    return {
      original: amount,
      finalAmount,
      finalRate,
      savings: amount - finalAmount
    };
  };

  const getPreview = () => {
    const amount = 10000;
    return calculatePrice(amount, formData.base_rate, formData.discount_rate);
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
      <div style={styles.grid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{products.length}</div>
          <div style={styles.statLabel}>总产品数</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{products.filter(p => p.status === 'active').length}</div>
          <div style={styles.statLabel}>启用产品</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>7.2</div>
          <div style={styles.statLabel}>平均汇率</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>75%</div>
          <div style={styles.statLabel}>平均折扣</div>
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
              <th style={styles.th}>基础费率</th>
              <th style={styles.th}>折扣费率</th>
              <th style={styles.th}>金额范围</th>
              <th style={styles.th}>状态</th>
              <th style={styles.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td style={styles.td}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{product.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{product.slug}</div>
                  </div>
                </td>
                <td style={styles.td}>{product.category}</td>
                <td style={styles.td}>{Math.round(product.base_rate * 100)}%</td>
                <td style={styles.td}>{Math.round(product.discount_rate * 100)}%</td>
                <td style={styles.td}>
                  ¥{product.min_amount.toLocaleString()} - ¥{product.max_amount.toLocaleString()}
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    ...(product.status === 'active' ? styles.badgeActive : styles.badgeInactive)
                  }}>
                    {product.status === 'active' ? '启用' : '禁用'}
                  </span>
                </td>
                <td style={styles.td}>
                  <button 
                    style={{ ...styles.button, padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => handleEdit(product)}
                  >
                    编辑
                  </button>
                  <button 
                    style={{ ...styles.buttonSecondary, padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => toggleStatus(product)}
                  >
                    {product.status === 'active' ? '禁用' : '启用'}
                  </button>
                  <button 
                    style={{ 
                      ...styles.buttonSecondary, 
                      padding: '6px 12px', 
                      fontSize: '12px',
                      backgroundColor: '#ef4444'
                    }}
                    onClick={() => handleDelete(product)}
                  >
                    删除
                  </button>
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
                <label style={styles.label}>基础费率</label>
                <input
                  style={styles.input}
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="1"
                  value={formData.base_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, base_rate: parseFloat(e.target.value) || 0.75 }))}
                />
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {Math.round(formData.base_rate * 100)}% 基础费率
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>折扣费率</label>
                <input
                  style={styles.input}
                  type="number"
                  step="0.01"
                  min="0"
                  max="0.5"
                  value={formData.discount_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_rate: parseFloat(e.target.value) || 0.05 }))}
                />
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {Math.round(formData.discount_rate * 100)}% 折扣
                </div>
              </div>
            </div>

            {/* 费率计算预览 */}
            <div style={{ 
              backgroundColor: '#f0f9ff', 
              border: '1px solid #0ea5e9', 
              borderRadius: '6px', 
              padding: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#0369a1' }}>
                💰 费率计算预览 (¥10,000)
              </div>
              <div style={{ fontSize: '12px', color: '#0369a1' }}>
                原价: ¥{getPreview().original.toLocaleString()} → 
                最终金额: ¥{getPreview().finalAmount.toLocaleString()} → 
                最终费率: {Math.round(getPreview().finalRate * 100)}%
              </div>
              <div style={{ fontSize: '11px', color: '#0369a1', marginTop: '4px' }}>
                计算公式: ¥{getPreview().original.toLocaleString()} × ({Math.round(formData.base_rate * 100)}% - {Math.round(formData.discount_rate * 100)}%) = ¥{getPreview().finalAmount.toLocaleString()}
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

            {/* 分隔线 */}
            <div style={{ 
              marginTop: '32px', 
              marginBottom: '24px', 
              borderTop: '2px solid #e5e7eb', 
              paddingTop: '24px' 
            }}>
              <div style={{ 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                padding: '12px 16px', 
                borderRadius: '8px 8px 0 0',
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '0'
              }}>
                📝 表单字段配置
              </div>
              
              {/* 表单字段配置 */}
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '0 0 8px 8px', border: '1px solid #e5e7eb' }}>
              
              <div style={{ marginBottom: '16px' }}>
                {formData.form_config.map((field, index) => (
                  <div key={field.id} style={{ 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '6px', 
                    padding: '12px',
                    marginBottom: '12px',
                    backgroundColor: 'white'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ ...styles.label, fontSize: '12px' }}>显示标签</label>
                        <input
                          style={{ ...styles.input, marginBottom: '0', fontSize: '12px', padding: '6px 8px' }}
                          value={field.label}
                          onChange={(e) => {
                            const newFields = [...formData.form_config];
                            newFields[index] = { ...field, label: e.target.value };
                            setFormData(prev => ({ ...prev, form_config: newFields }));
                          }}
                          placeholder="显示标签"
                        />
                      </div>
                      <div>
                        <label style={{ ...styles.label, fontSize: '12px' }}>字段类型</label>
                        <select
                          style={{ ...styles.select, marginBottom: '0', fontSize: '12px', padding: '6px 8px' }}
                          value={field.type}
                          onChange={(e) => {
                            const newFields = [...formData.form_config];
                            newFields[index] = { ...field, type: e.target.value as any };
                            setFormData(prev => ({ ...prev, form_config: newFields }));
                          }}
                        >
                          <option value="text">文本</option>
                          <option value="tel">手机号</option>
                          <option value="email">邮箱</option>
                          <option value="link">链接</option>
                          <option value="textarea">多行文本</option>
                          <option value="number">数字</option>
                          <option value="qrcode">二维码</option>
                          <option value="select">下拉选择</option>
                        </select>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', alignItems: 'end' }}>
                      <div>
                        <label style={{ ...styles.label, fontSize: '12px' }}>占位符</label>
                        <input
                          style={{ ...styles.input, marginBottom: '0', fontSize: '12px', padding: '6px 8px' }}
                          value={field.placeholder || ''}
                          onChange={(e) => {
                            const newFields = [...formData.form_config];
                            newFields[index] = { ...field, placeholder: e.target.value };
                            setFormData(prev => ({ ...prev, form_config: newFields }));
                          }}
                          placeholder="输入占位符文本"
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => {
                              const newFields = [...formData.form_config];
                              newFields[index] = { ...field, required: e.target.checked };
                              setFormData(prev => ({ ...prev, form_config: newFields }));
                            }}
                          />
                          必填
                        </label>
                        <button
                          style={{ 
                            ...styles.buttonSecondary, 
                            padding: '4px 8px', 
                            fontSize: '12px',
                            backgroundColor: '#ef4444'
                          }}
                          onClick={() => {
                            const newFields = formData.form_config.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, form_config: newFields }));
                          }}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  style={{ ...styles.button, padding: '8px 16px', fontSize: '12px' }}
                  onClick={() => {
                    const newField = {
                      id: `field_${Date.now()}`,
                      label: '新字段',
                      type: 'text' as const,
                      placeholder: '请输入内容',
                      required: false,
                      order: formData.form_config.length + 1
                    };
                    setFormData(prev => ({
                      ...prev,
                      form_config: [...prev.form_config, newField]
                    }));
                  }}
                >
                  + 添加字段
                </button>
              </div>
              </div>
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

export default WorkingProductsPage; 