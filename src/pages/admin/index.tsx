import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { userService } from "@/services/userService";
import type { UserProfile } from "@/types/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Lock, Edit, Trash2, LogOut, Users } from "lucide-react";
import { UserEditModal } from "@/components/UserEditModal";
import { toast } from "sonner";

export const AdminUsers = () => {
  const { canListUsers, canEditUser, canDeleteUser } = usePermissions();
  const { user, signOut } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await userService.getAllUsers();
      setUsers(fetchedUsers);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canListUsers()) {
      fetchUsers();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditClick = (user: UserProfile) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedUser(null);
      // Recargar usuarios después de cerrar el modal
      fetchUsers();
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!canDeleteUser()) {
      toast.error("No tienes permiso para eliminar usuarios");
      return;
    }

    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      return;
    }

    try {
      await userService.deleteUser(uid);
      toast.success("Usuario eliminado exitosamente");
      fetchUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar usuario");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (!canListUsers()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-destructive" />
              <CardTitle>Acceso Denegado</CardTitle>
            </div>
            <CardDescription>No tienes permiso para ver la lista de usuarios</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Necesitas el permiso "admin.user.list" para acceder a esta página.
            </p>
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
            <CardDescription>No se pudieron cargar los usuarios</CardDescription>
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
              <h1 className="text-3xl font-bold">Administración de Usuarios</h1>
              <p className="text-muted-foreground mt-2">Gestiona los usuarios de la plataforma</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2"
              >
                Volver al inicio
              </Button>
            </div>
          </div>

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
                  <p className="font-medium">{user.displayName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
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
          )}
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <CardTitle>Lista de Usuarios ({users.length})</CardTitle>
            </div>
            <CardDescription>
              Usuarios registrados en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay usuarios registrados</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Imagen</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Permisos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userProfile) => (
                    <TableRow key={userProfile.uid}>
                      <TableCell className="font-mono text-xs">{userProfile.uid.substring(0, 8)}...</TableCell>
                      <TableCell>
                        {userProfile.photoURL ? (
                          <img
                            src={userProfile.photoURL}
                            alt={userProfile.displayName || "Usuario"}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <Users className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{userProfile.displayName || "Sin nombre"}</TableCell>
                      <TableCell>{userProfile.email}</TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {userProfile.grupos?.length || 0} grupo(s)
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {canEditUser() && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(userProfile)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              Editar
                            </Button>
                          )}
                          {canDeleteUser() && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(userProfile.uid)}
                              className="flex items-center gap-1 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                              Eliminar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Edit Modal */}
      <UserEditModal
        user={selectedUser}
        open={isModalOpen}
        onOpenChange={handleModalClose}
      />
    </div>
  );
};
