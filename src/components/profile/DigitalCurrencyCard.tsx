
interface DigitalCurrencyCardProps {
  onNavigate: (path: string) => void;
}

export const DigitalCurrencyCard = ({ onNavigate }: DigitalCurrencyCardProps) => {
  return (
    <div className="mx-5 mt-5">
      <div className="bg-black rounded-xl p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30" />
          <div className="absolute bottom-0 left-0 right-0 h-32 opacity-30">
            <div className="absolute bottom-0 left-0 right-0 h-24 animate-[move-forever_12s_linear_infinite]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-full">
                <path fill="rgba(255,255,255,0.3)" fillOpacity="1" d="M0,128L48,144C96,160,192,192,288,192C384,192,480,160,576,144C672,128,768,128,864,144C960,160,1056,192,1152,176C1248,160,1344,96,1392,64L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-24 animate-[move-forever_8s_linear_infinite]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-full">
                <path fill="rgba(255,255,255,0.2)" fillOpacity="1" d="M0,96L48,122.7C96,149,192,203,288,208C384,213,480,171,576,138.7C672,107,768,85,864,90.7C960,96,1056,128,1152,138.7C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              </svg>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center relative z-10">
          <div className="text-white">
            <div className="text-2xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">₮</span>
              </div>
              USDT
            </div>
            <div className="text-sm opacity-80">在线数字货币交易平台</div>
          </div>
          <button 
            onClick={() => onNavigate('/trade')}
            className="px-4 py-1.5 border border-white/30 rounded-full text-white text-sm backdrop-blur-sm"
          >
            查看
          </button>
        </div>
      </div>
    </div>
  );
};
