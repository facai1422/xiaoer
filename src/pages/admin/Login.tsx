import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 数据库中的管理员账户配置
  const adminAccounts = [
    {
      id: '4647404c-a719-48db-9c35-9616547471ce',
      email: 'it@haixin.org',
      role: 'super_admin',
      permissions: { all: true, finance: true, orders: true, users: true },
      validPasswords: ['admin123', '123456']
    },
    {
      id: '2c779284-3eb9-4816-964d-ca8fa517116e',
      email: 'admin@haixin.org',
      role: 'super_admin',
      permissions: { all: true, finance: true, orders: true, users: true },
      validPasswords: ['admin123', '123456']
    },
    {
      id: '0f095c67-d663-4e4b-870d-8386172bfd68',
      email: 'finance@haixin.org',
      role: 'finance_admin',
      permissions: { finance: true, orders: true },
      validPasswords: ['finance123', '123456']
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 查找匹配的管理员账户
      const admin = adminAccounts.find(account => account.email === email);
      
      if (!admin) {
        setError('邮箱或密码错误');
        return;
      }

      // 验证密码
      const isPasswordValid = admin.validPasswords.includes(password);
      
      if (!isPasswordValid) {
        setError('邮箱或密码错误');
        return;
      }

      // 登录成功，保存管理员信息到 sessionStorage
      const adminInfo = {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        loginTime: new Date().toISOString()
      };
      
      sessionStorage.setItem('adminSession', JSON.stringify(adminInfo));
      
      // 跳转到管理后台
      navigate('/admin/dashboard');
      
    } catch (err: unknown) {
      console.error('登录错误:', err);
      const errorMessage = err instanceof Error ? err.message : '登录过程中发生错误，请重试';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      background: `
        linear-gradient(45deg, rgb(0, 0, 0) 25%, transparent 25%, transparent 75%, rgb(0, 0, 0) 75%, rgb(0, 0, 0)),
        linear-gradient(45deg, rgb(0, 0, 0) 25%, white 25%, white 75%, rgb(0, 0, 0) 75%, rgb(0, 0, 0))
      `,
      backgroundSize: '60px 60px',
      backgroundPosition: '0 0, 30px 30px',
      backgroundColor: 'white',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: 'inset 0px 0px 500px rgb(15, 15, 15)',
    }}>
      
      {/* 3D 地面效果 */}
      <div style={{
        content: '""',
        width: '100%',
        height: '150%',
        boxShadow: '0px -100px 500px black, inset 0px 100px 500px rgb(15, 15, 15)',
        position: 'absolute',
        top: '55%',
        background: `
          linear-gradient(45deg, rgb(0, 0, 0) 25%, transparent 25%, transparent 75%, rgb(0, 0, 0) 75%, rgb(0, 0, 0)),
          linear-gradient(45deg, rgb(0, 0, 0) 25%, white 25%, white 75%, rgb(0, 0, 0) 75%, rgb(0, 0, 0))
        `,
        backgroundSize: '60px 60px',
        backgroundPosition: '0 0, 30px 30px',
        transformOrigin: 'top',
        transform: 'rotateX(80deg)',
        zIndex: 1,
      }} />

      {/* 登录表单 */}
      <div style={{
        maxWidth: '400px',
        width: '100%',
        background: 'linear-gradient(0deg, rgb(255, 255, 255) 0%, rgb(244, 247, 251) 100%)',
        borderRadius: '40px',
        padding: '30px 40px',
        border: '5px solid rgb(255, 255, 255)',
        boxShadow: 'rgba(133, 189, 215, 0.88) 0px 30px 30px -20px',
        position: 'relative',
        zIndex: 1000,
        transform: 'translateZ(100px)',
      }}>
        <h1 style={{
          textAlign: 'center',
          fontWeight: 900,
          fontSize: '30px',
          color: 'rgb(16, 137, 211)',
          marginBottom: '20px',
          margin: '0 0 20px 0',
        }}>
          管理员登录
        </h1>
        
        <form onSubmit={handleLogin} style={{ marginTop: '20px' }}>
          <input
            style={{
              width: '100%',
              background: 'white',
              border: 'none',
              padding: '15px 20px',
              borderRadius: '20px',
              marginTop: '15px',
              boxShadow: '#cff0ff 0px 10px 10px -5px',
              borderInline: '2px solid transparent',
              boxSizing: 'border-box',
              fontSize: '16px',
              outline: 'none',
            }}
            type="email"
            placeholder="管理员邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            onFocus={(e) => e.target.style.borderInline = '2px solid #12b1d1'}
            onBlur={(e) => e.target.style.borderInline = '2px solid transparent'}
          />
          
          <input
            style={{
              width: '100%',
              background: 'white',
              border: 'none',
              padding: '15px 20px',
              borderRadius: '20px',
              marginTop: '15px',
              boxShadow: '#cff0ff 0px 10px 10px -5px',
              borderInline: '2px solid transparent',
              boxSizing: 'border-box',
              fontSize: '16px',
              outline: 'none',
            }}
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            onFocus={(e) => e.target.style.borderInline = '2px solid #12b1d1'}
            onBlur={(e) => e.target.style.borderInline = '2px solid transparent'}
          />
          
          {error && (
            <div style={{
              color: '#ff4444',
              textAlign: 'center',
              margin: '15px 0',
              fontSize: '14px',
              background: 'rgba(255, 68, 68, 0.1)',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 68, 68, 0.2)',
            }}>
              {error}
            </div>
          )}
          
          <button 
            style={{
              display: 'block',
              width: '100%',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, rgb(16, 137, 211) 0%, rgb(18, 177, 209) 100%)',
              color: 'white',
              paddingBlock: '15px',
              margin: '20px auto',
              borderRadius: '20px',
              boxShadow: 'rgba(133, 189, 215, 0.88) 0px 20px 10px -15px',
              border: 'none',
              transition: 'all 0.2s ease-in-out',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              opacity: loading ? 0.6 : 1,
              transform: 'scale(1)',
            }}
            type="submit" 
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'scale(1.03)';
                e.target.style.boxShadow = 'rgba(133, 189, 215, 0.88) 0px 23px 10px -20px';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'rgba(133, 189, 215, 0.88) 0px 20px 10px -15px';
              }
            }}
            onMouseDown={(e) => {
              if (!loading) {
                e.target.style.transform = 'scale(0.95)';
                e.target.style.boxShadow = 'rgba(133, 189, 215, 0.88) 0px 15px 10px -10px';
              }
            }}
            onMouseUp={(e) => {
              if (!loading) {
                e.target.style.transform = 'scale(1.03)';
                e.target.style.boxShadow = 'rgba(133, 189, 215, 0.88) 0px 23px 10px -20px';
              }
            }}
          >
            {loading ? '登录中...' : '立即登录'}
          </button>
        </form>
        
        <div style={{
          display: 'block',
          textAlign: 'center',
          marginTop: '15px',
        }}>
          <a href="#" style={{
            textDecoration: 'none',
            color: '#0099ff',
            fontSize: '12px',
          }}>
            如需帮助，请联系系统管理员
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
