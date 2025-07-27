import { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { initDialogDragDisable } from "@/utils/dialogUtils";
import Dashboard from "./pages/Dashboard";
import DirectLogin from "./pages/DirectLogin";
import HomeSimple from "./pages/HomeSimple";
import LoginSimple from "./pages/LoginSimple";
import BasicLogin from "./pages/BasicLogin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Orders from "./pages/Orders";
import AllOrders from "./pages/AllOrders";
import OrderDetail from "./pages/OrderDetail";
import Trade from "./pages/Trade";
import TransactionOrders from "./pages/TransactionOrders";
import Wallet from "./pages/Wallet";
import WalletRecharge from "./pages/WalletRecharge";
import WalletAddress from "./pages/WalletAddress";
import Withdraw from "./pages/Withdraw";
import Utilities from "./pages/Utilities";
import Product from "./pages/Product";
import Recharge from "./pages/Recharge";
import Poster from "./pages/Poster";
import AgentCenter from "./pages/AgentCenter";
import Apply from "./pages/agent/Apply";
import PaymentSettings from "./pages/PaymentSettings";
import PaymentOrders from "./pages/PaymentOrders";
import PayPasswordPage from "./pages/PayPasswordPage";
import NotFound from "./pages/NotFound";
import AdminRoutes from "./pages/admin/routes";

import DashboardPage from "./modules/admin/pages/DashboardPage";
import MerchantDashboard from "./pages/merchant/Dashboard";
import OnlineOrders from "./pages/merchant/OnlineOrders";
import PendingOrders from "./pages/merchant/PendingOrders";
import Settings from "./pages/merchant/Settings";
import SalesManagement from "./pages/merchant/SalesManagement";
import AlipayBind from "./pages/payment/AlipayBind";
import BankBind from "./pages/payment/BankBind";
import WechatBind from "./pages/payment/WechatBind";
import UsdtBind from "./pages/payment/UsdtBind";
import CreditCard from "./pages/CreditCard";
import HuabeiRepayment from "./pages/HuabeiRepayment";
import DouYinCoin from "./pages/DouYinCoin";
import KuaishouCoin from "./pages/KuaishouCoin";
import NetEaseGame from "./pages/NetEaseGame";
import OilCard from "./pages/OilCard";
import GasFee from "./pages/GasFee";
import FangxinLoan from "./pages/FangxinLoan";
import JdEcard from "./pages/JdEcard";
import Support from "./pages/Support";
import CustomerService from "./pages/CustomerService";
import QueryOrders from "./pages/QueryOrders";
import MobileRecharge from "./pages/MobileRecharge";
import ElectricRecharge from "./pages/ElectricRecharge";
import ProfileSimple from "./pages/ProfileSimple";
import TestPage from "./pages/TestPage";
import SimpleTest from "./pages/SimpleTest";
import DirectTest from "./pages/DirectTest";
import NoLoadingTest from "./pages/NoLoadingTest";
import RechargeOrderDetail from "./pages/RechargeOrderDetail";
import RechargeOrders from "./pages/RechargeOrders";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { PopupAnnouncement } from "@/components/home/PopupAnnouncement";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // 强制禁用暗色模式，确保管理后台文字可见
    setIsDarkMode(false);
    
    // 初始化弹窗拖拽禁用功能
    const cleanup = initDialogDragDisable();
    
    // 清理函数
    return cleanup;
  }, []);

  // 检查是否应该显示公告弹窗 - 只在用户端页面显示
  const shouldShowPopupAnnouncement = () => {
    const isAdminPage = location.pathname.startsWith('/admin');
    const isMerchantPage = location.pathname.startsWith('/merchant');
    const isAgentPage = location.pathname.startsWith('/agent');
    const isLoginPage = location.pathname === '/login';
    const isRegisterPage = location.pathname === '/register';
    
    // 排除管理后台、商户后台、代理页面、登录注册页面
    return !(isAdminPage || isMerchantPage || isAgentPage || isLoginPage || isRegisterPage);
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <AuthProvider>
        <SonnerToaster position="top-center" />
        <Toaster />
        {shouldShowPopupAnnouncement() && <PopupAnnouncement />}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard-simple" element={<DirectLogin />} />
          <Route path="/home-simple" element={<HomeSimple />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login-simple" element={<LoginSimple />} />
          <Route path="/basic-login" element={<BasicLogin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile-simple" element={<ProfileSimple />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/simple-test" element={<SimpleTest />} />
          <Route path="/direct-test" element={<DirectTest />} />
          <Route path="/no-loading" element={<NoLoadingTest />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/query-orders" element={<QueryOrders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/order/:orderId" element={<OrderDetail />} />
          <Route path="/recharge-orders" element={<RechargeOrders />} />
          <Route path="/recharge-orders/:id" element={<RechargeOrderDetail />} />
          <Route path="/trade" element={<Trade />} />
          <Route path="/transaction-orders" element={<TransactionOrders />} />
          <Route path="/transactions" element={<TransactionOrders />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/wallet-recharge" element={<WalletRecharge />} />
          <Route path="/wallet/recharge" element={<WalletRecharge />} />
          <Route path="/wallet-address" element={<WalletAddress />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/utilities" element={<Utilities />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/recharge" element={<Recharge />} />
          <Route path="/poster" element={<Poster />} />
          <Route path="/agent" element={<AgentCenter />} />
          <Route path="/agent/apply" element={<Apply />} />
          <Route path="/agent/login" element={<Login />} />
          <Route path="/payment/settings" element={<PaymentSettings />} />
          <Route path="/payment/orders" element={<AllOrders />} />
          <Route path="/pay-password" element={<PayPasswordPage />} />
          <Route path="/credit-card" element={<CreditCard />} />
          <Route path="/creditcard-daihuan" element={<CreditCard />} />
          <Route path="/huabei-repayment" element={<HuabeiRepayment />} />
          <Route path="/douyin-coin" element={<DouYinCoin />} />
          <Route path="/kuaishou-coin" element={<KuaishouCoin />} />
          <Route path="/netease-game" element={<NetEaseGame />} />
          <Route path="/oil-card" element={<OilCard />} />
          <Route path="/gas-fee" element={<GasFee />} />
          <Route path="/fangxin-loan" element={<FangxinLoan />} />
          <Route path="/jd-ecard" element={<JdEcard />} />
          <Route path="/support" element={<Support />} />
          <Route path="/customer-service" element={<CustomerService />} />
          
          {/* Admin Routes - Use trailing slash to be consistent */}
          <Route path="/admin/*" element={<AdminRoutes />} />
          
          {/* Redirect admin-dashboard to admin/dashboard */}
          <Route path="/admin-dashboard" element={<AdminRoutes />} />
          
          {/* Merchant Routes */}
          <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
          <Route path="/merchant/orders" element={<OnlineOrders />} />
          <Route path="/merchant/payment-orders" element={<PaymentOrders />} />
          <Route path="/merchant/pending-orders" element={<PendingOrders />} />
          <Route path="/merchant/settings" element={<Settings />} />
          <Route path="/merchant/sales" element={<SalesManagement />} />
          
          {/* General settings and sales routes that redirect to merchant routes */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/sales" element={<SalesManagement />} />
          
          {/* Payment Routes */}
          <Route path="/payment/alipay-bind" element={<AlipayBind />} />
          <Route path="/payment/bank-bind" element={<BankBind />} />
          <Route path="/payment/wechat-bind" element={<WechatBind />} />
          <Route path="/payment/usdt-bind" element={<UsdtBind />} />
          
          {/* Mobile Recharge Route */}
          <Route path="/mobile-recharge" element={<MobileRecharge />} />
          
          {/* Electric Recharge Route */}
          <Route path="/electric-recharge" element={<ElectricRecharge />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
