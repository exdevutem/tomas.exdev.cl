import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {Switch, Route} from "wouter";
import {Home} from "@/pages/home";
import {Login} from "@/pages/login";

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <Switch>
      <ProtectedRoute path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />

      <Route>
        O.o ¡No se encontró esa página!
      </Route>
    </Switch>
  </AuthProvider>,
)
