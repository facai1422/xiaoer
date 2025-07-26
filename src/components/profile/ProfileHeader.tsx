
import { Settings } from "lucide-react";

interface ProfileData {
  username: string | null;
  id: string;
  email?: string;
}

interface ProfileHeaderProps {
  profile: ProfileData | null;
  onSettingsClick: () => void;
}

export const ProfileHeader = ({ profile, onSettingsClick }: ProfileHeaderProps) => {
  // 获取邮箱账号名（@前的部分）
  const getDisplayName = (email: string | undefined) => {
    if (!email) return '';
    return email.split('@')[0];
  };

  return (
    <div className="flex items-center justify-between p-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50 bg-white/20 flex items-center justify-center">
          <span className="text-white text-lg font-bold">
            {(profile?.username || profile?.email)?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <span className="text-xl text-white font-bold">
          {profile?.username || getDisplayName(profile?.email) || '未设置昵称'}
        </span>
      </div>
      <button 
        onClick={onSettingsClick} 
        className="text-white/80"
        title="设置"
        aria-label="打开设置"
      >
        <Settings className="w-6 h-6" />
      </button>
    </div>
  );
};
