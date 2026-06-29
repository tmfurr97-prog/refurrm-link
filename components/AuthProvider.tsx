import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, syncUserProfile } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  proAccess: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false, proAccess: false });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [proAccess, setProAccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Sync profile
        await syncUserProfile(user);
        
        // Basic admin check (could be enhanced with a Firestore lookup)
        // For now, we'll use the hardcoded admin emails as a secondary check if needed
        const admins = ['harleygirley97@gmail.com', 'tree@refurrm.org', 'admin@refurrm.org'];
        const isUserAdmin = admins.includes(user.email || '');
        setIsAdmin(isUserAdmin);
        setProAccess(isUserAdmin); // Give pro access to admins
      } else {
        setIsAdmin(false);
        setProAccess(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, proAccess }}>
      {children}
    </AuthContext.Provider>
  );
};
