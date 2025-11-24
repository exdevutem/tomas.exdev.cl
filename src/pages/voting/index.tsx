import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { firestoreVoteService } from "@/services/firestoreVoteService";
import { applicationService } from "@/services/applicationService";
import type { Application } from "@/types/application";
import type { VoteSummary } from "@/types/vote";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ThumbsUp, ThumbsDown, Users, TrendingUp, TrendingDown, Loader2, Lock, LogOut } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";

export const VotingResults = () => {
  const { canViewVoteDetails } = usePermissions();
  const { signOut } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [voteSummaries, setVoteSummaries] = useState<VoteSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Obtener aplicaciones desde Firestore
        const apps = await applicationService.getAllApplicationsFromFirestore();
        setApplications(apps);

        // Obtener resumen de votos para cada aplicación
        const summaries: VoteSummary[] = [];
        for (const app of apps) {
          const summary = await firestoreVoteService.getVoteSummary(app.rut);
          summaries.push(summary);
        }
        setVoteSummaries(summaries);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!canViewVoteDetails()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-destructive" />
              <CardTitle>Acceso Denegado</CardTitle>
            </div>
            <CardDescription>No tienes permiso para ver los resultados de votación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Necesitas el permiso "applications.vote.view" para acceder a los resultados de las votaciones.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  // Crear datos para el gráfico de barras
  const barChartData = applications.map((app) => {
    const summary = voteSummaries.find((v) => v.applicationRut === app.rut) || {
      aprobar: 0,
      rechazar: 0,
      totalVotes: 0,
    };

    return {
      nombre: app.nombre_completo.split(" ").slice(0, 2).join(" "),
      Aprobar: summary.aprobar,
      Rechazar: summary.rechazar,
    };
  });

  // Calcular totales generales
  const totalAprobar = voteSummaries.reduce((sum, v) => sum + v.aprobar, 0);
  const totalRechazar = voteSummaries.reduce((sum, v) => sum + v.rechazar, 0);
  const totalVotos = totalAprobar + totalRechazar;

  const pieChartData = [
    { name: "Aprobar", value: totalAprobar, color: "hsl(var(--primary))" },
    { name: "Rechazar", value: totalRechazar, color: "hsl(var(--destructive))" },
  ];

  // Postulaciones con más votos a favor
  const topApproved = [...voteSummaries]
    .filter((v) => v.aprobar > v.rechazar)
    .sort((a, b) => (b.aprobar - b.rechazar) - (a.aprobar - a.rechazar))
    .slice(0, 5);

  // Postulaciones con más votos en contra
  const topRejected = [...voteSummaries]
    .filter((v) => v.rechazar > v.aprobar)
    .sort((a, b) => (b.rechazar - b.aprobar) - (a.rechazar - a.aprobar))
    .slice(0, 5);

  const getApplicationName = (rut: string) => {
    const app = applications.find((a) => a.rut === rut);
    return app?.nombre_completo || "Desconocido";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Resultados de Votación</h1>
          <p className="text-muted-foreground mt-2">Estado actual de las postulaciones</p>
        </div>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Votos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-3xl font-bold">{totalVotos}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Aprobar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-primary" />
                <span className="text-3xl font-bold text-primary">{totalAprobar}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Rechazar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ThumbsDown className="w-5 h-5 text-destructive" />
                <span className="text-3xl font-bold text-destructive">{totalRechazar}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Postulaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                <span className="text-3xl font-bold">{applications.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Barras */}
          <Card>
            <CardHeader>
              <CardTitle>Votos por Postulante</CardTitle>
              <CardDescription>Comparación de votos a favor y en contra</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Aprobar" fill="hsl(var(--primary))" />
                  <Bar dataKey="Rechazar" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico Circular */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución General</CardTitle>
              <CardDescription>Proporción de votos totales</CardDescription>
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
        </div>

        {/* Top Postulaciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Más Aprobadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Postulaciones con más apoyo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topApproved.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay postulaciones aprobadas aún
                </p>
              ) : (
                <div className="space-y-3">
                  {topApproved.map((summary) => (
                    <div
                      key={summary.applicationRut}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {getApplicationName(summary.applicationRut)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {summary.totalVotes} votos totales
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="default" className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {summary.aprobar}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <ThumbsDown className="w-3 h-3" />
                          {summary.rechazar}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Más Rechazadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-destructive" />
                Postulaciones con más rechazo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topRejected.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay postulaciones rechazadas aún
                </p>
              ) : (
                <div className="space-y-3">
                  {topRejected.map((summary) => (
                    <div
                      key={summary.applicationRut}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {getApplicationName(summary.applicationRut)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {summary.totalVotes} votos totales
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {summary.aprobar}
                        </Badge>
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <ThumbsDown className="w-3 h-3" />
                          {summary.rechazar}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lista detallada de todas las postulaciones */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Detalle de Votaciones</CardTitle>
            <CardDescription>Estado detallado de cada postulación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {applications.map((app) => {
                const summary = voteSummaries.find((v) => v.applicationRut === app.rut) || {
                  aprobar: 0,
                  rechazar: 0,
                  totalVotes: 0,
                };

                const percentage = summary.totalVotes > 0
                  ? ((summary.aprobar / summary.totalVotes) * 100).toFixed(0)
                  : 0;

                return (
                  <div
                    key={app.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/30 rounded-lg gap-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{app.nombre_completo}</p>
                      <p className="text-sm text-muted-foreground">{app.correo_institucional}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{summary.aprobar}</p>
                        <p className="text-xs text-muted-foreground">Aprobar</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-destructive">{summary.rechazar}</p>
                        <p className="text-xs text-muted-foreground">Rechazar</p>
                      </div>
                      <div className="text-center min-w-[80px]">
                        <p className="text-2xl font-bold">{percentage}%</p>
                        <p className="text-xs text-muted-foreground">Aprobación</p>
                      </div>
                      {summary.totalVotes === 0 && (
                        <Badge variant="outline">Sin votos</Badge>
                      )}
                      {summary.totalVotes > 0 && summary.aprobar > summary.rechazar && (
                        <Badge variant="default">Aprobada</Badge>
                      )}
                      {summary.totalVotes > 0 && summary.rechazar > summary.aprobar && (
                        <Badge variant="destructive">Rechazada</Badge>
                      )}
                      {summary.totalVotes > 0 && summary.aprobar === summary.rechazar && (
                        <Badge variant="secondary">Empate</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

