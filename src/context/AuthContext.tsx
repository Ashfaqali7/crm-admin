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
    // Initial session check
    async function initializeAuth() {
      console.log("Starting auth initialization...");
      setLoading(true);
      // Race getSession against a timeout to avoid indefinite hangs
      const sessionPromise = supabase.auth.getSession();
      const timeout = new Promise<{ data: { session: null } }>((_, reject) =>
        setTimeout(() => reject(new Error('getSession timed out')), 8000)
      );

      try {
        console.log("Fetching session (with timeout)...");
        const { data: { session } } = await Promise.race([sessionPromise, timeout]) as any;
        console.log("Initial session check:", session ? "Session found" : "No session");

        if (session?.user) {
          console.log("Setting user state...");
          setUser(session.user);
          console.log("Fetching user profile...");
          await getProfile(session.user.id);
          console.log("Profile fetched successfully");
        } else {
          console.log("No session found, clearing user and profile");
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("Error during auth initialization (or timeout):", error);
        // Reset states on error
        setUser(null);
        setProfile(null);
      } finally {
        console.log("Finishing auth initialization, setting loading to false");
        setLoading(false);
      }
    }

    initializeAuth();

    // Debug: list Supabase-related localStorage keys to help diagnose persistence
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('sb-') || k.includes('supabase'));
      console.log('Supabase-related localStorage keys on init:', keys);
      keys.forEach(k => console.log(k, localStorage.getItem(k)));
    } catch (err) {
      console.warn('Could not read localStorage during auth init:', err);
    }

    // Clear Supabase-related localStorage keys on tab/window close so the app
    // always requires a fresh login when reopened.
    const handleBeforeUnload = () => {
      try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('sb-') || k.includes('supabase'));
        keys.forEach(k => localStorage.removeItem(k));
        console.log('Cleared Supabase-related localStorage keys on beforeunload:', keys);
      } catch (err) {
        console.warn('Error clearing localStorage on beforeunload:', err);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, session ? "Session exists" : "No session");
      try {
        // If there's a session with a user, only re-fetch profile and show
        // the loading UI when the user changed (e.g. new login). This avoids
        // showing a full-screen loader during transient events like token
        // refresh or tab visibility changes when the same user is active.
        if (session?.user) {
          const sameUser = userRef.current && userRef.current.id === session.user.id;
          if (!sameUser) {
            setLoading(true);
            setUser(session.user);
            await getProfile(session.user.id);
          } else {
            // same user; ensure state is in sync but avoid toggling loading
            setUser(session.user);
          }
        } else {
          // Signed out
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Error handling auth state change:', err);
      } finally {
        // Ensure loading is cleared after handling auth state change
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Don't fail silently, but set profile to null on error
        setProfile(null);
        return;
      }

      console.log('Profile data received:', data ? 'success' : 'no data');
      setProfile(data);
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

      // Get current session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log("Current session state:", currentSession ? "Active" : "No active session");

      console.log("Attempting signIn with email:", email);

      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Add timeout to detect if the request is stuck
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Sign in request timed out')), 10000);
      });

      const { data, error } = await Promise.race([
        signInPromise,
        timeoutPromise,
      ]) as { data: any; error: any };

      console.log("Raw Supabase response received");
      console.log("Response data:", JSON.stringify(data, null, 2));
      console.log("Response error:", error);

      if (error) {
        console.error("Auth error details:", error);
        throw error;
      }

      if (!data?.user) {
        console.error("No user data in response");
        throw new Error("No user data returned");
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
      console.error("Error stack:", (err as Error).stack);
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
