
import { MainNavItem } from "./types";
import { PermissionName } from "@/hooks/usePermissions";

export const filterGroupItems = (
  items: MainNavItem[],
  isSuperAdmin: boolean | undefined,
  canAccess: (permission: PermissionName) => boolean
) => {
  return items.filter((item) => {
    if (isSuperAdmin) {
      return true;
    }

    if (item.permission) {
      return canAccess(item.permission);
    }

    return true;
  });
};
