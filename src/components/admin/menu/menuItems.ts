
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Store, 
  Users,
  Smartphone,
  CreditCard,
  Wallet2,
  Bell,
  Package
} from "lucide-react";
import { MenuItem } from "./types";

export const menuItems: MenuItem[] = [
  {
    title: "控制台",
    path: "/admin",
    icon: LayoutDashboard
  },
  {
    title: "运营订单",
    icon: FileText,
    children: [
      {
        title: "订单管理",
        path: "/admin/orders"
      },
      {
        title: "财务管理",
        path: "/admin/finance"
      },
      {
        title: "交易明细",
        path: "/admin/transactions"
      }
    ]
  },
  {
    title: "支付管理",
    icon: CreditCard,
    children: [
      {
        title: "支付通道",
        path: "/admin/payment/channels"
      },
      {
        title: "支付地址",
        path: "/admin/payment/addresses"
      },
      {
        title: "支付设置",
        path: "/admin/payment/settings"
      }
    ]
  },
  {
    title: "资金管理",
    icon: Wallet2,
    children: [
      {
        title: "资金明细",
        path: "/admin/balance/transactions"
      },
      {
        title: "提现管理",
        path: "/admin/balance/withdrawals"
      }
    ]
  },
  {
    title: "系统消息",
    icon: Bell,
    children: [
      {
        title: "全部消息",
        path: "/admin/messages"
      },
      {
        title: "系统通知",
        path: "/admin/notices"
      }
    ]
  },
  {
    title: "业务管理",
    icon: Package,
    children: [
      {
        title: "产品管理",
        path: "/admin/business/products"
      },
      {
        title: "业务模板",
        path: "/admin/business/templates"
      },
      {
        title: "快速充值卡片",
        path: "/admin/business/homepage-cards"
      },
      {
        title: "可配置服务",
        path: "/admin/business/configurable-services"
      }
    ]
  },
  {
    title: "运营管理",
    icon: Settings,
    children: [
      {
        title: "系统设置",
        path: "/admin/settings"
      }
    ]
  },
  {
    title: "商家管理",
    icon: Store,
    path: "/admin/merchants"
  },
  {
    title: "管理员",
    icon: Users,
    path: "/admin/admins"
  },
  {
    title: "商户端",
    icon: Smartphone,
    path: "/merchant"
  }
];

