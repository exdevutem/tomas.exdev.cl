import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { firestoreVoteService } from "@/services/firestoreVoteService";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ThumbsUp, ThumbsDown, Users, TrendingUp, Loader2, Lock } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import type { VoteSummary } from "@/types/vote";

interface ApplicationVoteChartsProps {
  applicationRut: string;
}

export const ApplicationVoteCharts = ({ applicationRut }: ApplicationVoteChartsProps) => {
  const { canViewVoteDetails } = usePermissions();
  const [voteSummary, setVoteSummary] = useState<VoteSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVoteSummary = async () => {
      try {
        setLoading(true);
        const summary = await firestoreVoteService.getVoteSummary(applicationRut);
        setVoteSummary(summary);
      } catch (error) {
        console.error("Error al cargar resumen de votos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVoteSummary();
  }, [applicationRut]);

  if (!canViewVoteDetails()) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-destructive">
              <Lock className="w-5 h-5" />
              <h3 className="font-semibold">Acceso Denegado</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              No tienes permiso para ver el detalle de los votos. Necesitas el permiso "applications.vote.view" para acceder a esta información.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12">
        <Loader2 className="w-4 h-4 animate-spin" />
        <p className="text-muted-foreground">Cargando estadísticas de votos...</p>
      </div>
    );
  }

  if (!voteSummary) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No hay datos de votación disponibles</p>
        </CardContent>
      </Card>
    );
  }

  const pieChartData = [
    { name: "Aprobar", value: voteSummary.aprobar, color: "hsl(var(--primary))" },
    { name: "Rechazar", value: voteSummary.rechazar, color: "hsl(var(--destructive))" },
  ];

  const barChartData = [
    { name: "Votos", Aprobar: voteSummary.aprobar, Rechazar: voteSummary.rechazar },
  ];

  const percentage = voteSummary.totalVotes > 0
    ? ((voteSummary.aprobar / voteSummary.totalVotes) * 100).toFixed(1)
    : 0;

  const status = voteSummary.totalVotes === 0
    ? "sin-votos"
    : voteSummary.aprobar > voteSummary.rechazar
      ? "aprobada"
      : voteSummary.rechazar > voteSummary.aprobar
        ? "rechazada"
        : "empate";

  return (
    <div className="space-y-6">
      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Votos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{voteSummary.totalVotes}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" />
              Aprobar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-primary">{voteSummary.aprobar}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ThumbsDown className="w-4 h-4" />
              Rechazar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-destructive">{voteSummary.rechazar}</span>
          </CardContent>
        </Card>
      </div>

      {/* Estado y Porcentaje */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Estado de la Postulación</p>
              <div className="flex items-center gap-3">
                {status === "aprobada" && (
                  <Badge variant="default" className="text-lg py-2 px-4">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Aprobada
                  </Badge>
                )}
                {status === "rechazada" && (
                  <Badge variant="destructive" className="text-lg py-2 px-4">
                    Rechazada
                  </Badge>
                )}
                {status === "empate" && (
                  <Badge variant="secondary" className="text-lg py-2 px-4">
                    Empate
                  </Badge>
                )}
                {status === "sin-votos" && (
                  <Badge variant="outline" className="text-lg py-2 px-4">
                    Sin Votos
                  </Badge>
                )}
              </div>
            </div>
            {voteSummary.totalVotes > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-2">Porcentaje de Aprobación</p>
                <p className="text-4xl font-bold">{percentage}%</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {voteSummary.totalVotes > 0 ? (
        <>
          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico Circular */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Votos</CardTitle>
                <CardDescription>Proporción de aprobación vs rechazo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Barras */}
            <Card>
              <CardHeader>
                <CardTitle>Comparación de Votos</CardTitle>
                <CardDescription>Votos a favor vs en contra</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Aprobar" fill="hsl(var(--primary))" />
                    <Bar dataKey="Rechazar" fill="hsl(var(--destructive))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Votantes */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Votos</CardTitle>
              <CardDescription>
                {voteSummary.votes.length} {voteSummary.votes.length === 1 ? "voto registrado" : "votos registrados"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {voteSummary.votes.map((vote, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{vote.userName}</p>
                        <p className="text-sm text-muted-foreground">{vote.userEmail}</p>
                      </div>
                      <Badge variant={vote.vote === "aprobar" ? "default" : "destructive"}>
                        {vote.vote === "aprobar" ? (
                          <>
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            Aprobar
                          </>
                        ) : (
                          <>
                            <ThumbsDown className="w-3 h-3 mr-1" />
                            Rechazar
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium mb-1">Justificación:</p>
                      <p className="text-sm text-muted-foreground">{vote.justification}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(vote.timestamp).toLocaleString("es-CL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Aún no hay votos para esta postulación
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
