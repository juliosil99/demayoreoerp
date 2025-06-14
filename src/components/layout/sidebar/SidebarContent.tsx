
import { SidebarGroup } from "@/components/layout/sidebar/SidebarGroup";
import { SidebarItem } from "@/components/layout/sidebar/SidebarItem";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useLocation } from "react-router-dom";
import { sidebarGroups } from "./sidebarConfig";
import { filterGroupItems } from "./utils";
import { SidebarContentProps } from "./types";

export function SidebarContent({ isSuperAdmin }: SidebarContentProps) {
  const { isAdmin } = useAuth();
  const { canAccess } = usePermissions();
  const location = useLocation();

  return (
    <div className="flex flex-col gap-2">
      {sidebarGroups.map((group) => {
        const filteredItems = filterGroupItems(group.items, isSuperAdmin, canAccess);
        
        if (filteredItems.length === 0) {
          return null;
        }

        return (
          <SidebarGroup 
            key={group.title} 
            title={group.title}
            isOpen={group.defaultOpen}
          >
            {filteredItems.map((item) => (
              <SidebarItem
                key={item.name}
                icon={item.icon}
                label={item.name}
                to={item.href}
                isActive={location.pathname === item.href}
              />
            ))}
          </SidebarGroup>
        );
      })}
    </div>
  );
}
