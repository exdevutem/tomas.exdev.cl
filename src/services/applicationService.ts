import { firestore } from "@/lib/firebase.config";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import type { Application } from "@/types/application";

export const applicationService = {
  // Obtener todas las aplicaciones de la API
  getAllApplicationsFromAPI: async (): Promise<Application[]> => {
    try {
      const response = await fetch("/api/applications");
      if (!response.ok) {
        throw new Error(`Error al obtener aplicaciones de la API: ${response.status}`);
      }
      const data = await response.json();
      return data.postulaciones || [];
    } catch (error) {
      console.error("Error al obtener aplicaciones de la API:", error);
      throw error;
    }
  },

  // Obtener todas las aplicaciones de Firestore
  getAllApplicationsFromFirestore: async (): Promise<Application[]> => {
    try {
      const applicationsRef = collection(firestore, "applications");
      const snapshot = await getDocs(applicationsRef);
      const applications: Application[] = [];
      snapshot.forEach((doc) => {
        applications.push(doc.data() as Application);
      });
      return applications;
    } catch (error) {
      console.error("Error al obtener aplicaciones de Firestore:", error);
      throw error;
    }
  },

  // Obtener el total de aplicaciones en Firestore
  getFirestoreApplicationCount: async (): Promise<number> => {
    try {
      const applicationsRef = collection(firestore, "applications");
      const snapshot = await getDocs(applicationsRef);
      return snapshot.size;
    } catch (error) {
      console.error("Error al obtener el total de aplicaciones de Firestore:", error);
      throw error;
    }
  },

  // Sincronizar aplicaciones de la API a Firestore
  syncApplicationsToFirestore: async (applications: Application[]): Promise<{ synced: number; failed: number }> => {
    try {
      let synced = 0;
      let failed = 0;

      for (const application of applications) {
        try {
          const docRef = doc(firestore, "applications", application.rut);
          await setDoc(docRef, application, { merge: true });
          synced++;
        } catch (error) {
          console.error(`Error al sincronizar aplicación con RUT ${application.rut}:`, error);
          failed++;
        }
      }

      return { synced, failed };
    } catch (error) {
      console.error("Error al sincronizar aplicaciones a Firestore:", error);
      throw error;
    }
  },

  // Sincronizar si es necesario (comparar números)
  syncIfNeeded: async (applications: Application[]): Promise<{ needsSync: boolean; synced: number; failed: number }> => {
    try {
      const firestoreCount = await applicationService.getFirestoreApplicationCount();

      if (firestoreCount !== applications.length) {
        const result = await applicationService.syncApplicationsToFirestore(applications);
        return { needsSync: true, ...result };
      }

      return { needsSync: false, synced: 0, failed: 0 };
    } catch (error) {
      console.error("Error en syncIfNeeded:", error);
      throw error;
    }
  },

  // Obtener aplicaciones de Firestore y sincronizar automáticamente si es necesario
  getApplicationsWithAutoSync: async (): Promise<{ applications: Application[]; autoSynced: boolean; syncResult?: { synced: number; failed: number } }> => {
    try {
      // Obtener aplicaciones desde ambas fuentes
      const [apiApplications, firestoreApplications] = await Promise.all([
        applicationService.getAllApplicationsFromAPI(),
        applicationService.getAllApplicationsFromFirestore(),
      ]);

      // Comparar cantidades
      if (apiApplications.length !== firestoreApplications.length) {
        console.log(
          `Diferencia detectada: API tiene ${apiApplications.length} aplicaciones, Firestore tiene ${firestoreApplications.length}. Sincronizando...`
        );
        // Sincronizar automáticamente
        const syncResult = await applicationService.syncApplicationsToFirestore(apiApplications);
        return {
          applications: apiApplications,
          autoSynced: true,
          syncResult,
        };
      }

      // Si están sincronizadas, retornar las de Firestore
      return {
        applications: firestoreApplications,
        autoSynced: false,
      };
    } catch (error) {
      console.error("Error en getApplicationsWithAutoSync:", error);
      throw error;
    }
  },
};

