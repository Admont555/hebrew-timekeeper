import { ReactNode } from "react";
import { useUserRole, AppRole } from "@/hooks/useUserRole";

interface RoleBasedAccessProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
  fallback?: ReactNode;
}

export const RoleBasedAccess = ({
  children,
  allowedRoles = [],
  fallback = null,
}: RoleBasedAccessProps) => {
  const { roles, isLoading } = useUserRole();

  if (isLoading) return null;

  const hasAccess = allowedRoles.length === 0 || 
    roles?.some(role => allowedRoles.includes(role));

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};