
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  async function signup(email: string, password: string, name: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, { displayName: name });
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        displayName: name,
        role: "customer",
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: "Account created successfully!",
        description: "Welcome to TastyDash.",
      });
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast({
        variant: "destructive",
        title: "Failed to create account",
        description: error.message,
      });
      throw error;
    }
  }

  async function login(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Logged in successfully!",
        description: "Welcome back to TastyDash.",
      });
    } catch (error: any) {
      console.error("Error logging in:", error);
      toast({
        variant: "destructive",
        title: "Failed to log in",
        description: error.message,
      });
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      toast({
        title: "Logged out successfully",
      });
    } catch (error: any) {
      console.error("Error logging out:", error);
      toast({
        variant: "destructive",
        title: "Failed to log out",
        description: error.message,
      });
      throw error;
    }
  }

  async function resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast({
        variant: "destructive",
        title: "Failed to send reset email",
        description: error.message,
      });
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Check if user is admin
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.role === "admin");
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking user role:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    // Create admin user if it doesn't exist (for demo purposes)
    const createAdminUser = async () => {
      try {
        const adminEmail = "admin@tastydash.com";
        const adminPassword = "admin123";
        
        // Check if admin already exists
        try {
          await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
          await signOut(auth); // Sign out after checking
        } catch (error) {
          // Admin doesn't exist, create it
          const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
          const user = userCredential.user;
          
          // Update profile with display name
          await updateProfile(user, { displayName: "Admin" });
          
          // Create admin document in Firestore
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: adminEmail,
            displayName: "Admin",
            role: "admin",
            createdAt: serverTimestamp(),
          });
          
          await signOut(auth); // Sign out after creating
        }
      } catch (error) {
        console.error("Error creating admin user:", error);
      }
    };
    
    createAdminUser();

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isAdmin,
    loading,
    signup,
    login,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
