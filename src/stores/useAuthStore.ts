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
        if (token) {
            set({ accessToken: token });
        }
    },

    signUp: async (email, password) => {
        set({ loading: true });
        const res = await signUp(email, password);
        console.log('Signed up', res);
        set({ loading: false });
    },

    signIn: async (email, password) => {
        set({ loading: true });
        const res = await signIn(email, password);
        await SecureStore.setItemAsync('accessToken', res.access_token);
        set({
            accessToken: res.access_token,
            user: res.user,
            loading: false,
        });
    },

    signOut: async () => {
        await SecureStore.deleteItemAsync('accessToken');
        set({ user: null, accessToken: null });
    },
}));
