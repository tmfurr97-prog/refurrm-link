import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, getIdTokenResult, onIdTokenChanged } from 'firebase/auth';
import { auth, syncUserProfile } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        await syncUserProfile(nextUser);
      } catch (error) {
        console.error('Profile sync failed:', error);
      }

      try {
        const tokenResult = await getIdTokenResult(nextUser);
        setIsAdmin(tokenResult.claims.admin === true);
      } catch (error) {
        console.error('Failed to read auth claims:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
