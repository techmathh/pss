import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { isDeveloperEmail } from './utils';

export interface UserData {
  email: string;
  displayName: string;
  role: string;
  createdAt: number;
}

interface AuthContextType {
  user: User | null;
  role: string | null;
  userData: UserData | null;
  loading: boolean;
  login: (username?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  userData: null,
  loading: true,
  login: async () => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const prevUserDataRef = useRef<UserData | null>(null);

  useEffect(() => {
    let unsubFirestore: (() => void) | null = null;
    
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const docRef = doc(db, 'users', u.uid);
          unsubFirestore = onSnapshot(docRef, async (docSnap) => {
            if (docSnap.exists()) {
              let fetchedRole = docSnap.data().role;
              if (isDeveloperEmail(u.email)) {
                fetchedRole = 'developer';
              }
              setRole(fetchedRole);
              const newUserData = {...docSnap.data() as UserData, role: fetchedRole};
              setUserData(newUserData);
              prevUserDataRef.current = newUserData;
            } else {
              // Document was deleted! (Or doesn't exist yet)
              let newRole = 'admin';
              if (isDeveloperEmail(u.email)) {
                newRole = 'developer';
              }
              
              // Only create if we JUST logged in. If we receive a snapshot where doc is missing
              // AFTER it existed, it means the user was deleted by an admin. We should log them out.
              if (prevUserDataRef.current && prevUserDataRef.current.email === u.email) {
                 // Document was deleted by another admin, log this user out!
                 await signOut(auth);
                 setRole(null);
                 setUserData(null);
                 prevUserDataRef.current = null;
              } else {
                 // First creation
                 const newUserData: UserData = {
                   email: u.email || '',
                   displayName: newRole === 'developer' ? 'Developer' : 'Administrator',
                   role: newRole,
                   createdAt: Date.now()
                 };
                 try {
                   await setDoc(docRef, newUserData);
                 } catch (err: any) {
                    console.error("Could not create user document:", err);
                 }
              }
            }
          });
        } catch (error: any) {
           handleFirestoreError(error, OperationType.GET, 'users');
        }
      } else {
        if (unsubFirestore) {
          unsubFirestore();
          unsubFirestore = null;
        }
        setRole(null);
        setUserData(null);
        prevUserDataRef.current = null;
      }
      setLoading(false);
    });
    return () => {
      unsubAuth();
      if (unsubFirestore) unsubFirestore();
    };
  }, []);

  const login = async (username?: string, password?: string) => {
    if (!username || !password) throw new Error("Username dan Password dibutuhkan");
    const email = username.includes('@') ? username : `${username}@admin.com`;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        throw new Error('Username atau password salah.');
      } else {
        throw error;
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, role, userData, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
