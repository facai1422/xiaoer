import { useState, useEffect, useRef } from "react";

interface OrderNotification {
  id: string;
  user: string;
  amount: number;
  type: string;
  timestamp: Date;
  status: 'pending' | 'success';
}

const generateRandomUser = () => {
  const prefixes = ['138', '139', '150', '151', '152', '158', '159', '182', '183', '184', '187', '188'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  const phone = prefix + suffix;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
};

const generateRandomAmount = () => {
  const amounts = [50, 100, 200, 300, 500, 1000, 1500, 2000];
  const weights = [30, 25, 20, 15, 8, 1.5, 0.3, 0.2];
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < amounts.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return amounts[i];
    }
  }
  
  return amounts[0];
};

const generateNewOrderNotification = (): OrderNotification => {
  const types = ['话费充值', '流量充值', '电费缴纳', '水费缴纳', '燃气缴费'];
  return {
    id: Math.random().toString(36).substr(2, 9),
    user: generateRandomUser(),
    amount: generateRandomAmount(),
    type: types[Math.floor(Math.random() * types.length)],
    timestamp: new Date(),
    status: 'pending'
  };
};

export const RechargeNotifications = () => {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMounted = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    
    // 初始化通知数据
    const initNotifications = () => {
      if (!isMounted.current) return;
      
      const initialNotifications: OrderNotification[] = [];
      for (let i = 0; i < 5; i++) {
        const notification = generateNewOrderNotification();
        // 随机设置一些为成功状态
        if (Math.random() > 0.7) {
          notification.status = 'success';
        }
        initialNotifications.push(notification);
      }
      
      if (isMounted.current) {
        setNotifications(initialNotifications);
        isInitialized.current = true;
      }
    };

    initNotifications();

    // 设置轮换显示定时器
    intervalRef.current = setInterval(() => {
      if (!isMounted.current) return;
      
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % 5;
        
        // 偶尔添加新通知
        if (Math.random() > 0.8) {
          setNotifications(prev => {
            const newNotification = generateNewOrderNotification();
            const updated = [...prev];
            updated[nextIndex] = newNotification;
            return updated;
          });
        }
        
        return nextIndex;
      });
    }, 6000); // 每6秒切换一次

    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (!isMounted.current || notifications.length === 0) {
    return null;
  }

  const activeNotification = notifications[currentIndex];
  if (!activeNotification) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mx-4 mb-4">
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          activeNotification.status === 'success' ? 'bg-green-500' : 'bg-orange-500'
        } animate-pulse`}></div>
        <div className="flex-1 text-sm">
          <span className="text-gray-600">用户 </span>
          <span className="font-medium text-blue-600">{activeNotification.user}</span>
          <span className="text-gray-600"> 成功</span>
          <span className="font-medium text-green-600">{activeNotification.type}</span>
          <span className="text-gray-600"> ¥</span>
          <span className="font-bold text-red-500">{activeNotification.amount}</span>
        </div>
        <div className="text-xs text-gray-400">
          {activeNotification.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
