
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { MenuItem } from "./types";
import { cn } from "@/lib/utils";

interface SidebarMenuItemProps {
  item: MenuItem;
  isOpen: boolean;
  onToggle: () => void;
}

export const SidebarMenuItem = ({ item, isOpen, onToggle }: SidebarMenuItemProps) => {
  return (
    <div>
      {item.children ? (
        <button
          onClick={onToggle}
          className={cn(
            "flex w-full items-center px-3 py-2.5 text-sm hover:bg-gray-100 rounded-md transition-colors",
            isOpen && "bg-gray-100 font-medium"
          )}
        >
          {item.icon && <item.icon className="mr-2 h-4 w-4 text-gray-600" />}
          <span>{item.title}</span>
          <ChevronDown
            className={cn("ml-auto h-4 w-4 text-gray-500 transition-transform", 
              isOpen && "rotate-180"
            )}
          />
        </button>
      ) : (
        <Link
          to={item.path || "#"}
          className="flex items-center px-3 py-2.5 text-sm hover:bg-gray-100 rounded-md transition-colors"
        >
          {item.icon && <item.icon className="mr-2 h-4 w-4 text-gray-600" />}
          <span>{item.title}</span>
        </Link>
      )}
      
      {item.children && isOpen && (
        <div className="pl-4 mt-1">
          {item.children.map((child) => (
            <Link
              key={child.title}
              to={child.path || "#"}
              className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors text-gray-600"
            >
              {child.icon && <child.icon className="mr-2 h-4 w-4" />}
              <span>{child.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

