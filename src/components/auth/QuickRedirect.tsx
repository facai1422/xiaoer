import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Dashboard from "@/pages/Dashboard";

export const QuickRedirect = () => {
  useEffect(() => {
    console.log('⚡ 快速认证重定向...');
  }, []);

  // 简化认证逻辑：尝试获取会话
  const checkAuthAndRedirect = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('✅ 检测到用户会话，显示首页');
        return true; // 已登录
      } else {
        console.log('❌ 未检测到用户会话，重定向到登录页');
        return false; // 未登录
      }
    } catch (error) {
      console.error('❌ 认证检查失败:', error);
      return false; // 出错默认未登录
    }
  };

  // 执行检查（同步方式）
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  
  useEffect(() => {
    // 超时保护：1秒后强制跳转到登录页
    const timeoutId = setTimeout(() => {
      console.log('⚠️ 快速认证超时，强制跳转到登录页');
      setHasSession(false);
    }, 1000);
    
    checkAuthAndRedirect().then((result) => {
      clearTimeout(timeoutId);
      setHasSession(result);
    });
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // 如果还在检查，显示简单加载
  if (hasSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  // 根据会话状态决定显示内容
  if (hasSession) {
    return <Dashboard />;
  } else {
    return <Navigate to="/login" replace />;
  }
}; 