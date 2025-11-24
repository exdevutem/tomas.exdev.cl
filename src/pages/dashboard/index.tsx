import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home } from "@/pages/home";
import { VotingResults } from "@/pages/voting";
import { BarChart3, Users, Lock, LogOut } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Dashboard = () => {
  const { canViewApplications, canViewVoteDetails } = usePermissions();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

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

  const defaultTab = canViewVoteDetails() ? "postulaciones" : "postulaciones";

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <TabsList className={`grid w-full ${canViewVoteDetails() ? "max-w-md grid-cols-2" : "max-w-xs grid-cols-1"}`}>
            <TabsTrigger value="postulaciones" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Postulaciones
            </TabsTrigger>
            {canViewVoteDetails() && (
              <TabsTrigger value="votacion" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Votación
              </TabsTrigger>
            )}
          </TabsList>
        </div>
      </div>

      <TabsContent value="postulaciones" className="mt-0">
        <Home />
      </TabsContent>

      {canViewVoteDetails() && (
        <TabsContent value="votacion" className="mt-0">
          <VotingResults />
        </TabsContent>
      )}
    </Tabs>
  );
};

