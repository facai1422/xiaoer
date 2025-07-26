import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PasswordStrength {
  score: number;
  text: string;
  color: string;
}

const AdminPasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 获取当前登录的管理员信息
  const getCurrentAdmin = () => {
    const adminSession = sessionStorage.getItem('adminSession');
    if (!adminSession) return null;
    try {
      return JSON.parse(adminSession);
    } catch {
      return null;
    }
  };

  // 密码强度检查
  const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    const strengthMap = {
      0: { text: '太弱', color: 'text-red-500' },
      1: { text: '很弱', color: 'text-red-400' },
      2: { text: '一般', color: 'text-yellow-500' },
      3: { text: '较强', color: 'text-blue-500' },
      4: { text: '强', color: 'text-green-500' },
      5: { text: '很强', color: 'text-green-600' }
    };
    
    return { score, ...strengthMap[score as keyof typeof strengthMap] };
  };

  const passwordStrength = checkPasswordStrength(newPassword);

  // 处理密码修改
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentAdmin = getCurrentAdmin();
    if (!currentAdmin) {
      setMessage({ type: 'error', text: '请先登录管理员账户' });
      return;
    }

    // 表单验证
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: '请填写所有必填字段' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '新密码和确认密码不一致' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: '新密码长度至少为6位' });
      return;
    }

    if (currentPassword === newPassword) {
      setMessage({ type: 'error', text: '新密码不能与当前密码相同' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // 调用数据库函数更新密码
      const { data, error } = await supabase.rpc('admin_update_password', {
        admin_email: currentAdmin.email,
        old_password: currentPassword,
        new_password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }

      const result = data as { success: boolean; error?: string; message?: string };

      if (result.success) {
        setMessage({ type: 'success', text: result.message || '密码修改成功！' });
        // 清空表单
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // 3秒后跳转到登录页面重新登录
        setTimeout(() => {
          sessionStorage.removeItem('adminSession');
          window.location.href = '/admin/login';
        }, 3000);
      } else {
        setMessage({ type: 'error', text: result.error || '密码修改失败' });
      }
    } catch (error) {
      console.error('密码修改失败:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : '密码修改失败，请重试' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">修改管理员密码</h1>
          </div>
          <p className="text-gray-600">为了账户安全，请定期更新您的管理员密码</p>
        </div>

        {/* 安全提示卡片 */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800 mb-1">安全建议</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• 密码长度至少8位，包含大小写字母、数字和特殊字符</li>
                <li>• 不要使用容易猜测的个人信息作为密码</li>
                <li>• 定期更换密码，建议每3个月更换一次</li>
                <li>• 修改密码后需要重新登录</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 密码修改表单 */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Lock className="h-5 w-5" />
                密码修改
              </h2>
            </div>

            <form onSubmit={handlePasswordChange} className="p-6 space-y-6">
              {/* 当前密码 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  当前密码 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="请输入当前密码"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* 新密码 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新密码 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="请输入新密码"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* 密码强度指示器 */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">密码强度:</span>
                      <span className={`text-xs font-medium ${passwordStrength.color}`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.score <= 1 ? 'bg-red-500' :
                          passwordStrength.score <= 2 ? 'bg-yellow-500' :
                          passwordStrength.score <= 3 ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 确认新密码 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  确认新密码 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="请再次输入新密码"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* 密码匹配提示 */}
                {confirmPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    {newPassword === confirmPassword ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-600">密码匹配</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-600">密码不匹配</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* 错误/成功消息 */}
              {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${
                  message.type === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className={`text-sm ${
                    message.type === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {message.text}
                  </span>
                </div>
              )}

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    修改中...
                  </div>
                ) : (
                  '确认修改密码'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            修改密码后，您需要重新登录管理员账户
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPasswordPage; 