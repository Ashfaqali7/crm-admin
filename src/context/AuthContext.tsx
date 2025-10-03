import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import supabase from '../services/supabaseClient';
import type { Profile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; session: Session | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  // Keep a ref to the current user so auth state change handlers can
  // decide whether they need to re-fetch profile or show a loading UI.
  const userRef = useRef<User | null>(null);

  // sync userRef whenever user state changes
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    // Initial session check
    async function initializeAuth() {
      console.log("Starting auth initialization...");
      if (!isMounted) return;

      setLoading(true);

      try {
        console.log("Fetching session...");

        // Add timeout to getSession to prevent hanging
        const getSessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('getSession timeout')), 10000)
        );

        const { data: { session }, error } = await Promise.race([
          getSessionPromise,
          timeoutPromise
        ]) as any;

        if (!isMounted) return;

        console.log("Initial session check:", session ? "Session found" : "No session", error);

        if (error) {
          console.error("Session error:", error);
          if (isMounted) {
            setUser(null);
            setProfile(null);
          }
          return;
        }

        if (session?.user) {
          console.log("Setting user state...");
          if (isMounted) {
            setUser(session.user);
          }
          console.log("Fetching user profile...");
          await getProfile(session.user.id);
          if (!isMounted) return;
          console.log("Profile fetched successfully");
        } else {
          console.log("No session found, clearing user and profile");
          if (isMounted) {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          console.log("Finishing auth initialization, setting loading to false");
          setLoading(false);
        }
      }
    }

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      console.log("Auth state changed:", _event, session ? "Session exists" : "No session");
      try {
        if (session?.user) {
          const sameUser = userRef.current && userRef.current.id === session.user.id;
          if (!sameUser) {
            console.log("New user session detected, updating state...");
            if (isMounted) {
              setUser(session.user);
            }
            await getProfile(session.user.id);
          } else {
            // same user; ensure state is in sync
            if (isMounted) {
              setUser(session.user);
            }
          }
        } else {
          // Signed out or session expired
          console.log("No session or signed out");
          if (isMounted) {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Error handling auth state change:', err);
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Helper to remove Supabase-related localStorage keys. Reusable from
  // signOut and other places.
  function clearSupabaseLocalStorage() {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('sb-') || k.includes('supabase'));
      keys.forEach(k => localStorage.removeItem(k));
      console.log('Cleared Supabase-related localStorage keys:', keys);
    } catch (err) {
      console.warn('Error clearing Supabase-related localStorage:', err);
    }
  }

  async function getProfile(userId: string) {
    console.log('Starting profile fetch for user:', userId);
    try {
      // Add timeout to profile fetch to prevent hanging
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
      );

      const { data, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      if (error) {
        console.error('Error fetching profile:', error);
        // Set profile to null on error but don't throw
        setProfile(null);
        return;
      }

      if (data) {
        console.log('Profile data received:', data.full_name || 'success');
        setProfile(data);
      } else {
        console.log('No profile data found');
        setProfile(null);
      }
    } catch (error) {
      console.error('Unexpected error in getProfile:', error);
      setProfile(null);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      console.log("Starting signIn process...");
      setLoading(true);

      // Check if Supabase client is initialized
      if (!supabase.auth) {
        throw new Error("Supabase client not properly initialized");
      }

      console.log("Attempting signIn with email:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("SignIn response received");
      console.log("Response error:", error);
      console.log("Response data exists:", !!data);

      if (error) {
        console.error("Auth error details:", error);
        throw error;
      }

      if (!data?.user) {
        console.error("No user data in response");
        throw new Error("Invalid email or password");
      }

      console.log("Setting user state...");
      setUser(data.user);

      if (data.user) {
        console.log("Fetching user profile...");
        await getProfile(data.user.id);
      }

      console.log("Sign in process completed successfully");
      return { user: data.user, session: data.session };
    } catch (err) {
      console.error("SignIn process failed with error:", err);
      throw err;
    } finally {
      // Always clear loading so UI doesn't remain stuck
      setLoading(false);
    }
  }



  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Ensure Supabase client storage is cleared so the next open requires login
    clearSupabaseLocalStorage();

    // Force navigation to login (refresh). Using href ensures a full reload
    // so any in-memory state is reset.
    try {
      window.location.href = '/login';
    } catch (err) {
      // Fallback: reload the page
      window.location.reload();
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
