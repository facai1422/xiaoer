
import { Settings } from "lucide-react";

interface ProfileHeaderProps {
  profile: { username: string; id: string; } | null;
  onSettingsClick: () => void;
}

export const ProfileHeader = ({ profile, onSettingsClick }: ProfileHeaderProps) => {
  return (
    <div className="bg-white rounded-lg mx-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <div className="text-lg font-medium">用户</div>
            <div className="text-sm text-gray-500">ID: {profile?.username || 'loading...'}</div>
          </div>
        </div>
        <Settings className="w-6 h-6 text-gray-400 cursor-pointer" onClick={onSettingsClick} />
      </div>
    </div>
  );
};
