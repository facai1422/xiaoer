import { getAdminSession } from "@/utils/adminAuth";

export const SidebarHeader = () => {
  const adminSession = getAdminSession();
  
  return (
    <div className="flex items-center space-x-4 neu-fade-in">
      {/* 头像容器 - 新拟态风格 */}
      <div className="neu-card p-2 rounded-full neu-float">
        <div className="neu-primary w-12 h-12 rounded-full flex items-center justify-center">
          <img 
            src="/lovable-uploads/0304910d-dfec-4ec2-8262-c3baa22576ab.png" 
            alt="Admin Avatar" 
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
      </div>
      
      {/* 用户信息 */}
      <div className="flex-1">
        <div className="text-lg font-bold neu-text-primary neu-bounce">
          {adminSession?.display_name || 'Admin'}
        </div>
        <div className="text-sm neu-text-secondary font-medium">
          {adminSession?.role === 'admin' ? '系统管理员' : '管理员'}
        </div>
        <div className="text-xs neu-text-muted mt-1">
          {adminSession?.email || 'admin@example.com'}
        </div>
      </div>
      
      {/* 状态指示器 */}
      <div className="neu-success w-3 h-3 rounded-full neu-pulse"></div>
    </div>
  );
};
