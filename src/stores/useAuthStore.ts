import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

type User = {
    id: string;
    email: string;
};

type AuthState = {
    user: User | null;
    loading: boolean;
    initialized: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    loadSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: false,
    initialized: false,

    loadSession: async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            set({ user: null, initialized: true });
            return;
        }

        set({
            user: { id: session.user.id, email: session.user.email ?? '' },
            initialized: true,
        });

        console.log('🥶  Supabase session:');

    },

    signUp: async (email, password) => {
        set({ loading: true });
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;
        } catch (e) {
            console.error('Sign up failed', e);
            throw e;
        } finally {
            set({ loading: false });
        }
    },

    signIn: async (email, password) => {
        set({ loading: true });
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            set({
                user: { id: data.user.id, email: data.user.email ?? '' },
            });
        } catch (e) {
            console.error('Sign in failed', e);
            throw e;
        } finally {
            set({ loading: false });
        }
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null });
    },
}));
