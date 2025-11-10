import { useAuth } from "./useAuth";

export const usePermissions = () => {
  const { usuario } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!usuario?.permissions) {
      return false;
    }
    return usuario.permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    if (!usuario?.permissions) {
      return false;
    }
    return usuario.permissions.includes(role);
  };

  const canViewApplications = (): boolean => {
    return hasPermission("applications.view");
  };

  const canVote = (): boolean => {
    return hasRole("applications.vote.create");
  };

  const canViewVoteDetails = (): boolean => {
    return hasPermission("applications.vote.view");
  };

  const canSync = (): boolean => {
    return hasPermission("applications.sync");
  };

  return {
    hasPermission,
    hasRole,
    canViewApplications,
    canVote,
    canViewVoteDetails,
    canSync,
    permissions: usuario?.permissions || [],
  };
};

