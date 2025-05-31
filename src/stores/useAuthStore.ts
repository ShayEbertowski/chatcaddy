import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { signIn, signUp } from '../lib/auth';

type User = {
    id: string;
    email: string;
};

type AuthState = {
    user: User | null;
    accessToken: string | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    loadSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    loading: false,

    loadSession: async () => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (!token) return;

        // Optional: you can fetch user from Supabase if you want full user object
        set({
            accessToken: token,
            user: null,  // ← you may replace this with a fetched user if desired
        });
    },

    signUp: async (email, password) => {
        set({ loading: true });
        try {
            const data = await signUp(email, password);
            console.log('Signed up:', data);
        } catch (e: any) {
            console.error('Sign up failed', e);
            throw e;
        } finally {
            set({ loading: false });
        }
    },

    signIn: async (email, password) => {
        set({ loading: true });
        try {
            const data = await signIn(email, password);
            const { access_token, user } = data;

            await SecureStore.setItemAsync('accessToken', access_token);

            set({
                accessToken: access_token,
                user: {
                    id: user.id,          // ✅ explicitly grab id
                    email: user.email,    // ✅ explicitly grab email
                },
            });
        } catch (e: any) {
            console.error('Sign in failed', e);
            throw e;
        } finally {
            set({ loading: false });
        }
    },

    signOut: async () => {
        await SecureStore.deleteItemAsync('accessToken');
        set({ user: null, accessToken: null });
    },
}));
