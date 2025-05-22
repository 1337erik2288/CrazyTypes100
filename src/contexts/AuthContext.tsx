import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  AuthError
} from 'firebase/auth';
import { auth } from '../firebase'; // Убедитесь, что путь к вашему firebase.ts правильный

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<User | null>;
  signIn: (email: string, password: string) => Promise<User | null>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signUp = async (email: string, password: string): Promise<User | null> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing up:", (error as AuthError).message);
      throw error; // Пробрасываем ошибку
    }
  };

  const signIn = async (email: string, password: string): Promise<User | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing in:", (error as AuthError).message);
      throw error; // Пробрасываем ошибку
    }
  };

  const logOut = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", (error as AuthError).message);
      throw error; // Пробрасываем ошибку
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe; // Отписка при размонтировании компонента
  }, []);

  const value = {
    currentUser,
    loading,
    signUp,
    signIn,
    logOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};