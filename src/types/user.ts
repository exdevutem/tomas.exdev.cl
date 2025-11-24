/**
 * Nuevo sistema de permisos basado en grupos
 *
 * Grupos disponibles:
 * - superadmin: Acceso total a todo
 * - user-admin: Editar usuarios del grupo
 * - vote-admin: Eliminar votos de usuarios
 * - miembro: Votar y ver aplicaciones
 * - trainee: Solo ver aplicaciones
 */

export interface Usuario {
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  grupos: string[]; // Lista de nombres de grupos a los que pertenece
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  grupos: string[];
}

/**
 * Estructura de un grupo de permisos
 * Documento: permission-groups/{groupName}
 */
export interface PermissionGroup {
  name: string; // superadmin, user-admin, vote-admin, miembro, trainee
  description?: string;
  users: string[]; // Lista de correos de usuarios en este grupo
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Permisos que tiene cada grupo
 */
export type GroupName = 'superadmin' | 'user-admin' | 'vote-admin' | 'miembro' | 'trainee';

export const GROUP_PERMISSIONS: Record<GroupName, string[]> = {
  superadmin: [
    'users.list',
    'users.edit',
    'users.delete',
    'users.assign-groups',
    'votes.delete',
    'votes.view',
    'applications.view',
    'applications.create',
    'applications.edit',
    'applications.delete',
    'applications.vote',
  ],
  'user-admin': [
    'users.edit',
    'users.assign-groups',
    'votes.view',
    'applications.view',
    'applications.vote',
  ],
  'vote-admin': [
    'votes.delete',
    'votes.view',
    'applications.view',
  ],
  miembro: [
    'applications.view',
    'applications.vote',
  ],
  trainee: [
    'applications.view',
  ],
};

