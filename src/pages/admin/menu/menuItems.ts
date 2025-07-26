import {
  Home,
  Settings,
  CreditCard,
  ShoppingCart,
  Users,
  Building2,
  Award,
  Gauge,
  PieChart,
  Cable,
  Lock,
  Package,
  Wallet,
  MessageCircle,
  Shield,
  User,
  Building,
  Target,
  TrendingUp,
  BarChart3,
  FileText,
  Headphones,
  DollarSign,
  Key,
  Monitor,
  Palette,
  Volume2,
  History,
  Bell
} from "lucide-react";

import { MenuItemWithSubMenu } from "./types";

export const menuItems: MenuItemWithSubMenu[] = [
  {
    title: "仪表盘",
    href: "/admin-dashboard",
    icon: Home,
    submenu: false,
    children: []
  },
  {
    title: "订单管理",
    icon: ShoppingCart,
    submenu: true,
    subMenuItems: [
      {
        title: "在线业务订单",
        href: "/admin/online-orders",
        description: "信用卡代还、花呗代还等"
      }
    ],
    children: []
  },
  {
    title: "用户管理",
    icon: Users,
    submenu: true,
    subMenuItems: [
      {
        title: "用户列表",
        href: "/admin/users",
        description: "管理平台用户信息和账户"
      },
      {
        title: "账户监控",
        href: "/admin/user-monitoring",
        description: "用户账户状态和风险监控"
      }
    ],
    children: []
  },
  {
    title: "代理管理",
    icon: Building2,
    submenu: true,
    subMenuItems: [
      {
        title: "代理列表",
        href: "/admin/agents",
        description: "管理平台代理商"
      },
      {
        title: "数据看板",
        href: "/admin/data-dashboard",
        description: "业绩分析和实时监控"
      }
    ],
    children: []
  },
  {
    title: "业务管理",
    icon: Package,
    submenu: true,
    subMenuItems: [
      {
        title: "产品管理",
        href: "/admin/business/products",
        description: "管理业务产品和服务类型"
      },
      {
        title: "价格设置",
        href: "/admin/settings/pricing",
        description: "管理汇率和折扣设置"
      }
    ],
    children: []
  },
  {
    title: "财务管理",
    icon: Wallet,
    submenu: true,
    subMenuItems: [
      {
        title: "USDT收款管理",
        href: "/admin/finance/usdt",
        description: "管理USDT收款地址"
      },
      {
        title: "充值订单管理",
        href: "/admin/finance/recharge-orders",
        description: "查看和管理所有充值订单"
      },
      {
        title: "提现审核",
        href: "/admin/finance/withdrawal",
        description: "用户提现申请审核"
      },
      {
        title: "财务报表",
        href: "/admin/finance/reports",
        description: "资金流水和财务统计"
      }
    ],
    children: []
  },
  {
    title: "客服坐席",
    icon: Headphones,
    submenu: true,
    subMenuItems: [
      {
        title: "在线客服",
        href: "/admin/support/chat",
        description: "实时客服聊天管理"
      }
    ],
    children: []
  },
  {
    title: "权限管理",
    icon: Shield,
    submenu: true,
    subMenuItems: [
      {
        title: "角色管理",
        href: "/admin/permissions/roles",
        description: "管理系统角色和权限"
      },
      {
        title: "账号管理",
        href: "/admin/permissions/accounts",
        description: "管理管理员账号"
      },
      {
        title: "功能权限",
        href: "/admin/permissions/features",
        description: "配置功能访问权限"
      }
    ],
    children: []
  },
  {
    title: "支付管理",
    icon: CreditCard,
    submenu: true,
    subMenuItems: [
      {
        title: "支付设置",
        href: "/admin/payment/settings",
        description: "配置平台支付相关设置"
      },
      {
        title: "支付地址",
        href: "/admin/payment/addresses",
        description: "管理支付地址"
      },
      {
        title: "支付通道",
        href: "/admin/payment/channels",
        description: "管理支付通道"
      }
    ],
    children: []
  },
  {
    title: "系统设置",
    icon: Settings,
    submenu: true,
    subMenuItems: [
      {
        title: "基础设置",
        href: "/admin/settings/basic",
        description: "系统基础配置"
      },
      {
        title: "网站公告",
        href: "/admin/announcements",
        description: "管理首页网站公告内容"
      },
      {
        title: "弹窗公告",
        href: "/admin/popup-announcements",
        description: "管理首次访问弹窗公告"
      },
      {
        title: "主题管理",
        href: "/admin/settings/theme",
        description: "界面主题和样式设置"
      },
      {
        title: "密码修改",
        href: "/admin/settings/password",
        description: "修改管理员密码"
      },
      {
        title: "日志管理",
        href: "/admin/settings/logs",
        description: "系统操作日志查看"
      },
      {
        title: "语音播报",
        href: "/admin/settings/voice",
        description: "订单信息语音播报设置"
      },
      {
        title: "API管理",
        href: "/admin/settings/api",
        description: "API密钥和接口权限"
      },
      {
        title: "Webhook设置",
        href: "/admin/settings/webhooks",
        description: "事件通知和回调配置"
      },
      {
        title: "安全中心",
        href: "/admin/settings/security",
        description: "系统安全设置和监控"
      }
    ],
    children: []
  }
];
