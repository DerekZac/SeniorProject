import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getSession, logout as doLogout, type Session } from '../lib/auth';

interface AuthContextValue {
  session: Session | null;
  isAuthenticated: boolean;
  refresh: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => getSession());

  const refresh = () => setSession(getSession());

  const logout = () => {
    doLogout();
    setSession(null);
  };

  useEffect(() => {
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <AuthContext.Provider value={{ session, isAuthenticated: !!session, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
