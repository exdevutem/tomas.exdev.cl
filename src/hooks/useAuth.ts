import {createContext, useContext} from "react";
import type {User} from "firebase/auth";
import type {Usuario} from "@/types/user";

export interface AuthContextType {
    user: User | null;
    usuario: Usuario | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }
    return context;
};