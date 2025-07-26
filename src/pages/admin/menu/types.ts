
import { LucideIcon } from "lucide-react";

export interface MenuItem {
  title: string;
  path?: string;
  icon: LucideIcon;
  children?: MenuItemChild[];
}

export interface MenuItemChild {
  title: string;
  path: string;
}

// Updated MenuItemWithSubMenu definition
export interface MenuItemWithSubMenu {
  title: string;
  icon: LucideIcon;
  href?: string;
  path?: string;
  submenu: boolean;
  children?: MenuItemChild[];
  subMenuItems?: {
    title: string;
    href: string;
    description?: string;
  }[];
}
