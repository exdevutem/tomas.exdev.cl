import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {Switch, Route} from "wouter";
import {Home} from "@/pages/home";
import {Login} from "@/pages/login";
import {AdminUsers} from "@/pages/admin";
import { Toaster } from "sonner";

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <Toaster position="top-right" />
    <Switch>
      <ProtectedRoute path={"/"} component={Home} />
      <ProtectedRoute path={"/admin/users"} component={AdminUsers} />
      <Route path={"/login"} component={Login} />

      <Route>
        O.o ¡No se encontró esa página!
      </Route>
    </Switch>
  </AuthProvider>,
)
