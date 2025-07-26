
export interface User {
  id: string;
  email?: string;
  phone?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  balance: number;
  invite_code?: string;
  online_status?: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: { [key: string]: any }) => Promise<void>;
}
