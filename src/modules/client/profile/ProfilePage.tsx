import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { ProfileHeader } from "./components/ProfileHeader";
import { BalanceStats } from "./components/OrderStats";
import { TransactionCenter } from "./components/TransactionCenter";
import BottomNav from "@/components/BottomNav";

interface ProfileData {
  username: string | null;
  id: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, username')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          toast.error("获取用户资料失败");
          return;
        }

        if (data) {
          setProfile({
            id: data.id,
            username: data.username || session.user.email?.split('@')[0] || null
          });
        } else {
          // Set default profile if no data is found
          setProfile({
            id: session.user.id,
            username: session.user.email?.split('@')[0] || null
          });
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error("加载用户资料失败");
      }
    };

    loadProfile();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#4F67FF] pb-20">
      {/* Page Title */}
      <div className="p-4 text-white text-xl font-medium">
        个人中心
      </div>

      <ProfileHeader 
        profile={profile}
        onSettingsClick={() => navigate('/settings')}
      />
      <BalanceStats onNavigate={navigate} />
      <TransactionCenter onNavigate={navigate} />
      <BottomNav />
    </div>
  );
};

export default ProfilePage;
