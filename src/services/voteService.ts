import type { Vote, VoteSummary } from "@/types/vote";

const VOTES_STORAGE_KEY = "exdev_votes";

export const voteService = {
  // Obtener todos los votos
  getAllVotes: (): Vote[] => {
    const votes = localStorage.getItem(VOTES_STORAGE_KEY);
    return votes ? JSON.parse(votes) : [];
  },

  // Guardar un voto
  saveVote: (vote: Vote): void => {
    const votes = voteService.getAllVotes();
    votes.push(vote);
    localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes));
  },

  // Verificar si un usuario ya votó por una postulación
  hasUserVoted: (userId: string, applicationId: number): boolean => {
    const votes = voteService.getAllVotes();
    return votes.some(
      (vote) => vote.userId === userId && vote.applicationId === applicationId
    );
  },

  // Obtener el voto de un usuario para una postulación
  getUserVote: (userId: string, applicationId: number): Vote | undefined => {
    const votes = voteService.getAllVotes();
    return votes.find(
      (vote) => vote.userId === userId && vote.applicationId === applicationId
    );
  },

  // Obtener resumen de votos por postulación
  getVoteSummary: (applicationId: number): VoteSummary => {
    const votes = voteService.getAllVotes().filter(
      (vote) => vote.applicationId === applicationId
    );

    const aprobar = votes.filter((vote) => vote.vote === "aprobar").length;
    const rechazar = votes.filter((vote) => vote.vote === "rechazar").length;

    return {
      applicationId,
      totalVotes: votes.length,
      aprobar,
      rechazar,
      votes,
    };
  },

  // Obtener todos los resúmenes de votos
  getAllVoteSummaries: (): VoteSummary[] => {
    const votes = voteService.getAllVotes();
    const applicationIds = [...new Set(votes.map((vote) => vote.applicationId))];

    return applicationIds.map((id) => voteService.getVoteSummary(id));
  },
};

