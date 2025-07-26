import { useState, useEffect } from "react";

const DirectTest = () => {
  const [message, setMessage] = useState("页面加载中...");

  useEffect(() => {
    // 简单的延迟测试
    const timer = setTimeout(() => {
      setMessage("页面加载成功！这是一个完全独立的测试页面。");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">直接测试页面</h1>
        
        <div className="text-center mb-6">
          <p className="text-gray-700">{message}</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            返回首页
          </button>
          
          <button 
            onClick={() => window.location.href = '/simple-test'}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            前往简单测试页面
          </button>
          
          <button 
            onClick={() => window.location.href = '/login'}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            前往登录页面
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500 text-center">
          <p>如果这个页面能正常显示，说明基础React组件没有问题。</p>
          <p>问题可能出现在认证相关的组件中。</p>
        </div>
      </div>
    </div>
  );
};

export default DirectTest; 