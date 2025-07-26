
import { ServiceList } from "@/components/home/ServiceList";

interface ServicesSectionProps {
  services: Array<{
    id: number;
    title: string;
    description: string;
    link: string;
  }>;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services }) => {
  return <ServiceList services={services} />;
};
