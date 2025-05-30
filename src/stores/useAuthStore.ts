import { create } from 'zustand';
import { supabaseAuth } from '../lib/supabaseClient';

type User = {
    id: string;
    email: string;
};

type AuthState = {
    user: User | null;
    setUser: (user: User | null) => void;
    loadSession: () => Promise<void>;
    signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,

    setUser: (user) => set({ user }),

    loadSession: async () => {
        const { data, error } = await supabaseAuth.auth.getUser();
        if (!error && data.user) {
            set({
                user: {
                    id: data.user.id,
                    email: data.user.email ?? '',
                },
            });
        } else {
            set({ user: null });
        }
    },

    signOut: async () => {
        await supabaseAuth.auth.signOut();
        set({ user: null });
    },
}));
