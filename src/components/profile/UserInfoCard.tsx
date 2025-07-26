interface UserProfile {
  id: string;
  username: string | null;
  email?: string;
  balance?: number;
  frozen_balance?: number;
}

interface UserInfoCardProps {
  profile: UserProfile;
  isLoading: boolean;
}

export const UserInfoCard = ({ profile, isLoading }: UserInfoCardProps) => {
  // 默认头像路径
  const defaultAvatarUrl = "/lovable-uploads/53ea3d2f-9764-48f1-b799-f718bcb1fac1.png";

  return (
    <div className="mx-5">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          {/* 头像 */}
          <div className="relative">
            <img
              src={defaultAvatarUrl}
              alt="用户头像"
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => {
                // 如果图片加载失败，显示默认头像
                e.currentTarget.src = defaultAvatarUrl;
              }}
            />
          </div>
          
          {/* 用户基本信息 */}
          <div className="flex-1">
            <div className="text-lg font-semibold text-gray-800 mb-1">
              {isLoading ? '加载中...' : (profile.username || '未设置用户名')}
            </div>
            <div className="text-sm text-gray-600">
              {isLoading ? '加载中...' : (profile.email || '未设置邮箱')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 