import { Navigate } from "react-router-dom";

export const SimpleRedirect = () => {
  console.log('⚡ 简单重定向：直接跳转到登录页面');
  return <Navigate to="/login" replace />;
}; 