import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import './BottomNav.css';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('tab-01');

  // 根据当前路径设置活跃标签
  useEffect(() => {
    switch (location.pathname) {
      case '/dashboard':
        setActiveTab('tab-01');
        break;
      case '/orders':
      case '/payment/orders':
        setActiveTab('tab-02');
        break;
      case '/wallet':
        setActiveTab('tab-03');
        break;
      case '/profile':
        setActiveTab('tab-04');
        break;
      default:
        setActiveTab('tab-01');
    }
  }, [location.pathname]);

  const handleTabChange = (tabId: string, path: string) => {
    setActiveTab(tabId);
    navigate(path);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="tabs">
        {/* TAB 1 - 首页 */}
        <input
          type="radio"
          name="tab"
          id="tab-01"
          checked={activeTab === 'tab-01'}
          onChange={() => handleTabChange('tab-01', '/dashboard')}
        />
        <label htmlFor="tab-01" onClick={() => handleTabChange('tab-01', '/dashboard')}>
          <svg>
            <use xlinkHref="#icon-01" className="icon" />
            <use xlinkHref="#icon-01" className="icon-border" />
            <use xlinkHref="#icon-01-fill" className="icon-fill" />
          </svg>
        </label>

        {/* TAB 2 - 订单 */}
        <input
          type="radio"
          name="tab"
          id="tab-02"
          checked={activeTab === 'tab-02'}
          onChange={() => handleTabChange('tab-02', '/orders')}
        />
        <label htmlFor="tab-02" onClick={() => handleTabChange('tab-02', '/orders')}>
          <svg>
            <use xlinkHref="#icon-02" className="icon" />
            <use xlinkHref="#icon-02" className="icon-border" />
            <use xlinkHref="#icon-02-fill" className="icon-fill" />
          </svg>
        </label>

        {/* TAB 3 - 钱包 */}
        <input
          type="radio"
          name="tab"
          id="tab-03"
          checked={activeTab === 'tab-03'}
          onChange={() => handleTabChange('tab-03', '/wallet')}
        />
        <label htmlFor="tab-03" onClick={() => handleTabChange('tab-03', '/wallet')}>
          <svg>
            <use xlinkHref="#icon-03" className="icon" />
            <use xlinkHref="#icon-03" className="icon-border" />
            <use xlinkHref="#icon-03-fill" className="icon-fill" />
          </svg>
        </label>

        {/* TAB 4 - 个人中心 */}
        <input
          type="radio"
          name="tab"
          id="tab-04"
          checked={activeTab === 'tab-04'}
          onChange={() => handleTabChange('tab-04', '/profile')}
        />
        <label htmlFor="tab-04" onClick={() => handleTabChange('tab-04', '/profile')}>
          <svg>
            <use xlinkHref="#icon-04" className="icon" />
            <use xlinkHref="#icon-04" className="icon-border" />
            <use xlinkHref="#icon-04-fill" className="icon-fill" />
          </svg>
        </label>
      </div>

      {/* SVG 图标定义 */}
      <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
        <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" id="icon-01">
          <path d="M25.81,11.94,24.75,3a3.3,3.3,0,0,0-3.18-3H4.43A3.3,3.3,0,0,0,1.25,3L.19,11.94A7.8,7.8,0,0,0,0,13.68v9.25A3,3,0,0,0,2.85,26H11V19a2,2,0,0,1,4,0v7h8.15A3,3,0,0,0,26,22.93V13.68A7.8,7.8,0,0,0,25.81,11.94Z"/>
        </symbol>
        <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" id="icon-01-fill">
          <path fill="var(--primary)" d="M25.81,11.94,24.75,3a3.3,3.3,0,0,0-3.18-3H21A19.48,19.48,0,0,1,1.5,19C1,19,.5,19,0,18.92v4A3,3,0,0,0,2.85,26H11V19a2,2,0,0,1,4,0v7h8.15A3,3,0,0,0,26,22.93V13.68A7.8,7.8,0,0,0,25.81,11.94Z"/>
          <path fill="var(--secondary)" d="M13,19h0a2,2,0,0,1,2,2v5a0,0,0,0,1,0,0H11a0,0,0,0,1,0,0V21A2,2,0,0,1,13,19Z"/>
          <path fill="var(--primary-light)" d="M1.5,19A19.48,19.48,0,0,0,21,0H4.43A3.3,3.3,0,0,0,1.25,3L.19,11.94A7.8,7.8,0,0,0,0,13.68v5.24C.5,19,1,19,1.5,19Z"/>
        </symbol>
        <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" id="icon-02">
          <path d="M13,0A13,13,0,0,0,3.14,21.45a2.67,2.67,0,0,0-.72,1.83A2.71,2.71,0,0,0,4.85,26v0H13A13,13,0,0,0,13,0ZM8,8h4a2,2,0,0,1,0,4H8A2,2,0,0,1,8,8Zm9,11H8a2,2,0,0,1,0-4h9a2,2,0,0,1,0,4Zm0-7a2,2,0,1,1,2-2A2,2,0,0,1,17,12Z"/>
        </symbol>
        <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" id="icon-02-fill">
          <rect fill="var(--secondary)" x="6" y="15" width="13" height="4" rx="2"/>
          <path fill="var(--primary)" d="M20.74,2.57a19.45,19.45,0,0,1-2.12,6.27A2,2,0,0,1,19,10a2,2,0,0,1-2,2,1.85,1.85,0,0,1-.48-.07A19.49,19.49,0,0,1,13.3,15H17a2,2,0,0,1,0,4H8a1.94,1.94,0,0,1-1.48-.68,19.37,19.37,0,0,1-5,.68h0a12.87,12.87,0,0,0,1.66,2.45,2.67,2.67,0,0,0-.72,1.83A2.71,2.71,0,0,0,4.85,26v0H13A13,13,0,0,0,20.74,2.57Z"/>
          <path fill="var(--primary-light)" d="M13,0A13,13,0,0,0,1.48,19h0a19.37,19.37,0,0,0,5-.68A2,2,0,0,1,6,17a2,2,0,0,1,2-2h5.3a19.49,19.49,0,0,0,3.22-3.07,2,2,0,1,1,2.1-3.09,19.45,19.45,0,0,0,2.12-6.27A12.94,12.94,0,0,0,13,0ZM12,12H8A2,2,0,0,1,8,8h4a2,2,0,0,1,0,4Z"/>
        </symbol>
        <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" id="icon-03">
          <path d="M23.15,0,15,1V9a2,2,0,0,1-4,0V1.1L2.85,0A3,3,0,0,0,0,3.07V22.93A3,3,0,0,0,2.85,26l8.74-1.18a9.08,9.08,0,0,1,2.27,0L23.15,26A3,3,0,0,0,26,22.93V3.07A3,3,0,0,0,23.15,0Z" />
        </symbol>
        <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" id="icon-03-fill">
          <path fill="var(--secondary)" d="M13.86,1.19a9.08,9.08,0,0,1-2.27,0L11,1.1V7a2,2,0,0,0,4,0V1Z"/>
          <path fill="var(--primary)" d="M23.15,0,21,.28A19.48,19.48,0,0,1,1.5,19C1,19,.5,19,0,18.92v4A3,3,0,0,0,2.85,26l8.74-1.18a9.08,9.08,0,0,1,2.27,0L23.15,26A3,3,0,0,0,26,22.93V3.07A3,3,0,0,0,23.15,0Z"/>
          <path fill="var(--primary-light)" d="M1.5,19A19.48,19.48,0,0,0,21,.28L15,1V9a2,2,0,0,1-4,0V1.1L2.85,0A3,3,0,0,0,0,3.07V18.92C.5,19,1,19,1.5,19Z"/>
        </symbol>
        <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" id="icon-04">
          <path d="M26,13A13,13,0,1,0,3.14,21.45a2.67,2.67,0,0,0-.72,1.83A2.7,2.7,0,0,0,4.86,26l0,0H20.56l0,0c.11,0,.22,0,.33,0a2.72,2.72,0,0,0,2.72-2.72,2.67,2.67,0,0,0-.72-1.83A12.93,12.93,0,0,0,26,13ZM11,13a2,2,0,0,1-4,0V12a2,2,0,0,1,4,0Zm8,0a2,2,0,0,1-4,0V12a2,2,0,0,1,4,0Z"/>
        </symbol>
        <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" id="icon-04-fill">
          <rect fill="var(--secondary)" x="7" y="11" width="4" height="4" rx="2"/>
          <rect fill="var(--secondary)" x="15" y="11" width="4" height="4" rx="2"/>
          <path fill="var(--primary)" d="M26,13A13,13,0,0,0,20.74,2.57a19.32,19.32,0,0,1-2.93,7.6A2,2,0,0,1,19,12v1a2,2,0,0,1-3.93.49A19.45,19.45,0,0,1,1.5,19h0a12.87,12.87,0,0,0,1.66,2.45,2.67,2.67,0,0,0-.72,1.83A2.7,2.7,0,0,0,4.86,26l0,0H20.56l0,0c.11,0,.22,0,.33,0a2.72,2.72,0,0,0,2.72-2.72,2.67,2.67,0,0,0-.72-1.83A12.93,12.93,0,0,0,26,13Z"/>
          <path fill="var(--primary-light)" d="M13,0A13,13,0,0,0,1.48,19h0a19.45,19.45,0,0,0,13.57-5.51A2,2,0,0,1,15,13V12a2,2,0,0,1,2.81-1.83,19.32,19.32,0,0,0,2.93-7.6A12.94,12.94,0,0,0,13,0ZM11,13a2,2,0,0,1-4,0V12a2,2,0,0,1,4,0Z"/>
        </symbol>
      </svg>
    </div>
  );
};

export default BottomNav;
