import Constants from 'expo-constants';

const SUPABASE_URL = Constants.expoConfig?.extra?.SUPABASE_URL;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY;

const AUTH_URL = `${SUPABASE_URL}/auth/v1`;

export async function signUp(email: string, password: string) {
    const res = await fetch(`${AUTH_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Sign up failed');

    return data;
}

export async function signIn(email: string, password: string) {
    const res = await fetch(`${AUTH_URL}/token?grant_type=password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Sign in failed');

    return data;
}
