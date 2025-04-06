"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

// Add these imports at the top
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Define API_URL constant
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type User = {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  phoneNumber?: string;
  phonenumber?: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => Promise<void>;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role?: "user" | "admin";
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        // Make a request to your backend to check if the user is authenticated
        const res = await fetch(`${API_URL}/api/v1/users/me`, {
          credentials: "include",
          headers: {
            Accept: "application/json",

            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setUser(data.data);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        // After successful login, fetch user data
        const userRes = await fetch(`${API_URL}/api/v1/users/me`, {
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.success && userData.data) {
            setUser(userData.data);
            router.push("/dashboard");
            toast({
              title: "Login successful",
              description: "Welcome back!",
            });
          }
        }
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: data.message || "Invalid credentials",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An error occurred during login",
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      // Convert phoneNumber to phonenumber for backend compatibility
      const backendUserData = {
        ...userData,
        phonenumber: userData.phoneNumber,
      };

      const res = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendUserData),
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        // After successful registration, fetch user data
        const userRes = await fetch(`${API_URL}/api/v1/users/me`, {
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.success && userData.data) {
            setUser(userData.data);
            router.push("/dashboard");
            toast({
              title: "Registration successful",
              description: "Your account has been created",
            });
          }
        }
      } else {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: data.message || "Please check your information",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "An error occurred during registration",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      router.push("/");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "An error occurred during logout",
      });
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Get the Google ID token
      const idToken = await result.user.getIdToken();

      // Send the token to your backend
      const res = await fetch(`${API_URL}/api/v1/auth/firebase-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        // After successful login, fetch user data
        const userRes = await fetch(`${API_URL}/api/v1/users/me`, {
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.success && userData.data) {
            setUser(userData.data);
            router.push("/dashboard");
            toast({
              title: "Login successful",
              description: "Welcome back!",
            });
          }
        }
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: data.message || "Authentication failed",
        });
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An error occurred during Google login",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
