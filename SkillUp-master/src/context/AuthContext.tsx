"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast({ title: "Signed In", description: "Welcome back!" });
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log("Sign-in popup closed or cancelled by user.");
        return;
      }
      
      console.error("Error signing in with Google: ", error);
      if (error.code === 'auth/unauthorized-domain') {
          toast({ 
              variant: 'destructive', 
              title: "Configuration Error", 
              description: "This app's domain is not authorized. Please add it to your Firebase project's authorized domains list in the Authentication settings.",
              duration: 9000
          });
      } else {
          toast({ 
              variant: 'destructive', 
              title: "Sign-in Error", 
              description: "Could not sign in with Google. Check the console for more info."
          });
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast({ title: "Signed Out", description: "You have been signed out." });
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({ variant: 'destructive', title: "Sign-out Error", description: "Could not sign out." });
    }
  };

  const value = { user, loading, signInWithGoogle, signOut };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
