export interface Vote {
  userId: string;
  userName: string;
  userEmail: string;
  applicationRut: string;
  vote: "aprobar" | "rechazar";
  justification: string;
  timestamp: string;
}

export interface VoteSummary {
  applicationRut: string;
  totalVotes: number;
  aprobar: number;
  rechazar: number;
  votes: Vote[];
}

