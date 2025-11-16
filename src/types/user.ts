export interface Usuario {
  email: string;
  permissions: string[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  permissions: string[];
}

