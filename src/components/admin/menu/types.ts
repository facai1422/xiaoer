
import { LucideIcon } from "lucide-react";

export interface MenuItem {
  title: string;
  path?: string;
  icon?: LucideIcon;
  children?: MenuItem[];
}
