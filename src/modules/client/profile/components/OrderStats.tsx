interface BalanceStatsProps {
  onNavigate: (path: string) => void;
}

// USDT图标组件
const USDTIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32" className="inline-block mr-1">
    <linearGradient id="1K8zdyZZ7L5EmHP4ezXvXa_eOPSFz6cz9H9_gr1" x1="16" x2="16" y1="5.25" y2="27.432" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#66c4c4"></stop>
      <stop offset="1" stopColor="#009393"></stop>
    </linearGradient>
    <path fill="url(#1K8zdyZZ7L5EmHP4ezXvXa_eOPSFz6cz9H9_gr1)" fillRule="evenodd" d="M7.534,5.313h17.28c0.412,0,0.793,0.214,0.999,0.56	l5.034,8.486c0.261,0.44,0.183,0.996-0.189,1.352l-13.857,13.28c-0.449,0.43-1.171,0.43-1.62,0L1.342,15.73	c-0.381-0.365-0.452-0.937-0.172-1.38l5.381-8.504C6.761,5.515,7.133,5.313,7.534,5.313z" clipRule="evenodd"></path>
    <linearGradient id="1K8zdyZZ7L5EmHP4ezXvXb_eOPSFz6cz9H9_gr2" x1="16" x2="16" y1="5.313" y2="29.314" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopOpacity=".02"></stop>
      <stop offset="1" stopOpacity=".15"></stop>
    </linearGradient>
    <path fill="url(#1K8zdyZZ7L5EmHP4ezXvXb_eOPSFz6cz9H9_gr2)" d="M30.846,14.359l-5.034-8.486	c-0.206-0.347-0.587-0.56-0.999-0.56H7.534c-0.401,0-0.773,0.202-0.982,0.533L1.17,14.35c-0.28,0.443-0.209,1.015,0.172,1.38	l13.838,13.262c0.224,0.215,0.517,0.323,0.81,0.323c0.293,0,0.586-0.108,0.81-0.323l13.857-13.28	C31.03,15.355,31.107,14.799,30.846,14.359z M30.485,15.531l-13.857,13.28c-0.17,0.163-0.397,0.253-0.637,0.253	c-0.24,0-0.467-0.90-0.637-0.253L1.515,15.549c-0.296-0.284-0.351-0.722-0.134-1.065L6.763,5.98	c0.163-0.257,0.458-0.417,0.771-0.417h17.28c0.323,0,0.624,0.168,0.784,0.438l5.034,8.486	C30.833,14.826,30.772,15.256,30.485,15.531z"></path>
    <linearGradient id="1K8zdyZZ7L5EmHP4ezXvXc_eOPSFz6cz9H9_gr3" x1="16.025" x2="16.025" y1="8.539" y2="22.472" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopOpacity=".02"></stop>
      <stop offset="1" stopOpacity=".15"></stop>
    </linearGradient>
    <path fill="url(#1K8zdyZZ7L5EmHP4ezXvXc_eOPSFz6cz9H9_gr3)" d="M17.91,12.585V11.42h4.672	c0.138,0,0.25-0.112,0.25-0.25V8.789c0-0.138-0.112-0.25-0.25-0.25H9.469c-0.138,0-0.25,0.112-0.25,0.25v2.381	c0,0.138,0.112,0.25,0.25,0.25h4.673v1.165c-2.837,0.168-6.043,0.783-6.07,2.006v1.816c0.027,1.216,3.233,1.831,6.07,2v3.814	c0,0.138,0.112,0.25,0.25,0.25h3.269c0.138,0,0.25-0.112,0.25-0.25v-3.814c2.837-0.169,6.043-0.785,6.069-2.006v-1.815	C23.953,13.368,20.747,12.753,17.91,12.585z M16.025,16.677c-3.619,0-6.253-0.581-7.141-1.181c0.692-0.471,2.479-0.961,5.257-1.126	v1.464c0,0.133,0.104,0.243,0.237,0.25c1.057,0.055,2.235,0.055,3.294,0c0.133-0.007,0.237-0.117,0.237-0.25V14.37	c2.778,0.165,4.563,0.655,5.257,1.126C22.278,16.096,19.646,16.677,16.025,16.677z"></path>
    <path fill="#fff" fillRule="evenodd" d="M17.66,12.821V11.17h4.922V8.789H9.469v2.381h4.922v1.651	c-3.457,0.176-6.051,0.901-6.07,1.77l0,1.811c0.019,0.869,2.613,1.593,6.07,1.77v4.051h3.268V18.17	c3.457-0.176,6.051-0.901,6.07-1.77l0-1.811C23.711,13.722,21.117,12.997,17.66,12.821z M16.026,16.927	c-3.689,0-6.773-0.613-7.528-1.431c0.64-0.694,2.955-1.24,5.893-1.39v1.728c0.527,0.027,1.073,0.041,1.634,0.041	c0.561,0,1.108-0.014,1.634-0.041v-1.728c2.939,0.15,5.253,0.696,5.893,1.39C22.799,16.314,19.715,16.927,16.026,16.927z" clipRule="evenodd"></path>
  </svg>
);

export const BalanceStats = ({ onNavigate }: BalanceStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 mx-4 mt-4">
      <div className="bg-white rounded-lg p-4">
        <div className="text-base font-bold text-green-500 mb-2 flex items-center">
          <USDTIcon />
          0.00
        </div>
        <div className="flex items-center justify-between">
          <div className="text-gray-600 text-sm">可用余额</div>
          <button onClick={() => onNavigate('/wallet-recharge')} className="px-3 py-1 bg-green-500 text-white rounded-full text-xs">
            充值
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg p-4">
        <div className="text-base font-bold text-orange-500 mb-2 flex items-center">
          <USDTIcon />
          0.00
        </div>
        <div className="flex items-center justify-between">
          <div className="text-gray-600 text-sm">冻结余额</div>
          <button onClick={() => onNavigate('/wallet')} className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs">
            详情
          </button>
        </div>
      </div>
    </div>
  );
};

