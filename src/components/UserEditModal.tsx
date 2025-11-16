import { useState, useEffect } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { userService } from "@/services/userService";
import type { UserProfile } from "@/types/user";
import type { Vote } from "@/types/vote";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, Trash2, Vote as VoteIcon, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface UserEditModalProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserVote extends Vote {
  applicationRut: string;
}

export const UserEditModal = ({ user, open, onOpenChange }: UserEditModalProps) => {
  const {
    canListUserPermissions,
    canAddUserPermission,
    canDeleteUserPermission,
    canDeleteUser,
    canListUserVotes,
    canDeleteUserVote,
  } = usePermissions();

  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [newPermission, setNewPermission] = useState("");
  const [userVotes, setUserVotes] = useState<UserVote[]>([]);
  const [loading, setLoading] = useState(false);
  const [votesLoading, setVotesLoading] = useState(false);

  const loadUserVotes = async () => {
    if (!user) return;
    
    try {
      setVotesLoading(true);
      const votes = await userService.getUserVotes(user.uid);
      setUserVotes(votes);
    } catch (error) {
      console.error("Error loading votes:", error);
      toast.error("Error al cargar votos del usuario");
    } finally {
      setVotesLoading(false);
    }
  };

  useEffect(() => {
    if (user && open) {
      setUserPermissions(user.permissions);
      if (canListUserVotes()) {
        loadUserVotes();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, open, canListUserVotes]);

  const handleAddPermission = async () => {
    if (!user || !newPermission.trim()) return;

    if (!canAddUserPermission()) {
      toast.error("No tienes permiso para agregar permisos");
      return;
    }

    try {
      setLoading(true);
      await userService.addPermission(user.uid, newPermission.trim());
      setUserPermissions([...userPermissions, newPermission.trim()]);
      setNewPermission("");
      toast.success("Permiso agregado exitosamente");
    } catch (error) {
      toast.error("Error al agregar permiso");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePermission = async (permission: string) => {
    if (!user) return;

    if (!canDeleteUserPermission()) {
      toast.error("No tienes permiso para eliminar permisos");
      return;
    }

    try {
      setLoading(true);
      await userService.removePermission(user.uid, permission);
      setUserPermissions(userPermissions.filter((p) => p !== permission));
      toast.success("Permiso eliminado exitosamente");
    } catch (error) {
      toast.error("Error al eliminar permiso");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;

    if (!canDeleteUser()) {
      toast.error("No tienes permiso para eliminar usuarios");
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario ${user.email}?`)) {
      return;
    }

    try {
      setLoading(true);
      await userService.deleteUser(user.uid);
      toast.success("Usuario eliminado exitosamente");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar usuario");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVote = async (applicationRut: string) => {
    if (!user) return;

    if (!canDeleteUserVote()) {
      toast.error("No tienes permiso para eliminar votos");
      return;
    }

    if (!confirm("¿Estás seguro de que deseas eliminar este voto?")) {
      return;
    }

    try {
      await userService.deleteUserVote(user.uid, applicationRut);
      setUserVotes(userVotes.filter((v) => v.applicationRut !== applicationRut));
      toast.success("Voto eliminado exitosamente");
    } catch (error) {
      toast.error("Error al eliminar voto");
      console.error(error);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Gestiona los permisos y acciones del usuario {user.email}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName || "Usuario"}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <p className="font-semibold text-lg">{user.displayName || "Sin nombre"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground font-mono">ID: {user.uid}</p>
          </div>
        </div>

        <Tabs defaultValue="permissions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="permissions" disabled={!canListUserPermissions()}>
              <Shield className="w-4 h-4 mr-2" />
              Permisos
            </TabsTrigger>
            <TabsTrigger value="votes" disabled={!canListUserVotes()}>
              <VoteIcon className="w-4 h-4 mr-2" />
              Votaciones
            </TabsTrigger>
            <TabsTrigger value="danger" disabled={!canDeleteUser()}>
              <Trash2 className="w-4 h-4 mr-2" />
              Zona de Peligro
            </TabsTrigger>
          </TabsList>

          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Gestionar Permisos</CardTitle>
                <CardDescription>
                  Agrega o elimina permisos del usuario
                </CardDescription>
              </CardHeader>
              <CardContent>
                {canAddUserPermission() && (
                  <div className="mb-6">
                    <Label htmlFor="new-permission">Agregar Nuevo Permiso</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        id="new-permission"
                        type="text"
                        value={newPermission}
                        onChange={(e) => setNewPermission(e.target.value)}
                        placeholder="Ej: admin.user.list"
                        className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddPermission();
                          }
                        }}
                      />
                      <Button
                        onClick={handleAddPermission}
                        disabled={loading || !newPermission.trim()}
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Permisos Actuales ({userPermissions.length})</Label>
                  <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                    {userPermissions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Este usuario no tiene permisos asignados
                      </p>
                    ) : (
                      userPermissions.map((permission) => (
                        <div
                          key={permission}
                          className="flex items-center justify-between p-2 bg-muted rounded-md"
                        >
                          <Badge variant="secondary">{permission}</Badge>
                          {canDeleteUserPermission() && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePermission(permission)}
                              disabled={loading}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="votes">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Votaciones</CardTitle>
                <CardDescription>
                  Votos realizados por el usuario
                </CardDescription>
              </CardHeader>
              <CardContent>
                {votesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : userVotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Este usuario no ha realizado votaciones
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {userVotes.map((vote) => (
                      <div
                        key={vote.applicationRut}
                        className="p-3 border rounded-lg flex items-start justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={vote.vote === "aprobar" ? "default" : "destructive"}
                            >
                              {vote.vote === "aprobar" ? "Aprobar" : "Rechazar"}
                            </Badge>
                            <span className="text-sm font-mono text-muted-foreground">
                              RUT: {vote.applicationRut}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {vote.justification || "Sin justificación"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(vote.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {canDeleteUserVote() && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteVote(vote.applicationRut)}
                            className="ml-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
                <CardDescription>
                  Acciones irreversibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Eliminar Usuario</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Esta acción eliminará permanentemente al usuario y todos sus datos.
                      Esta acción no se puede deshacer.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteUser}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Eliminando...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar Usuario
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
