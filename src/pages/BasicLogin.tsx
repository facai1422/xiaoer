import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const BasicLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 测试网络和 Supabase 连接
  const testConnection = async () => {
    setMessage("测试网络连接...");
    
    try {
      console.log('🌐 BasicLogin: 测试网络连接');
      
      // 1. 先测试基本网络连接
      setMessage("测试网络连接...");
      const networkResponse = await fetch('https://wjvuuckoasdukmnbrzxk.supabase.co/rest/v1/', {
        method: 'HEAD',
        headers: {
          'apikey': 'sb_publishable_hjn8uDvuadUNMrM1jg5HHQ_37sGt-pr'
        }
      });
      
      console.log('📡 网络连接测试结果:', { status: networkResponse.status, ok: networkResponse.ok });
      
      if (!networkResponse.ok) {
        setMessage(`网络连接失败: HTTP ${networkResponse.status}`);
        return;
      }
      
      // 2. 测试 Supabase Auth 连接
      setMessage("测试数据库连接...");
      console.log('🔌 BasicLogin: 测试 Supabase 连接');
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setMessage(`数据库连接失败: ${error.message}`);
        console.log('❌ BasicLogin: 连接测试失败', error);
      } else {
        setMessage("✅ 网络和数据库连接正常，可以开始登录");
        console.log('✅ BasicLogin: 连接测试成功', { hasSession: !!data.session });
      }
    } catch (error: any) {
      setMessage(`连接异常: ${error.message}`);
      console.error('❌ BasicLogin: 连接异常', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("开始登录...");

    try {
      console.log('🔐 BasicLogin: 开始登录请求', { email, password: '***' });
      setMessage("正在验证账号...");
      
      // 添加10秒超时保护
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('登录请求超时(10秒)')), 10000);
      });
      
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('⏰ BasicLogin: 等待登录响应...');
      setMessage("等待服务器响应...");
      
      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

      console.log('📡 BasicLogin: 登录请求完成', { 
        hasUser: !!data?.user, 
        hasError: !!error,
        errorMessage: error?.message
      });

      if (error) {
        setMessage(`登录失败: ${error.message}`);
        console.log('❌ BasicLogin: 登录错误', error);
        return;
      }

      if (data?.user) {
        setMessage(`登录成功! 用户ID: ${data.user.id}`);
        console.log('✅ BasicLogin: 登录成功', data.user.id);
        
        // 3秒后强制跳转
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 3000);
        return;
      }

      setMessage("未知错误：没有用户数据");
      
    } catch (error: any) {
      console.error('❌ BasicLogin: 登录异常', error);
      setMessage(`登录异常: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem' }}>
          极简登录测试
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>邮箱:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="请输入邮箱"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>密码:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="请输入密码"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={testConnection}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: isLoading ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              测试连接
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 2,
                padding: '0.75rem',
                backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </div>
        </form>
        
        {message && (
          <div style={{
            marginTop: '1rem',
            padding: '0.5rem',
            backgroundColor: message.includes('成功') ? '#dcfce7' : '#fef2f2',
            color: message.includes('成功') ? '#16a34a' : '#dc2626',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}>
            {message}
          </div>
        )}
        
        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
          <p><strong>使用说明:</strong></p>
          <p>1. 先点击"测试连接"确保网络正常</p>
          <p>2. 输入测试账号: vip@qq.com</p>
          <p>3. 检查浏览器Console查看详细日志</p>
          <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
            <p><strong>调试信息:</strong></p>
            <p>Supabase URL: https://wjvuuckoasdukmnbrzxk.supabase.co</p>
            <p>API Key: sb_publishable_hjn8uDvuadUNMrM1jg5HHQ_37sGt-pr</p>
            <p>客户端状态: {typeof supabase === 'object' ? '已初始化' : '未初始化'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicLogin; 