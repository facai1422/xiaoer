const NoLoadingTest = () => {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">无加载测试页面</h1>
        <p className="text-gray-600 mb-6">这个页面应该立即显示，没有任何加载状态</p>
        
        <div className="space-y-4">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded"
          >
            返回首页
          </button>
          
          <button 
            onClick={() => window.location.href = '/login'}
            className="w-full bg-green-500 text-white py-2 px-4 rounded"
          >
            前往登录
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>如果你看到这个页面，说明没有加载状态干扰</p>
          <p>时间: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
};

export default NoLoadingTest; 