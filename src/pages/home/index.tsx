import { useEffect, useState } from "react";
import type { Application } from "@/types/application";
import { ApplicationListCard } from "@/components/ApplicationListCard";
import { ApplicationDetailsModal } from "@/components/ApplicationDetailsModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Loader2, AlertCircle, LogOut, RefreshCw, Lock, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { applicationService } from "@/services/applicationService";
import { firestoreVoteService } from "@/services/firestoreVoteService";

export const Home = () => {
  const { canViewApplications, canSync, canListUsers } = usePermissions();
  const [applications, setApplications] = useState<Application[]>([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedApplicationIndex, setSelectedApplicationIndex] = useState<number>(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [autoSyncMessage, setAutoSyncMessage] = useState<string | null>(null);
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const result = await applicationService.getApplicationsWithAutoSync();

        let sortedApplications = result.applications.sort((a, b) => a.created_at.localeCompare(b.created_at));
        
        // Filtrar las aplicaciones que el usuario ya ha votado
        if (user) {
          const votedRuts = await firestoreVoteService.getVotedApplicationRuts(user.uid);
          sortedApplications = sortedApplications.filter(app => !votedRuts.has(app.rut));
        }
        
        setApplications(sortedApplications);
        setTotalApplications(sortedApplications.length);
        setApiUnavailable(result.apiUnavailable);

        // Mostrar mensaje si se sincronizó automáticamente
        if (result.autoSynced) {
          const syncResult = result.syncResult;
          setAutoSyncMessage(
            `✓ Sincronización automática: ${syncResult?.synced || 0} aplicaciones sincronizadas${
              syncResult && syncResult.failed > 0 ? `, ${syncResult.failed} errores` : ""
            }`
          );
          setTimeout(() => setAutoSyncMessage(null), 5000);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        console.error("Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const handleCardClick = (application: Application) => {
    const index = applications.findIndex(app => app.id === application.id);
    setSelectedApplication(application);
    setSelectedApplicationIndex(index);
    setIsModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedApplication(null);
      setSelectedApplicationIndex(-1);
    }
  };

  const handleNavigateNext = () => {
    if (selectedApplicationIndex < applications.length - 1) {
      const nextIndex = selectedApplicationIndex + 1;
      setSelectedApplicationIndex(nextIndex);
      setSelectedApplication(applications[nextIndex]);
    }
  };

  const handleNavigatePrevious = () => {
    if (selectedApplicationIndex > 0) {
      const prevIndex = selectedApplicationIndex - 1;
      setSelectedApplicationIndex(prevIndex);
      setSelectedApplication(applications[prevIndex]);
    }
  };

  const handleVoteSubmitted = () => {
    // Cuando se envía un voto, eliminar la aplicación de la lista
    if (selectedApplication) {
      const newApplications = applications.filter(app => app.rut !== selectedApplication.rut);
      setApplications(newApplications);
      setTotalApplications(prev => prev - 1);
      
      // Ajustar el índice después de eliminar
      if (newApplications.length > 0) {
        // El índice actual ahora apunta a la siguiente aplicación (porque removimos la actual)
        // pero necesitamos validar que no exceda el límite
        let newIndex = selectedApplicationIndex;
        if (newIndex >= newApplications.length) {
          // Si el índice está fuera de límites, ir a la última aplicación
          newIndex = newApplications.length - 1;
        }
        setSelectedApplicationIndex(newIndex);
        setSelectedApplication(newApplications[newIndex]);
      } else {
        // No hay más aplicaciones, cerrar el modal
        setIsModalOpen(false);
        setSelectedApplication(null);
        setSelectedApplicationIndex(-1);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleSyncApplications = async () => {
    try {
      setSyncLoading(true);
      setSyncMessage(null);

      const result = await applicationService.syncFromAPI();
      setSyncMessage(`✓ Sincronización completada: ${result.synced} aplicaciones sincronizadas${result.failed > 0 ? `, ${result.failed} errores` : ""}`);
      
      // Recargar las aplicaciones después de sincronizar
      const updatedResult = await applicationService.getApplicationsWithAutoSync();
      let sortedApplications = updatedResult.applications.sort((a, b) => a.created_at.localeCompare(b.created_at));
      
      if (user) {
        const votedRuts = await firestoreVoteService.getVotedApplicationRuts(user.uid);
        sortedApplications = sortedApplications.filter(app => !votedRuts.has(app.rut));
      }
      
      setApplications(sortedApplications);
      setTotalApplications(sortedApplications.length);
      // Actualizar estado de API basado en el resultado de la recarga
      setApiUnavailable(updatedResult.apiUnavailable);

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setSyncMessage(null), 5000);
    } catch (error) {
      console.error("Error al sincronizar aplicaciones:", error);
      setSyncMessage(`✗ Error al sincronizar: ${error instanceof Error ? error.message : "Error desconocido"}`);
      // Si la sincronización falla, marcar la API como no disponible
      setApiUnavailable(true);
    } finally {
      setSyncLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando postulaciones...</p>
        </div>
      </div>
    );
  }

  if (!canViewApplications()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-destructive" />
              <CardTitle>Acceso Denegado</CardTitle>
            </div>
            <CardDescription>No tienes permiso para ver las aplicaciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Necesitas el permiso "applications.view" para acceder a las postulaciones.
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <CardTitle>Error</CardTitle>
            </div>
            <CardDescription>No se pudieron cargar las postulaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-muted-foreground mt-2">Club ExDev</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-2 text-lg py-2 px-4">
                <Users className="w-5 h-5" />
                {totalApplications} {totalApplications === 1 ? "Postulación" : "Postulaciones"}
              </Badge>
              {canSync() && (
                <Button
                  onClick={handleSyncApplications}
                  disabled={syncLoading}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${syncLoading ? "animate-spin" : ""}`} />
                  {syncLoading ? "Sincronizando..." : "Sincronizar con Firestore"}
                </Button>
              )}
            </div>
          </div>

          {/* Auto Sync message */}
          {autoSyncMessage && (
            <div className="mb-4 p-3 rounded-lg text-sm bg-blue-50 text-blue-800 border border-blue-200">
              {autoSyncMessage}
            </div>
          )}

          {/* Sync message */}
          {syncMessage && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${syncMessage.startsWith("✓") ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
              {syncMessage}
            </div>
          )}

          {/* API Unavailable warning */}
          {apiUnavailable && (
            <div className="mb-4 p-3 rounded-lg text-sm bg-yellow-50 text-yellow-800 border border-yellow-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>La API de aplicaciones no está disponible. Mostrando datos desde Firestore. La sincronización no está disponible.</span>
            </div>
          )}

          {/* User info and logout */}
          {user && (
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "Usuario"}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{user.displayName} <span className={"text-xs text-gray-500"}>({ user.uid })</span></p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canListUsers() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/admin/users'}
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Admin Usuarios
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay postulaciones disponibles</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.map((application) => (
              <ApplicationListCard
                key={application.id}
                application={application}
                onClick={() => handleCardClick(application)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      <ApplicationDetailsModal
        application={selectedApplication}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onVoteSubmitted={handleVoteSubmitted}
        onNavigateNext={handleNavigateNext}
        onNavigatePrevious={handleNavigatePrevious}
        canNavigateNext={selectedApplicationIndex < applications.length - 1}
        canNavigatePrevious={selectedApplicationIndex > 0}
        currentIndex={selectedApplicationIndex}
        totalCount={applications.length}
      />
    </div>
  );
};
