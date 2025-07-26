
export const ServiceGrid = () => {
  return (
    <div className="grid grid-cols-4 gap-2 bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
      <ServiceItem
        image="/lovable-uploads/b8e03fb2-d9dc-466e-b842-3965e865afc1.png"
        title="话费充值"
      />
      <ServiceItem
        image="/lovable-uploads/33633912-8804-4b00-b43e-424c9174b630.png"
        title="电费充值"
      />
      <ServiceItem
        image="/lovable-uploads/ddd73dcc-6f46-4f9e-bf3b-58a757ed4fe4.png"
        title="抖币充值"
      />
      <ServiceItem
        image="/lovable-uploads/2fdcb339-8c11-4d5a-83e0-2a16f55fccaa.png"
        title="花呗代还"
        dark
      />
    </div>
  );
};

interface ServiceItemProps {
  image: string;
  title: string;
  dark?: boolean;
}

const ServiceItem = ({ image, title, dark = false }: ServiceItemProps) => {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-12 h-12 ${dark ? 'bg-[#222222]' : 'bg-white/20'} rounded-xl mb-1 flex items-center justify-center`}>
        <img alt={title} className="w-12 h-12 object-contain" src={image} />
      </div>
      <span className="text-white text-xs">{title}</span>
    </div>
  );
};
