export const initializeApp = () => {
  // 检查当前路径
  const currentPath = window.location.pathname;
  console.log('应用启动 - 当前路径:', currentPath);
  
  // 如果是根路径但显示404，重定向到dashboard
  if (currentPath === '/' || currentPath === '/index.html') {
    const hasHash = window.location.hash;
    if (!hasHash) {
      console.log('重定向到dashboard');
      window.history.replaceState(null, '', '/dashboard');
    }
  }
  
  // 检查是否是无效路径
  const validPaths = [
    '/', '/dashboard', '/login', '/register', '/profile', '/orders', 
    '/wallet', '/withdraw', '/agent', '/support', '/admin'
  ];
  
  const isValidPath = validPaths.some(path => 
    currentPath === path || currentPath.startsWith(path + '/')
  );
  
  if (!isValidPath && !currentPath.includes('.')) {
    console.warn('检测到无效路径:', currentPath);
    // 不在这里重定向，让React Router处理
  }
  
  // 记录应用启动
  console.log('✅ 应用初始化完成');
  
  // 返回初始化信息
  return {
    currentPath,
    timestamp: new Date().toISOString()
  };
}; 