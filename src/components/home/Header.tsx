
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export const Header = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="bg-white py-2 px-4 flex items-center shadow-sm">
      <h1 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold flex-1 text-center`}>首页</h1>
    </div>
  );
};
