import { firestore } from '@/lib/firebase.config';
import { doc, getDoc, updateDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { PermissionGroup, GroupName } from '@/types/user';

/**
 * Servicio para gestionar grupos de permisos
 * Los grupos se almacenan en Firestore en: permission-groups/{groupName}
 */

export const permissionsService = {
  /**
   * Obtener un grupo de permisos
   */
  getGroup: async (groupName: string): Promise<PermissionGroup | null> => {
    try {
      const groupDocRef = doc(firestore, 'permission-groups', groupName);
      const groupSnapshot = await getDoc(groupDocRef);

      if (!groupSnapshot.exists()) {
        return null;
      }

      return groupSnapshot.data() as PermissionGroup;
    } catch (error) {
      console.error(`Error al obtener grupo ${groupName}:`, error);
      throw error;
    }
  },

  /**
   * Crear o actualizar un grupo de permisos
   */
  setGroup: async (
    groupName: string,
    group: Partial<PermissionGroup>
  ): Promise<void> => {
    try {
      const groupDocRef = doc(firestore, 'permission-groups', groupName);

      await setDoc(groupDocRef, {
        name: groupName,
        ...group,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      console.error(`Error al crear/actualizar grupo ${groupName}:`, error);
      throw error;
    }
  },

  /**
   * Agregar un usuario a un grupo (por email)
   */
  addUserToGroup: async (
    groupName: string,
    email: string
  ): Promise<void> => {
    try {
      const groupDocRef = doc(firestore, 'permission-groups', groupName);

      // Verificar que el grupo existe
      const groupSnap = await getDoc(groupDocRef);
      if (!groupSnap.exists()) {
        throw new Error(`El grupo '${groupName}' no existe`);
      }

      // Agregar email a la lista si no existe
      const currentUsers = groupSnap.data().users || [];
      if (!currentUsers.includes(email)) {
        await updateDoc(groupDocRef, {
          users: arrayUnion(email),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(`Error al agregar usuario a grupo ${groupName}:`, error);
      throw error;
    }
  },

  /**
   * Remover un usuario de un grupo (por email)
   */
  removeUserFromGroup: async (
    groupName: string,
    email: string
  ): Promise<void> => {
    try {
      const groupDocRef = doc(firestore, 'permission-groups', groupName);

      await updateDoc(groupDocRef, {
        users: arrayRemove(email),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Error al remover usuario de grupo ${groupName}:`, error);
      throw error;
    }
  },

  /**
   * Obtener todos los grupos a los que pertenece un usuario (por email)
   */
  getUserGroups: async (email: string): Promise<string[]> => {
    try {
      const groups: string[] = [];
      const groupNames: GroupName[] = ['superadmin', 'user-admin', 'vote-admin', 'miembro', 'trainee'];

      for (const groupName of groupNames) {
        const group = await permissionsService.getGroup(groupName);
        if (group && group.users && group.users.includes(email)) {
          groups.push(groupName);
        }
      }

      return groups;
    } catch (error) {
      console.error(`Error al obtener grupos del usuario ${email}:`, error);
      throw error;
    }
  },

  /**
   * Actualizar los grupos de un usuario
   */
  setUserGroups: async (
    email: string,
    newGroups: string[]
  ): Promise<void> => {
    try {
      const currentGroups = await permissionsService.getUserGroups(email);

      // Remover usuario de grupos actuales que no están en newGroups
      for (const oldGroup of currentGroups) {
        if (!newGroups.includes(oldGroup)) {
          await permissionsService.removeUserFromGroup(oldGroup, email);
        }
      }

      // Agregar usuario a nuevos grupos
      for (const newGroup of newGroups) {
        if (!currentGroups.includes(newGroup)) {
          await permissionsService.addUserToGroup(newGroup, email);
        }
      }
    } catch (error) {
      console.error(`Error al actualizar grupos del usuario ${email}:`, error);
      throw error;
    }
  },
};

