import { firestore } from "@/lib/firebase.config";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import type { Vote, VoteSummary } from "@/types/vote";

export const firestoreVoteService = {
  // Guardar un voto en Firestore
  // Ruta: /applications/{applicationRut}/votes/{userId}
  saveVote: async (applicationRut: string, vote: Vote): Promise<void> => {
    try {
      const voteDocRef = doc(
        firestore,
        "applications",
        applicationRut,
        "votes",
        vote.userId
      );
      await setDoc(voteDocRef, vote, { merge: true });
    } catch (error) {
      console.error("Error al guardar voto en Firestore:", error);
      throw error;
    }
  },

  // Obtener el voto de un usuario para una aplicación
  getUserVote: async (applicationRut: string, userId: string): Promise<Vote | null> => {
    try {
      const voteDocRef = doc(
        firestore,
        "applications",
        applicationRut,
        "votes",
        userId
      );
      const voteSnapshot = await getDoc(voteDocRef);
      return voteSnapshot.exists() ? (voteSnapshot.data() as Vote) : null;
    } catch (error) {
      console.error("Error al obtener voto de Firestore:", error);
      throw error;
    }
  },

  // Obtener todos los votos de una aplicación
  getApplicationVotes: async (applicationRut: string): Promise<Vote[]> => {
    try {
      const votesRef = collection(firestore, "applications", applicationRut, "votes");
      const votesSnapshot = await getDocs(votesRef);
      const votes: Vote[] = [];
      votesSnapshot.forEach((doc) => {
        votes.push(doc.data() as Vote);
      });
      return votes;
    } catch (error) {
      console.error("Error al obtener votos de la aplicación:", error);
      throw error;
    }
  },

  // Obtener resumen de votos de una aplicación
  getVoteSummary: async (applicationRut: string): Promise<VoteSummary> => {
    try {
      const votes = await firestoreVoteService.getApplicationVotes(applicationRut);
      const aprobar = votes.filter((v) => v.vote === "aprobar").length;
      const rechazar = votes.filter((v) => v.vote === "rechazar").length;

      return {
        applicationRut,
        totalVotes: votes.length,
        aprobar,
        rechazar,
        votes,
      };
    } catch (error) {
      console.error("Error al obtener resumen de votos:", error);
      throw error;
    }
  },
};

