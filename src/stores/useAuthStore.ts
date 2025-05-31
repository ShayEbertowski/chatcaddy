import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { signIn, signUp, getUser, refreshAccessToken } from '../lib/auth';

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
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) return;

        try {
            // 🔑 Refresh the access token
            const data = await refreshAccessToken(refreshToken);
            const { access_token, refresh_token } = data;

            // 🔑 Store the new tokens
            await SecureStore.setItemAsync('accessToken', access_token);
            await SecureStore.setItemAsync('refreshToken', refresh_token);

            // 🔑 NOW: fetch user info using the new access_token
            const user = await getUser(access_token);

            // 🔑 Update Zustand state fully
            set({
                accessToken: access_token,
                user: { id: user.id, email: user.email },
            });

        } catch (e) {
            console.error('Failed to refresh session', e);
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
        }
    },



    signUp: async (email, password) => {
        set({ loading: true });
        try {
            await signUp(email, password);
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
            const { access_token, refresh_token, user } = data;

            await SecureStore.setItemAsync('accessToken', access_token);
            await SecureStore.setItemAsync('refreshToken', refresh_token);

            set({
                accessToken: access_token,
                user: { id: user.id, email: user.email },
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
        await SecureStore.deleteItemAsync('refreshToken');
        set({ user: null, accessToken: null });
    }

}));
