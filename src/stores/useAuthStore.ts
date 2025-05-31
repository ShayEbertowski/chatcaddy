import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { signIn, signUp } from '../lib/auth';

type AuthState = {
    user: any | null;
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

        // You may optionally hit /auth/v1/user to fetch user info if needed:
        set({
            accessToken: token,
            user: { email: 'restored-session' },  // Simplified
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
                user: user,
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
