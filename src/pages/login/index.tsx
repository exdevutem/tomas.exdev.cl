import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import {useEffect} from "react";
import { navigate } from "wouter/use-browser-location";

export const Login = () => {
  const { signInWithGoogle, loading, user } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  useEffect(() => {
    if(user && !loading) {
      navigate("/")
    }
  }, [user, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Dashboard de Postulaciones</CardTitle>
          <CardDescription className="text-lg mt-2">Club ExDev</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-muted-foreground">
            <p>Inicia sesión con tu cuenta de Google para acceder al dashboard y revisar las postulaciones.</p>
          </div>
          <Button
            onClick={handleGoogleSignIn}
            className="w-full"
            size="lg"
            disabled={loading}
          >
            <img src={"/logos/google-white.svg"} alt="Google Logo" className="h-5 w-5 mr-3 " />
            {loading ? 'Cargando...' : 'Continuar con Google'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

