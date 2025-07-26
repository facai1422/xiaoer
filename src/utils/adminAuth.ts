// 管理员Session接口
export interface AdminSession {
  id: string;
  email: string;
  role: string;
  permissions: Record<string, boolean>;
  loginTime: string;
}

// 获取管理员Session
export const getAdminSession = (): AdminSession | null => {
  try {
    const sessionData = sessionStorage.getItem('adminSession');
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData) as AdminSession;
    
    // 检查session是否过期（24小时）
    const loginTime = new Date(session.loginTime);
    const now = new Date();
    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      sessionStorage.removeItem('adminSession');
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('获取管理员session失败:', error);
    return null;
  }
};

// 设置管理员Session
export const setAdminSession = (sessionData: AdminSession): void => {
  try {
    sessionStorage.setItem('adminSession', JSON.stringify(sessionData));
  } catch (error) {
    console.error('设置管理员session失败:', error);
  }
};

// 清除管理员Session
export const clearAdminSession = (): void => {
  try {
    sessionStorage.removeItem('adminSession');
  } catch (error) {
    console.error('清除管理员session失败:', error);
  }
};

// 验证管理员权限
export const validateAdminAccess = (): boolean => {
  const session = getAdminSession();
  return session !== null;
};

// 获取当前管理员信息
export const getCurrentAdmin = (): AdminSession | null => {
  return getAdminSession();
};

// 检查特定权限
export const hasPermission = (permission: string): boolean => {
  const session = getAdminSession();
  if (!session) return false;
  
  // 超级管理员拥有所有权限
  if (session.role === 'super_admin' || session.permissions.all) {
    return true;
  }
  
  return session.permissions[permission] === true;
};

// 检查是否为超级管理员
export const isSuperAdmin = (): boolean => {
  const session = getAdminSession();
  return session?.role === 'super_admin' || session?.permissions.all === true;
};

// 管理员登出
export const adminLogout = (): void => {
  clearAdminSession();
};

// 刷新管理员会话
export const refreshAdminSession = (): boolean => {
  const session = getAdminSession();
  if (!session) return false;
  
  try {
    session.loginTime = new Date().toISOString();
    setAdminSession(session);
    return true;
  } catch (error) {
    console.error('刷新管理员会话失败:', error);
    return false;
  }
};

 