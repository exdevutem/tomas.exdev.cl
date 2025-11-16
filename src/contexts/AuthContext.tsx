import {type ReactNode, useEffect, useState} from "react";
import type {User} from "firebase/auth";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut
} from "firebase/auth";
import {app, firestore} from "@/lib/firebase.config";
import {doc, onSnapshot, setDoc} from "firebase/firestore";
import {AuthContext} from "@/hooks/useAuth";
import type {Usuario} from "@/types/user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    return onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);

      if (authUser) {
        // Escuchar cambios en vivo del documento del usuario en Firestore
        const userDocRef = doc(firestore, "users", authUser.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data() as Usuario;
            setUsuario(userData);
          } else {
            // Si el documento no existe, crear uno con valores por defecto
            setUsuario({
              email: authUser.email || "",
              permissions: [],
            });
          }
          setLoading(false);
        }, (error) => {
          console.error("Error al sincronizar usuario:", error);
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setUsuario(null);
        setLoading(false);
      }
    });
  }, [auth]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const credential = await signInWithPopup(auth, provider);

      const ref = doc(firestore, "users", credential.user.uid);
      await setDoc(ref, {
        email: credential.user.email,
        displayName: credential.user.displayName,
        photoURL: credential.user.photoURL,
        permissions: [],
      }, { merge: true });
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, usuario, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
