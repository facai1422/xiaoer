import { Route, Routes, Outlet, Navigate } from "react-router-dom"
import Dashboard from "./Dashboard"
import PaymentSettingsPage from "./payment/settings/PaymentSettingsPage"
import PaymentAddressesPage from "./payment/addresses/PaymentAddressesPage"
import PaymentChannelsPage from "./payment/channels/PaymentChannelsPage"
import NewPaymentChannelPage from "./payment/channels/new/NewPaymentChannelPage"
import EditPaymentChannelPage from "./payment/channels/edit/EditPaymentChannelPage"
import { AdminLayout } from "@/modules/admin/layout/AdminLayout"
import DashboardPage from "@/modules/admin/pages/DashboardPage"
import Login from "./Login"
import AdminSettings from "./settings"
import OnlineOrdersPage from "./online-orders"
import MerchantsPage from "./merchants"
import MerchantRiskControl from "./merchant-risk"
import DataDashboardPage from "./data-dashboard"
import ApiManagementPage from "./api-management"
import AgentsPage from "@/modules/admin/pages/AgentsPage"
import UserList from "./users/UserList"
import UserMonitoring from "./users/UserMonitoring"
import { getAdminSession } from "@/utils/adminAuth"
import UsersPage from "@/modules/admin/pages/UsersPage"

// 业务管理
import ProductsPage from "./business/RealProductsPage"
import ConfigurableServicesPage from "./business/ConfigurableServicesPage"
import BusinessTemplatesPage from "./business/BusinessTemplatesPage"
import HomepageRechargeCardsPage from "./business/HomepageRechargeCardsPage"

// 财务管理
import USDTManagePage from "./finance/USDTManagePage"
import RechargePage from "./finance/RechargePage"
import WithdrawalPage from "./finance/WithdrawalPage"
import FinancialReportPage from "./finance/FinancialReportPage"
import RechargeOrderManagement from "./RechargeOrderManagement"

// 客服坐席
import ChatPage from "./support/ChatPage"

// 系统设置
import ThemePage from "./settings/ThemePage"
import PricingSettingsPage from "./settings/PricingSettingsPage"
import PasswordPage from "./settings/PasswordPage"

// 公告管理
import AnnouncementsPage from "./announcements/AnnouncementsPage"
import PopupAnnouncementsPage from "./announcements/PopupAnnouncementsPage"

const AdminRoutes = () => {
  console.log('🔥 AdminRoutes 组件渲染...');
  
  // 检查是否是/admin-dashboard路径 - 特殊处理
  const isAdminDashboard = window.location.pathname === '/admin-dashboard';
  
  if (isAdminDashboard) {
    console.log('🎯 检测到 /admin-dashboard 路径，返回专业版仪表盘');
    return <DashboardPage />;
  }

  // 获取当前路径
  const currentPath = window.location.pathname;
  const isLoginPage = currentPath.includes('/admin/login');
  
  console.log('📍 当前路径:', currentPath);
  console.log('🔐 是否登录页面:', isLoginPage);
  
  // 如果是登录页面，直接显示登录组件
  if (isLoginPage) {
    console.log('✅ 在登录页面，直接显示登录组件');
    return <Login />;
  }

  // 非登录页面时检查session
  const adminSession = getAdminSession();
  console.log('🔐 检查管理员session:', adminSession ? '有效' : '无效');
  
  // 如果没有有效session，重定向到登录页面
  if (!adminSession || adminSession.expires <= Date.now()) {
    console.log('❌ 没有有效session，重定向到登录页面');
    if (adminSession && adminSession.expires <= Date.now()) {
      localStorage.removeItem('admin_session');
      console.log('🗑️ 清除过期session');
    }
    return <Navigate to="/admin/login" replace />;
  }

  console.log('✅ Session验证通过，渲染管理后台');

  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="*" element={
        <AdminLayout>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* 订单管理 */}
            <Route path="online-orders" element={<OnlineOrdersPage />} />
            
            {/* 用户管理 */}
            <Route path="users" element={<UsersPage />} />
            <Route path="user-monitoring" element={<UserMonitoring />} />
            
            {/* 代理管理 */}
            <Route path="agents" element={<AgentsPage />} />
            <Route path="data-dashboard" element={<DataDashboardPage />} />
            
                          {/* 业务管理 */}
              <Route path="business/products" element={<ProductsPage />} />
              <Route path="business/templates" element={<BusinessTemplatesPage />} />
              <Route path="business/homepage-cards" element={<HomepageRechargeCardsPage />} />
              <Route path="business/configurable-services" element={<ConfigurableServicesPage />} />
              
              {/* 财务管理 */}
              <Route path="finance/usdt" element={<USDTManagePage />} />
              <Route path="finance/withdrawal" element={<WithdrawalPage />} />
              <Route path="finance/reports" element={<FinancialReportPage />} />
              <Route path="finance/recharge-orders" element={<RechargeOrderManagement />} />
            
            {/* 客服坐席 */}
            <Route path="support/chat" element={<ChatPage />} />
            
            {/* 支付管理 */}
            <Route path="payment/settings" element={<PaymentSettingsPage />} />
            <Route path="payment/addresses" element={<PaymentAddressesPage />} />
            <Route path="payment/channels" element={<PaymentChannelsPage />} />
            <Route path="payment/channels/new" element={<NewPaymentChannelPage />} />
            <Route path="payment/channels/edit/:id" element={<EditPaymentChannelPage />} />
            
            {/* 系统设置 */}
            <Route path="settings" element={<AdminSettings />} />
            <Route path="settings/password" element={<PasswordPage />} />
            <Route path="settings/theme" element={<ThemePage />} />
            <Route path="settings/pricing" element={<PricingSettingsPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="popup-announcements" element={<PopupAnnouncementsPage />} />
            <Route path="api-management" element={<ApiManagementPage />} />
            
            {/* 其他页面 */}
            <Route path="merchants" element={<MerchantsPage />} />
            <Route path="merchant-risk" element={<MerchantRiskControl />} />
          </Routes>
        </AdminLayout>
      } />
    </Routes>
  )
}

export default AdminRoutes
