
import { BannerCarousel } from "@/components/home/BannerCarousel";

interface BannerSectionProps {
  banners: Array<{
    id: number;
    image: string;
    alt: string;
  }>;
}

export const BannerSection: React.FC<BannerSectionProps> = ({ banners }) => {
  return <BannerCarousel banners={banners} />;
};
