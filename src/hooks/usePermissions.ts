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

  // Admin user permissions
  const canListUsers = (): boolean => {
    return hasPermission("admin.user.list");
  };

  const canEditUser = (): boolean => {
    return hasPermission("admin.user.edit");
  };

  const canDeleteUser = (): boolean => {
    return hasPermission("admin.user.delete");
  };

  const canListUserPermissions = (): boolean => {
    return hasPermission("admin.user.permissions.list");
  };

  const canAddUserPermission = (): boolean => {
    return hasPermission("admin.user.permissions.add");
  };

  const canDeleteUserPermission = (): boolean => {
    return hasPermission("admin.user.permissions.delete");
  };

  const canListUserVotes = (): boolean => {
    return hasPermission("admin.user.vote.list");
  };

  const canDeleteUserVote = (): boolean => {
    return hasPermission("admin.user.vote.delete");
  };

  return {
    hasPermission,
    hasRole,
    canViewApplications,
    canVote,
    canViewVoteDetails,
    canSync,
    canListUsers,
    canEditUser,
    canDeleteUser,
    canListUserPermissions,
    canAddUserPermission,
    canDeleteUserPermission,
    canListUserVotes,
    canDeleteUserVote,
    permissions: usuario?.permissions || [],
  };
};

