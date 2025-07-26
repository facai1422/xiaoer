import { useEffect } from "react";

export const DirectRedirect = () => {
  useEffect(() => {
    console.log('⚡ 直接重定向：使用window.location跳转到登录页面');
    
    // 使用window.location强制跳转，绕过React Router
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-500">正在跳转到登录页面...</p>
      </div>
    </div>
  );
}; 