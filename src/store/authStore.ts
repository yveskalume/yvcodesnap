import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, Subscription } from '../types';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: Subscription;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  fetchSubscription: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  subscription: {
    tier: 'free',
    snap_limit: 2,
    current_snap_count: 0,
  },

  initialize: async () => {
    try {
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        set({ user: session.user as User, session, loading: false });
        await get().fetchSubscription();
      } else {
        set({ loading: false });
      }

      // Listen to auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({ user: (session?.user as User) ?? null, session });
        if (session) {
          await get().fetchSubscription();
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false });
    }
  },

  signUp: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) return { error: error.message };
      if (data.user) {
        set({ user: data.user as User, session: data.session });
      }
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  },

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error: error.message };
      set({ user: data.user as User, session: data.session });
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  },

  signInWithOAuth: async (provider) => {
    await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: `${window.location.origin}/editor`,
      },
    });
  },

  signInWithMagicLink: async (email) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/editor`,
        },
      });

      if (error) return { error: error.message };
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/login`,
      });

      if (error) return { error: error.message };
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  fetchSubscription: async () => {
    const { user } = get();
    if (!user) return;

    try {
      // Count user's snaps
      const { count } = await supabase
        .from('snaps')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // TODO: Fetch actual subscription tier from profiles table or Stripe
      // For now, hardcode free tier
      set({
        subscription: {
          tier: 'free',
          snap_limit: 2,
          current_snap_count: count ?? 0,
        },
      });
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  },
}));
