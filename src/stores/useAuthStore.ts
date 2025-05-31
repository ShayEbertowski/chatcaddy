import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { signIn as signInApi, signUp as signUpApi } from '../lib/auth';

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
        if (token) {
            set({ accessToken: token });
        }
    },

    signUp: async (email, password) => {
        set({ loading: true });
        try {
            const data = await signInApi(email, password);
            console.log('Signed up:', data);
            // OPTIONAL: you can also auto-login after signup if you want
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
            const data = await signInApi(email, password);
            const session = data.session;
            if (!session) throw new Error('No session returned');

            await SecureStore.setItemAsync('accessToken', session.access_token);
            set({
                accessToken: session.access_token,
                user: session.user,
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
