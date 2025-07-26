export const ServiceGrid = () => {
  return (
    <div className="grid grid-cols-4 gap-2 bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 bg-white/20 rounded-xl mb-1 flex items-center justify-center">
          <img alt="话费充值" className="w-12 h-12 object-cover" src="/lovable-uploads/b8e03fb2-d9dc-466e-b842-3965e865afc1.png" />
        </div>
        <span className="text-white text-xs">话费充值</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 bg-white/20 rounded-xl mb-1 flex items-center justify-center">
          <img alt="电费充值" className="w-12 h-12 object-contain" src="/lovable-uploads/33633912-8804-4b00-b43e-424c9174b630.png" />
        </div>
        <span className="text-white text-xs">电费充值</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 bg-white/20 rounded-xl mb-1 flex items-center justify-center overflow-hidden">
          <img alt="抖币充值" className="w-12 h-12 rounded-2xl" src="/lovable-uploads/ddd73dcc-6f46-4f9e-bf3b-58a757ed4fe4.png" />
        </div>
        <span className="text-white text-xs">抖币充值</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 bg-[#222222] rounded-xl mb-1 flex items-center justify-center">
          <img alt="花呗代还" className="w-12 h-12 object-contain" src="/lovable-uploads/f8d89e3a-a50e-4c45-8c8c-a74bdae463d4.png" />
        </div>
        <span className="text-white text-xs">花呗代还</span>
      </div>
    </div>
  );
};