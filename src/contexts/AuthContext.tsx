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
import {doc, getDoc, setDoc, query, where, collection, getDocs} from "firebase/firestore";
import {AuthContext} from "@/hooks/useAuth";
import type {Usuario} from "@/types/user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  const loadUserGroups = async (authUser: User) => {
    try {
      const userDocRef = doc(firestore, "users", authUser.uid);
      const userSnapshot = await getDoc(userDocRef);

      if (!userSnapshot.exists()) {
        console.log({ authUser });
        await setDoc(userDocRef, {
          email: authUser.email || "",
          displayName: authUser.displayName || null,
          photoURL: authUser.photoURL || null,
        });
      }

      const grupoQuery = query(collection(firestore, "permission-groups"), where("users", "array-contains", authUser.email));
      const grupoSnapshot = await getDocs(grupoQuery);
      const usuario: Usuario = {
        email: authUser.email || "",
        displayName: authUser.displayName || undefined,
        photoURL: authUser.photoURL || undefined,
        ...(userSnapshot.exists() ? userSnapshot.data() as Usuario : {}),
        grupos: grupoSnapshot.docs.map(it => it.id),
      }


      setUsuario(usuario);
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      setUsuario({
        email: authUser.email || "",
        displayName: authUser.displayName || undefined,
        photoURL: authUser.photoURL || undefined,
        grupos: [],
      });
    }
  };

  useEffect(() => {
    return onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);

      if (authUser) {
        await loadUserGroups(authUser);
        setLoading(false);
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
      await loadUserGroups(credential.user);
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
