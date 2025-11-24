import { useAuth } from "./useAuth";
import { GROUP_PERMISSIONS, type GroupName } from "@/types/user";

/**
 * Hook para verificar permisos del usuario basado en grupos
 *
 * Grupos disponibles:
 * - superadmin: Acceso total
 * - user-admin: Editar usuarios
 * - vote-admin: Editar votos
 * - miembro: Votar
 * - trainee: Ver aplicaciones
 */
export const usePermissions = () => {
  const { usuario } = useAuth();

  /**
   * Obtener todos los permisos del usuario
   */
  const getPermissions = (): string[] => {
    if (!usuario?.grupos || usuario.grupos.length === 0) {
      return [];
    }

    const permissions = new Set<string>();
    usuario.grupos.forEach((groupName) => {
      const groupPerms = GROUP_PERMISSIONS[groupName as GroupName];
      if (groupPerms) {
        groupPerms.forEach(perm => permissions.add(perm));
      }
    });

    return Array.from(permissions);
  };

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  const hasPermission = (permission: string): boolean => {
    return getPermissions().includes(permission);
  };

  /**
   * Verificar si el usuario pertenece a un grupo
   */
  const hasGroup = (groupName: string): boolean => {
    return usuario?.grupos?.includes(groupName) ?? false;
  };

  /**
   * Verificar si el usuario es superadmin
   */
  const isSuperAdmin = (): boolean => {
    return hasGroup('superadmin');
  };

  /**
   * Verificar si el usuario es admin de usuarios
   */
  const isUserAdmin = (): boolean => {
    return hasGroup('user-admin') || isSuperAdmin();
  };

  /**
   * Verificar si el usuario es admin de votos
   */
  const isVoteAdmin = (): boolean => {
    return hasGroup('vote-admin') || isSuperAdmin();
  };

  /**
   * Verificar si el usuario es miembro
   */
  const isMiembro = (): boolean => {
    return hasGroup('miembro') || isSuperAdmin() || isUserAdmin();
  };

  /**
   * Verificar si el usuario es trainee
   */
  const isTrainee = (): boolean => {
    return hasGroup('trainee') || isMiembro();
  };

  // Métodos específicos para funcionalidades
  const canViewApplications = (): boolean => hasPermission('applications.view');
  const canVote = (): boolean => hasPermission('applications.vote');
  const canViewVoteDetails = (): boolean => hasPermission('votes.view');
  const canSync = (): boolean => isSuperAdmin();
  const canListUsers = (): boolean => hasPermission('users.list') || isUserAdmin();
  const canEditUser = (): boolean => hasPermission('users.edit') || isUserAdmin();
  const canDeleteUser = (): boolean => hasPermission('users.delete') || isSuperAdmin();
  const canListUserPermissions = (): boolean => isUserAdmin();
  const canAddUserPermission = (): boolean => isUserAdmin();
  const canDeleteUserPermission = (): boolean => isUserAdmin();
  const canListUserVotes = (): boolean => hasPermission('votes.view') || isVoteAdmin();
  const canDeleteUserVote = (): boolean => hasPermission('votes.delete') || isVoteAdmin();

  return {
    // Verificación de grupos
    hasGroup,
    isSuperAdmin,
    isUserAdmin,
    isVoteAdmin,
    isMiembro,
    isTrainee,

    // Verificación de permisos
    hasPermission,
    getPermissions,

    // Métodos de compatibilidad
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

    // Grupos del usuario
    grupos: usuario?.grupos || [],
  };
};

