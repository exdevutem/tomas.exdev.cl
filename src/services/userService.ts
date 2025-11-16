import { firestore } from "@/lib/firebase.config";
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import type { UserProfile } from "@/types/user";

export const userService = {
  // Obtener todos los usuarios de Firestore
  getAllUsers: async (): Promise<UserProfile[]> => {
    try {
      const usersRef = collection(firestore, "users");
      const snapshot = await getDocs(usersRef);
      const users: UserProfile[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          uid: doc.id,
          email: data.email || "",
          displayName: data.displayName || null,
          photoURL: data.photoURL || null,
          permissions: data.permissions || [],
        });
      });
      
      return users;
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      throw error;
    }
  },

  // Obtener un usuario específico
  getUser: async (uid: string): Promise<UserProfile | null> => {
    try {
      const userDocRef = doc(firestore, "users", uid);
      const userSnapshot = await getDoc(userDocRef);
      
      if (!userSnapshot.exists()) {
        return null;
      }
      
      const data = userSnapshot.data();
      return {
        uid: userSnapshot.id,
        email: data.email || "",
        displayName: data.displayName || null,
        photoURL: data.photoURL || null,
        permissions: data.permissions || [],
      };
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      throw error;
    }
  },

  // Agregar permiso a un usuario
  addPermission: async (uid: string, permission: string): Promise<void> => {
    try {
      const userDocRef = doc(firestore, "users", uid);
      await updateDoc(userDocRef, {
        permissions: arrayUnion(permission),
      });
    } catch (error) {
      console.error("Error al agregar permiso:", error);
      throw error;
    }
  },

  // Eliminar permiso de un usuario
  removePermission: async (uid: string, permission: string): Promise<void> => {
    try {
      const userDocRef = doc(firestore, "users", uid);
      await updateDoc(userDocRef, {
        permissions: arrayRemove(permission),
      });
    } catch (error) {
      console.error("Error al eliminar permiso:", error);
      throw error;
    }
  },

  // Eliminar un usuario
  deleteUser: async (uid: string): Promise<void> => {
    try {
      // Verificar que no se está intentando eliminar al usuario actual
      const auth = getAuth();
      if (auth.currentUser?.uid === uid) {
        throw new Error("No puedes eliminar tu propio usuario");
      }
      
      const userDocRef = doc(firestore, "users", uid);
      await deleteDoc(userDocRef);
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      throw error;
    }
  },

  // Obtener votos de un usuario
  getUserVotes: async (userId: string) => {
    try {
      const votes: Array<{ applicationRut: string; userId: string; userName: string; userEmail: string; vote: "aprobar" | "rechazar"; justification: string; timestamp: string }> = [];
      // Obtener todas las aplicaciones
      const applicationsRef = collection(firestore, "applications");
      const applicationsSnapshot = await getDocs(applicationsRef);
      
      // Para cada aplicación, buscar el voto del usuario
      for (const appDoc of applicationsSnapshot.docs) {
        const voteRef = doc(firestore, "applications", appDoc.id, "votes", userId);
        const voteSnapshot = await getDoc(voteRef);
        
        if (voteSnapshot.exists()) {
          const voteData = voteSnapshot.data();
          votes.push({
            applicationRut: appDoc.id,
            userId: voteData.userId,
            userName: voteData.userName,
            userEmail: voteData.userEmail,
            vote: voteData.vote,
            justification: voteData.justification,
            timestamp: voteData.timestamp,
          });
        }
      }
      
      return votes;
    } catch (error) {
      console.error("Error al obtener votos del usuario:", error);
      throw error;
    }
  },

  // Eliminar un voto específico de un usuario
  deleteUserVote: async (userId: string, applicationRut: string): Promise<void> => {
    try {
      const voteDocRef = doc(firestore, "applications", applicationRut, "votes", userId);
      await deleteDoc(voteDocRef);
    } catch (error) {
      console.error("Error al eliminar voto:", error);
      throw error;
    }
  },
};
