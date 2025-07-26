import { useEffect } from "react";

const DirectLogin = () => {
  useEffect(() => {
    console.log('🔄 直接跳转到登录页面，不做任何检查');
    // 立即跳转，不等待任何异步操作
    window.location.href = '/login-simple';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-500">正在跳转...</p>
      </div>
    </div>
  );
};

export default DirectLogin; 