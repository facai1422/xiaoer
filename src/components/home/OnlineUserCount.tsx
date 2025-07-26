import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const OnlineUserCount = () => {
  const [count, setCount] = useState<number>(
    Math.floor(Math.random() * (800 - 600 + 1)) + 600
  );
  
  useEffect(() => {
    // Update count every 3-7 seconds with a random fluctuation
    const interval = setInterval(() => {
      const fluctuation = Math.floor(Math.random() * 11) - 5; // -5 to +5
      setCount(prevCount => {
        const newCount = prevCount + fluctuation;
        // Keep count within 600-800 range
        if (newCount < 600) return 600;
        if (newCount > 800) return 800;
        return newCount;
      });
    }, Math.floor(Math.random() * (7000 - 3000 + 1)) + 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg shadow-sm">
      <Users className="h-5 w-5 text-blue-500 mr-2" />
      <div className="flex items-center">
        <span className="text-gray-700 font-medium">当前在线:</span>
        <div className="ml-2 flex">
          {count.toString().split('').map((digit, index) => (
            <div 
              key={index}
              className={cn(
                "w-7 h-8 flex items-center justify-center rounded bg-white text-blue-600 font-semibold mx-0.5 shadow-sm",
                "border border-blue-100"
              )}
            >
              {digit}
            </div>
          ))}
          <span className="ml-2 text-gray-700 font-medium">人</span>
        </div>
      </div>
    </div>
  );
};
