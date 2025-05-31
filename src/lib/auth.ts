import Constants from 'expo-constants';

const SUPABASE_URL = Constants.expoConfig?.extra?.SUPABASE_URL;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY;

export async function signIn(email: string, password: string) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error_description || 'Sign in failed');
    }

    return await res.json();
}

export async function signUp(email: string, password: string) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error_description || 'Sign up failed');
    }

    return await res.json();
}

export async function getUser(token: string) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
            Authorization: `Bearer ${token}`,
            apikey: SUPABASE_ANON_KEY,
        },
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error_description || 'Failed to fetch user');
    }

    return await res.json();
}


export async function refreshAccessToken(refreshToken: string) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
            refresh_token: refreshToken,
        }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error_description || 'Token refresh failed');
    }

    return await res.json();
}

