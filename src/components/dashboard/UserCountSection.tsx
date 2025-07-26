
import { OnlineUserCount } from "@/components/home/OnlineUserCount";
import { WebsiteAnnouncements } from "@/components/home/WebsiteAnnouncements";

export const UserCountSection = () => {
  return (
    <div className="space-y-2">
      <OnlineUserCount />
      <WebsiteAnnouncements />
    </div>
  );
};
