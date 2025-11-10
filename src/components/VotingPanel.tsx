import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Check, X, Loader2, Lock } from "lucide-react";
import { firestoreVoteService } from "@/services/firestoreVoteService";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import type { Vote, VoteSummary } from "@/types/vote";

interface VotingPanelProps {
  applicationRut: string;
  onVoteSubmitted?: () => void;
}

export const VotingPanel = ({ applicationRut, onVoteSubmitted }: VotingPanelProps) => {
  const { user } = useAuth();
  const { canVote } = usePermissions();
  const [selectedVote, setSelectedVote] = useState<"aprobar" | "rechazar" | null>(null);
  const [justification, setJustification] = useState("");
  const [error, setError] = useState("");
  const [existingVote, setExistingVote] = useState<Vote | null>(null);
  const [voteSummary, setVoteSummary] = useState<VoteSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadVoteData = async () => {
      try {
        setLoading(true);
        // Obtener votos existentes del usuario
        if (user) {
          const userVote = await firestoreVoteService.getUserVote(applicationRut, user.uid);
          setExistingVote(userVote);
        }
        // Obtener resumen de votos
        const summary = await firestoreVoteService.getVoteSummary(applicationRut);
        setVoteSummary(summary);
      } catch (err) {
        console.error("Error al cargar datos de votación:", err);
        setError("Error al cargar los datos de votación");
      } finally {
        setLoading(false);
      }
    };

    loadVoteData();
  }, [applicationRut, user]);

  const handleSubmitVote = async () => {
    if (!user) return;

    if (!selectedVote) {
      setError("Debes seleccionar aprobar o rechazar");
      return;
    }

    if (!justification.trim() || justification.trim().length < 10) {
      setError("La justificación debe tener al menos 10 caracteres");
      return;
    }

    try {
      setSubmitting(true);
      const vote: Vote = {
        userId: user.uid,
        userName: user.displayName || "Usuario",
        userEmail: user.email || "",
        applicationRut,
        vote: selectedVote,
        justification: justification.trim(),
        timestamp: new Date().toISOString(),
      };

      await firestoreVoteService.saveVote(applicationRut, vote);
      setExistingVote(vote);
      setError("");

      // Recargar resumen de votos
      const updatedSummary = await firestoreVoteService.getVoteSummary(applicationRut);
      setVoteSummary(updatedSummary);

      if (onVoteSubmitted) {
        onVoteSubmitted();
      }
    } catch (err) {
      console.error("Error al guardar voto:", err);
      setError("Error al guardar el voto. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p className="text-muted-foreground">Cargando información de votación...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!canVote()) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-destructive">
              <Lock className="w-5 h-5" />
              <h3 className="font-semibold">Acceso Denegado</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              No tienes permiso para votar. Necesitas el rol "applications.vote.create" para participar en la votación.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (existingVote) {
    return (
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Tu voto ha sido registrado</h3>
              <Badge
                variant={existingVote.vote === "aprobar" ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {existingVote.vote === "aprobar" ? (
                  <>
                    <Check className="w-4 h-4" />
                    Aprobar
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Rechazar
                  </>
                )}
              </Badge>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm font-medium mb-2">Tu justificación:</p>
              <p className="text-sm text-muted-foreground">{existingVote.justification}</p>
            </div>

            {voteSummary && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{voteSummary.aprobar}</p>
                  <p className="text-sm text-muted-foreground">Aprobar</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-destructive">{voteSummary.rechazar}</p>
                  <p className="text-sm text-muted-foreground">Rechazar</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">¿Cuál es tu decisión?</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={selectedVote === "aprobar" ? "default" : "outline"}
                className="h-20 flex flex-col gap-2"
                onClick={() => {
                  setSelectedVote("aprobar");
                  setError("");
                }}
                disabled={submitting}
              >
                <ThumbsUp className="w-6 h-6" />
                <span>Aprobar</span>
              </Button>
              <Button
                variant={selectedVote === "rechazar" ? "destructive" : "outline"}
                className="h-20 flex flex-col gap-2"
                onClick={() => {
                  setSelectedVote("rechazar");
                  setError("");
                }}
                disabled={submitting}
              >
                <ThumbsDown className="w-6 h-6" />
                <span>Rechazar</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="justification">
              Justificación <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="justification"
              placeholder="Explica el motivo de tu decisión (mínimo 10 caracteres)..."
              value={justification}
              onChange={(e) => {
                setJustification(e.target.value);
                setError("");
              }}
              rows={4}
              className={error ? "border-destructive" : ""}
              disabled={submitting}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <Button
            onClick={handleSubmitVote}
            className="w-full"
            disabled={!selectedVote || !justification.trim() || submitting}
          >
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {submitting ? "Enviando..." : "Enviar Voto"}
          </Button>

          {voteSummary && voteSummary.totalVotes > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground text-center mb-3">
                Votos actuales: {voteSummary.totalVotes}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-primary">{voteSummary.aprobar}</p>
                  <p className="text-xs text-muted-foreground">Aprobar</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-destructive">{voteSummary.rechazar}</p>
                  <p className="text-xs text-muted-foreground">Rechazar</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

