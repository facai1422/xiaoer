import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const USDTBalanceCard = () => {
  const [showBalance, setShowBalance] = useState(true);
  const navigate = useNavigate();

  // 临时使用固定值进行测试
  const balance = 1234.56;

  const handleViewClick = () => {
    navigate('/wallet');
  };

  return (
    <div className="px-4 pt-4 pb-4">
      {/* 添加明显的测试标识 */}
      <div className="text-center mb-2">
        <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
          🎯 新的USDT余额卡片 - 测试版本
        </span>
      </div>
      
      <Card className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 border-4 border-yellow-400 shadow-2xl">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-indigo-800/20"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 animate-pulse"></div>
        
        <div className="relative p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-lg font-bold text-yellow-900">T</span>
              </div>
              <span className="text-white font-bold text-xl">USDT 余额</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="text-white hover:text-yellow-400 hover:bg-white/20 p-3 border-2 border-white/30"
              >
                {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <div className="mb-8 text-center">
            <div className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
              {showBalance ? balance.toFixed(2) : '****'}
            </div>
            <div className="text-white/90 text-lg font-medium">
              可用余额 (USDT)
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleViewClick}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-3 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              💰 查看钱包
            </Button>
          </div>
        </div>
      </Card>
      
      {/* 底部提示 */}
      <div className="text-center mt-2">
        <span className="bg-green-500 text-white px-3 py-1 rounded text-xs">
          ✅ 如果您看到这个卡片，说明修改成功了！
        </span>
      </div>
    </div>
  );
}; 