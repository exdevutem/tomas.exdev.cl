import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import {Route, type RouteProps} from "wouter";
import {useEffect} from "react";
import {navigate} from "wouter/use-browser-location";

export type ProtectedRouteProps = RouteProps

export const ProtectedRoute = (props: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if(!loading && !user) {
      navigate("/login")
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return <Route {...props}/>
};

