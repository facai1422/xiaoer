import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getAdminSession } from "@/utils/adminAuth";
import { 
  Palette,
  Monitor,
  Sun,
  Moon,
  Eye,
  Save,
  RotateCcw,
  Paintbrush,
  Settings,
  Image,
  Type,
  Layout,
  Zap
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 主题配置类型定义
interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  primary_color: string;
  secondary_color: string;
  background_type: 'gradient' | 'solid' | 'image';
  background_value: string;
  font_family: string;
  font_size: 'small' | 'medium' | 'large';
  border_radius: 'sharp' | 'rounded' | 'full';
  shadow_intensity: 'none' | 'light' | 'medium' | 'heavy';
  animation_speed: 'slow' | 'normal' | 'fast';
  custom_css?: string;
  preview_image?: string;
  created_at: string;
  updated_at: string;
}

const ThemePage = () => {
  const { toast } = useToast();
  const [themes, setThemes] = useState<ThemeConfig[]>([]);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig | null>(null);

  // 主题编辑表单状态
  const [themeForm, setThemeForm] = useState({
    name: '',
    description: '',
    primary_color: '#3b82f6',
    secondary_color: '#10b981',
    background_type: 'gradient' as 'gradient' | 'solid' | 'image',
    background_value: 'linear-gradient(145deg, #ffffff, #f8fafc)',
    font_family: 'Inter',
    font_size: 'medium' as 'small' | 'medium' | 'large',
    border_radius: 'rounded' as 'sharp' | 'rounded' | 'full',
    shadow_intensity: 'medium' as 'none' | 'light' | 'medium' | 'heavy',
    animation_speed: 'normal' as 'slow' | 'normal' | 'fast',
    custom_css: ''
  });

  // 预设主题配色
  const presetColors = [
    { name: '默认蓝', primary: '#3b82f6', secondary: '#10b981' },
    { name: '紫色', primary: '#8b5cf6', secondary: '#06b6d4' },
    { name: '绿色', primary: '#10b981', secondary: '#f59e0b' },
    { name: '橙色', primary: '#f59e0b', secondary: '#ef4444' },
    { name: '粉色', primary: '#ec4899', secondary: '#8b5cf6' },
    { name: '青色', primary: '#06b6d4', secondary: '#10b981' }
  ];

  // 预设背景
  const presetBackgrounds = [
    { name: '新拟态白', value: 'linear-gradient(145deg, #ffffff, #f8fafc)' },
    { name: '深蓝渐变', value: 'linear-gradient(145deg, #1e3a8a, #3730a3)' },
    { name: '紫色渐变', value: 'linear-gradient(145deg, #581c87, #7c3aed)' },
    { name: '绿色渐变', value: 'linear-gradient(145deg, #064e3b, #059669)' },
    { name: '暖色渐变', value: 'linear-gradient(145deg, #92400e, #d97706)' },
    { name: '冷色渐变', value: 'linear-gradient(145deg, #164e63, #0891b2)' }
  ];

  // 字体选项
  const fontOptions = [
    { value: 'Inter', label: 'Inter (现代)' },
    { value: 'Microsoft YaHei', label: '微软雅黑 (中文)' },
    { value: 'PingFang SC', label: '苹方 (中文)' },
    { value: 'Roboto', label: 'Roboto (Google)' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro' }
  ];

  // 生成模拟主题数据
  const generateMockThemes = () => {
    const mockThemes: ThemeConfig[] = [
      {
        id: 'theme_1',
        name: '新拟态明亮',
        description: '现代新拟态设计风格，明亮清新',
        primary_color: '#3b82f6',
        secondary_color: '#10b981',
        background_type: 'gradient',
        background_value: 'linear-gradient(145deg, #ffffff, #f8fafc)',
        font_family: 'Inter',
        font_size: 'medium',
        border_radius: 'rounded',
        shadow_intensity: 'medium',
        animation_speed: 'normal',
        custom_css: '',
        preview_image: '/themes/neumorphism-light.jpg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'theme_2',
        name: '深色专业',
        description: '深色主题，适合长时间使用',
        primary_color: '#8b5cf6',
        secondary_color: '#06b6d4',
        background_type: 'gradient',
        background_value: 'linear-gradient(145deg, #1e293b, #334155)',
        font_family: 'Inter',
        font_size: 'medium',
        border_radius: 'rounded',
        shadow_intensity: 'heavy',
        animation_speed: 'normal',
        custom_css: '',
        preview_image: '/themes/dark-professional.jpg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'theme_3',
        name: '商务经典',
        description: '经典商务风格，稳重大气',
        primary_color: '#1f2937',
        secondary_color: '#059669',
        background_type: 'solid',
        background_value: '#f9fafb',
        font_family: 'Microsoft YaHei',
        font_size: 'medium',
        border_radius: 'sharp',
        shadow_intensity: 'light',
        animation_speed: 'slow',
        custom_css: '',
        preview_image: '/themes/business-classic.jpg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return mockThemes;
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      setIsLoading(true);
      
      const adminSession = getAdminSession();
      if (!adminSession) {
        toast({
          variant: "destructive",
          title: "权限错误",
          description: "请先登录管理员账户"
        });
        return;
      }
      
      // 模拟API调用
      setTimeout(() => {
        const mockThemes = generateMockThemes();
        setThemes(mockThemes);
        setCurrentTheme(mockThemes[0]); // 设置第一个为当前主题
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('获取主题数据异常:', error);
      toast({
        variant: "destructive",
        title: "系统错误",
        description: "获取主题数据时发生异常"
      });
      setIsLoading(false);
    }
  };

  // 应用主题
  const applyTheme = async (theme: ThemeConfig) => {
    try {
      // 这里应该调用API保存主题设置
      setCurrentTheme(theme);
      
      // 应用主题到页面
      document.documentElement.style.setProperty('--primary-color', theme.primary_color);
      document.documentElement.style.setProperty('--secondary-color', theme.secondary_color);
      document.documentElement.style.setProperty('--font-family', theme.font_family);
      
      toast({
        title: "主题已应用",
        description: `已切换到 ${theme.name} 主题`
      });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "应用失败",
        description: "请重试"
      });
    }
  };

  // 编辑主题
  const handleEdit = (theme: ThemeConfig) => {
    setSelectedTheme(theme);
    setThemeForm({
      name: theme.name,
      description: theme.description,
      primary_color: theme.primary_color,
      secondary_color: theme.secondary_color,
      background_type: theme.background_type,
      background_value: theme.background_value,
      font_family: theme.font_family,
      font_size: theme.font_size,
      border_radius: theme.border_radius,
      shadow_intensity: theme.shadow_intensity,
      animation_speed: theme.animation_speed,
      custom_css: theme.custom_css || ''
    });
    setIsEditOpen(true);
  };

  // 新增主题
  const handleAdd = () => {
    setSelectedTheme(null);
    setThemeForm({
      name: '',
      description: '',
      primary_color: '#3b82f6',
      secondary_color: '#10b981',
      background_type: 'gradient',
      background_value: 'linear-gradient(145deg, #ffffff, #f8fafc)',
      font_family: 'Inter',
      font_size: 'medium',
      border_radius: 'rounded',
      shadow_intensity: 'medium',
      animation_speed: 'normal',
      custom_css: ''
    });
    setIsEditOpen(true);
  };

  // 保存主题
  const handleSaveTheme = async () => {
    try {
      if (!themeForm.name) {
        toast({
          variant: "destructive",
          title: "请填写主题名称"
        });
        return;
      }

      // 这里应该调用API保存主题
      toast({
        title: "保存成功",
        description: `主题 ${themeForm.name} 已${selectedTheme ? '更新' : '创建'}`
      });
      
      setIsEditOpen(false);
      fetchThemes();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "保存失败",
        description: "请重试"
      });
    }
  };

  // 预览主题
  const handlePreview = (theme: ThemeConfig) => {
    setSelectedTheme(theme);
    setIsPreviewOpen(true);
  };

  // 重置主题
  const resetToDefault = () => {
    if (themes.length > 0) {
      applyTheme(themes[0]);
    }
  };

  // 应用预设颜色
  const applyPresetColor = (preset: { primary: string; secondary: string }) => {
    setThemeForm({
      ...themeForm,
      primary_color: preset.primary,
      secondary_color: preset.secondary
    });
  };

  // 应用预设背景
  const applyPresetBackground = (background: string) => {
    setThemeForm({
      ...themeForm,
      background_value: background
    });
  };

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center p-12 min-h-screen"
        style={{
          background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
        }}
      >
        <div className="text-center neu-container p-12">
          <div className="neu-card w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center neu-rotate">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
          <p className="text-xl neu-text-primary font-medium">加载主题数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4 neu-fade-in"
      style={{
        background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
      }}
    >
      <div className="max-w-full mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="neu-container p-8 neu-slide-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold neu-text-primary mb-3 neu-float">主题管理</h1>
              <p className="neu-text-muted text-lg">自定义界面主题和样式设置</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={resetToDefault}
                className="custom-button"
                style={{
                  cursor: 'pointer',
                  fontSize: 'medium',
                  fontFamily: 'inherit',
                  fontWeight: 'bold',
                  color: '#6b7280',
                  backgroundColor: '#f9fafb',
                  padding: '0.8em 2em',
                  borderRadius: '50em',
                  border: '4px solid #d1d5db',
                  boxShadow: '0px 6px #6b7280',
                  transition: 'all 0.1s ease'
                }}
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                重置默认
              </button>
              
              <button
                onClick={handleAdd}
                className="custom-button"
                style={{
                  cursor: 'pointer',
                  fontSize: 'medium',
                  fontFamily: 'inherit',
                  fontWeight: 'bold',
                  color: '#059669',
                  backgroundColor: '#f0fff4',
                  padding: '0.6em 1.8em',
                  borderRadius: '50em',
                  border: '4px solid #6ee7b7',
                  boxShadow: '0px 6px #059669',
                  transition: 'all 0.1s ease'
                }}
              >
                <Paintbrush className="h-5 w-5 mr-2" />
                新建主题
              </button>
            </div>
          </div>
        </div>

        {/* 当前主题卡片 */}
        {currentTheme && (
          <div className="neu-container p-8 neu-slide-in">
            <div className="neu-panel p-8">
              <h2 className="text-2xl font-bold neu-text-primary mb-6 flex items-center">
                <Zap className="h-8 w-8 text-blue-600 mr-3" />
                当前主题
              </h2>
              
              <div className="flex items-center space-x-8">
                <div className="neu-card p-6 rounded-2xl flex-1">
                  <div className="flex items-center space-x-6">
                    <div 
                      className="w-24 h-24 rounded-2xl flex items-center justify-center"
                      style={{
                        background: currentTheme.background_value,
                        border: `4px solid ${currentTheme.primary_color}20`
                      }}
                    >
                      <Palette 
                        className="h-12 w-12"
                        style={{ color: currentTheme.primary_color }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold neu-text-primary mb-2">{currentTheme.name}</h3>
                      <p className="neu-text-muted text-base mb-4">{currentTheme.description}</p>
                      
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm neu-text-muted">主色：</span>
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: currentTheme.primary_color }}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm neu-text-muted">辅色：</span>
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: currentTheme.secondary_color }}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Type className="h-5 w-5 neu-text-muted" />
                          <span className="text-sm neu-text-muted">{currentTheme.font_family}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => handleEdit(currentTheme)}
                    className="custom-button"
                    style={{
                      cursor: 'pointer',
                      fontSize: 'medium',
                      fontFamily: 'inherit',
                      fontWeight: 'bold',
                      color: '#0011ff',
                      backgroundColor: '#f8f8fd',
                      padding: '0.6em 1.5em',
                      borderRadius: '50em',
                      border: '4px solid #8b93f8',
                      boxShadow: '0px 6px #1f35ff',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    编辑
                  </button>
                  
                  <button
                    onClick={() => handlePreview(currentTheme)}
                    className="custom-button"
                    style={{
                      cursor: 'pointer',
                      fontSize: 'medium',
                      fontFamily: 'inherit',
                      fontWeight: 'bold',
                      color: '#7c3aed',
                      backgroundColor: '#f3e8ff',
                      padding: '0.6em 1.5em',
                      borderRadius: '50em',
                      border: '4px solid #a78bfa',
                      boxShadow: '0px 6px #7c3aed',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    预览
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 主题列表 */}
        <div className="neu-container neu-fade-in">
          <div className="neu-panel">
            <div className="mb-8">
              <h2 className="text-2xl font-bold neu-text-primary mb-3">可用主题</h2>
              <p className="neu-text-muted text-base">选择或自定义您喜欢的界面主题</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {themes.map((theme, index) => (
                <div 
                  key={theme.id}
                  className="neu-card neu-interactive p-6 rounded-2xl neu-slide-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* 主题预览 */}
                  <div 
                    className="w-full h-32 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: theme.background_value,
                      border: `3px solid ${theme.primary_color}30`
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Monitor 
                        className="h-16 w-16 opacity-30"
                        style={{ color: theme.primary_color }}
                      />
                    </div>
                    
                    {/* 小组件示例 */}
                    <div className="absolute top-2 left-2 right-2 bottom-2 grid grid-cols-2 gap-2">
                      <div 
                        className="rounded-lg opacity-60"
                        style={{ backgroundColor: theme.primary_color }}
                      />
                      <div 
                        className="rounded-lg opacity-40"
                        style={{ backgroundColor: theme.secondary_color }}
                      />
                      <div 
                        className="rounded-lg opacity-40"
                        style={{ backgroundColor: theme.secondary_color }}
                      />
                      <div 
                        className="rounded-lg opacity-60"
                        style={{ backgroundColor: theme.primary_color }}
                      />
                    </div>
                  </div>
                  
                  {/* 主题信息 */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold neu-text-primary mb-2 flex items-center">
                      {theme.name}
                      {currentTheme?.id === theme.id && (
                        <span 
                          className="ml-2 px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            color: theme.primary_color,
                            backgroundColor: `${theme.primary_color}20`
                          }}
                        >
                          当前
                        </span>
                      )}
                    </h3>
                    <p className="neu-text-muted text-sm mb-4">{theme.description}</p>
                    
                    {/* 主题属性 */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="neu-text-muted">字体:</span>
                        <span className="neu-text-primary font-medium">{theme.font_family}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="neu-text-muted">圆角:</span>
                        <span className="neu-text-primary font-medium">
                          {theme.border_radius === 'sharp' ? '直角' : 
                           theme.border_radius === 'rounded' ? '圆角' : '全圆'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="neu-text-muted">阴影:</span>
                        <span className="neu-text-primary font-medium">
                          {theme.shadow_intensity === 'none' ? '无' :
                           theme.shadow_intensity === 'light' ? '轻' :
                           theme.shadow_intensity === 'medium' ? '中' : '重'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex space-x-3">
                    {currentTheme?.id !== theme.id && (
                      <button
                        onClick={() => applyTheme(theme)}
                        className="flex-1 custom-button"
                        style={{
                          cursor: 'pointer',
                          fontSize: 'medium',
                          fontFamily: 'inherit',
                          fontWeight: 'bold',
                          color: theme.primary_color,
                          backgroundColor: `${theme.primary_color}10`,
                          padding: '0.6em 1em',
                          borderRadius: '50em',
                          border: `3px solid ${theme.primary_color}40`,
                          boxShadow: `0px 4px ${theme.primary_color}`,
                          transition: 'all 0.1s ease'
                        }}
                      >
                        应用
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleEdit(theme)}
                      className="custom-button"
                      title="编辑主题"
                      style={{
                        cursor: 'pointer',
                        fontSize: 'medium',
                        fontFamily: 'inherit',
                        fontWeight: 'bold',
                        color: '#6b7280',
                        backgroundColor: '#f9fafb',
                        padding: '0.6em 1em',
                        borderRadius: '50em',
                        border: '3px solid #d1d5db',
                        boxShadow: '0px 4px #6b7280',
                        transition: 'all 0.1s ease'
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handlePreview(theme)}
                      className="custom-button"
                      title="预览主题"
                      style={{
                        cursor: 'pointer',
                        fontSize: 'medium',
                        fontFamily: 'inherit',
                        fontWeight: 'bold',
                        color: '#7c3aed',
                        backgroundColor: '#f3e8ff',
                        padding: '0.6em 1em',
                        borderRadius: '50em',
                        border: '3px solid #a78bfa',
                        boxShadow: '0px 4px #7c3aed',
                        transition: 'all 0.1s ease'
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 主题编辑弹窗 */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent 
          className="max-w-4xl neu-card border-0 dialog-content-fixed"
        >
          <DialogHeader>
            <DialogTitle className="neu-text-primary">
              {selectedTheme ? '编辑主题' : '新建主题'}
            </DialogTitle>
            <DialogDescription className="neu-text-muted">
              自定义主题的各项设置
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-8 max-h-96 overflow-y-auto">
            {/* 基础设置 */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium neu-text-primary mb-2">主题名称</label>
                <input
                  type="text"
                  value={themeForm.name}
                  onChange={(e) => setThemeForm({...themeForm, name: e.target.value})}
                  className="neu-input w-full px-4 py-3 neu-text-primary text-base"
                  placeholder="请输入主题名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium neu-text-primary mb-2">主题描述</label>
                <textarea
                  value={themeForm.description}
                  onChange={(e) => setThemeForm({...themeForm, description: e.target.value})}
                  className="neu-input w-full px-4 py-3 neu-text-primary text-base"
                  placeholder="请输入主题描述"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium neu-text-primary mb-3">颜色配置</label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-xs neu-text-muted mb-1">主色调</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={themeForm.primary_color}
                          onChange={(e) => setThemeForm({...themeForm, primary_color: e.target.value})}
                          className="w-12 h-10 rounded-lg border-2 border-gray-300"
                          title="选择主色调"
                        />
                        <input
                          type="text"
                          value={themeForm.primary_color}
                          onChange={(e) => setThemeForm({...themeForm, primary_color: e.target.value})}
                          className="neu-input flex-1 px-3 py-2 text-sm"
                          title="主色调颜色值"
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <label className="block text-xs neu-text-muted mb-1">辅助色</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={themeForm.secondary_color}
                          onChange={(e) => setThemeForm({...themeForm, secondary_color: e.target.value})}
                          className="w-12 h-10 rounded-lg border-2 border-gray-300"
                          title="选择辅助色"
                        />
                        <input
                          type="text"
                          value={themeForm.secondary_color}
                          onChange={(e) => setThemeForm({...themeForm, secondary_color: e.target.value})}
                          className="neu-input flex-1 px-3 py-2 text-sm"
                          title="辅助色颜色值"
                          placeholder="#10b981"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* 预设颜色 */}
                  <div>
                    <label className="block text-xs neu-text-muted mb-2">预设配色</label>
                    <div className="grid grid-cols-3 gap-2">
                      {presetColors.map((preset, index) => (
                        <button
                          key={index}
                          onClick={() => applyPresetColor(preset)}
                          className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex space-x-1">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: preset.secondary }}
                            />
                          </div>
                          <span className="text-xs neu-text-primary">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium neu-text-primary mb-2">字体</label>
                  <Select value={themeForm.font_family} onValueChange={(value) => setThemeForm({...themeForm, font_family: value})}>
                    <SelectTrigger className="neu-input w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium neu-text-primary mb-2">字体大小</label>
                  <Select value={themeForm.font_size} onValueChange={(value: 'small' | 'medium' | 'large') => setThemeForm({...themeForm, font_size: value})}>
                    <SelectTrigger className="neu-input w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">小号</SelectItem>
                      <SelectItem value="medium">中号</SelectItem>
                      <SelectItem value="large">大号</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 样式设置 */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium neu-text-primary mb-3">背景设置</label>
                <div className="space-y-4">
                  <div>
                    <Select value={themeForm.background_type} onValueChange={(value: 'gradient' | 'solid' | 'image') => setThemeForm({...themeForm, background_type: value})}>
                      <SelectTrigger className="neu-input w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gradient">渐变</SelectItem>
                        <SelectItem value="solid">纯色</SelectItem>
                        <SelectItem value="image">图片</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <input
                    type="text"
                    value={themeForm.background_value}
                    onChange={(e) => setThemeForm({...themeForm, background_value: e.target.value})}
                    className="neu-input w-full px-4 py-3 neu-text-primary text-sm"
                    placeholder="背景值 (CSS格式)"
                  />
                  
                  {/* 预设背景 */}
                  <div>
                    <label className="block text-xs neu-text-muted mb-2">预设背景</label>
                    <div className="grid grid-cols-2 gap-2">
                      {presetBackgrounds.map((bg, index) => (
                        <button
                          key={index}
                          onClick={() => applyPresetBackground(bg.value)}
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div 
                            className="w-full h-8 rounded mb-1"
                            style={{ background: bg.value }}
                          />
                          <span className="text-xs neu-text-primary">{bg.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium neu-text-primary mb-2">圆角样式</label>
                  <Select value={themeForm.border_radius} onValueChange={(value: 'sharp' | 'rounded' | 'full') => setThemeForm({...themeForm, border_radius: value})}>
                    <SelectTrigger className="neu-input w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sharp">直角</SelectItem>
                      <SelectItem value="rounded">圆角</SelectItem>
                      <SelectItem value="full">全圆</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium neu-text-primary mb-2">阴影强度</label>
                  <Select value={themeForm.shadow_intensity} onValueChange={(value: 'none' | 'light' | 'medium' | 'heavy') => setThemeForm({...themeForm, shadow_intensity: value})}>
                    <SelectTrigger className="neu-input w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">无阴影</SelectItem>
                      <SelectItem value="light">轻阴影</SelectItem>
                      <SelectItem value="medium">中阴影</SelectItem>
                      <SelectItem value="heavy">重阴影</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium neu-text-primary mb-2">动画速度</label>
                <Select value={themeForm.animation_speed} onValueChange={(value: 'slow' | 'normal' | 'fast') => setThemeForm({...themeForm, animation_speed: value})}>
                  <SelectTrigger className="neu-input w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">慢速</SelectItem>
                    <SelectItem value="normal">正常</SelectItem>
                    <SelectItem value="fast">快速</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium neu-text-primary mb-2">自定义CSS</label>
                <textarea
                  value={themeForm.custom_css}
                  onChange={(e) => setThemeForm({...themeForm, custom_css: e.target.value})}
                  className="neu-input w-full px-4 py-3 neu-text-primary text-sm font-mono"
                  placeholder="/* 自定义CSS样式 */"
                  rows={4}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsEditOpen(false)} className="neu-button">
              取消
            </Button>
            <Button onClick={handleSaveTheme} className="neu-button neu-primary">
              <Save className="h-4 w-4 mr-2" />
              保存主题
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 主题预览弹窗 */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent 
          className="max-w-3xl neu-card border-0 dialog-content-fixed"
        >
          <DialogHeader>
            <DialogTitle className="neu-text-primary">
              主题预览 - {selectedTheme?.name}
            </DialogTitle>
            <DialogDescription className="neu-text-muted">
              预览主题效果
            </DialogDescription>
          </DialogHeader>
          
          {selectedTheme && (
            <div className="space-y-6">
              {/* 预览区域 */}
              <div 
                className="w-full h-64 rounded-xl p-6 relative overflow-hidden"
                style={{
                  background: selectedTheme.background_value,
                  fontFamily: selectedTheme.font_family
                }}
              >
                <div className="grid grid-cols-3 gap-4 h-full">
                  <div 
                    className="rounded-lg p-4 flex flex-col justify-center items-center text-white"
                    style={{ backgroundColor: selectedTheme.primary_color }}
                  >
                    <Layout className="h-8 w-8 mb-2" />
                    <span className="text-sm font-medium">主色调</span>
                  </div>
                  
                  <div 
                    className="rounded-lg p-4 flex flex-col justify-center items-center text-white"
                    style={{ backgroundColor: selectedTheme.secondary_color }}
                  >
                    <Paintbrush className="h-8 w-8 mb-2" />
                    <span className="text-sm font-medium">辅助色</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div 
                      className="h-8 rounded"
                      style={{ 
                        backgroundColor: `${selectedTheme.primary_color}20`,
                        border: `2px solid ${selectedTheme.primary_color}40`
                      }}
                    />
                    <div 
                      className="h-8 rounded"
                      style={{ 
                        backgroundColor: `${selectedTheme.secondary_color}20`,
                        border: `2px solid ${selectedTheme.secondary_color}40`
                      }}
                    />
                    <div 
                      className="h-8 rounded"
                      style={{ 
                        backgroundColor: `${selectedTheme.primary_color}20`,
                        border: `2px solid ${selectedTheme.primary_color}40`
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* 主题信息 */}
              <div className="neu-card p-6 rounded-xl">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold neu-text-primary mb-3">基础配置</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="neu-text-muted">字体:</span>
                        <span className="neu-text-primary">{selectedTheme.font_family}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="neu-text-muted">字体大小:</span>
                        <span className="neu-text-primary">
                          {selectedTheme.font_size === 'small' ? '小号' :
                           selectedTheme.font_size === 'medium' ? '中号' : '大号'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="neu-text-muted">背景类型:</span>
                        <span className="neu-text-primary">
                          {selectedTheme.background_type === 'gradient' ? '渐变' :
                           selectedTheme.background_type === 'solid' ? '纯色' : '图片'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold neu-text-primary mb-3">样式配置</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="neu-text-muted">圆角:</span>
                        <span className="neu-text-primary">
                          {selectedTheme.border_radius === 'sharp' ? '直角' :
                           selectedTheme.border_radius === 'rounded' ? '圆角' : '全圆'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="neu-text-muted">阴影:</span>
                        <span className="neu-text-primary">
                          {selectedTheme.shadow_intensity === 'none' ? '无' :
                           selectedTheme.shadow_intensity === 'light' ? '轻' :
                           selectedTheme.shadow_intensity === 'medium' ? '中' : '重'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="neu-text-muted">动画:</span>
                        <span className="neu-text-primary">
                          {selectedTheme.animation_speed === 'slow' ? '慢速' :
                           selectedTheme.animation_speed === 'normal' ? '正常' : '快速'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsPreviewOpen(false)} className="neu-button">
              关闭
            </Button>
            {selectedTheme && currentTheme?.id !== selectedTheme.id && (
              <Button 
                onClick={() => {
                  applyTheme(selectedTheme);
                  setIsPreviewOpen(false);
                }}
                className="neu-button neu-primary"
              >
                应用此主题
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThemePage; 