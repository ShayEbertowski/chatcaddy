const SUPABASE_URL = 'https://zepkjgnkqdddzsmstqtu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplcGtqZ25rcWRkZHpzbXN0cXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2Mzc5OTEsImV4cCI6MjA2NDIxMzk5MX0.hKJbh0SuH1GeK2UmnxnE108bw2Jc1f8IGpLJN_h4XWI';

import { supabase } from './supabaseClient';

export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        throw error;
    }

    return data;  // ✅ Now Zustand receives { session, user }
}

export async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        throw error;
    }

    return data;
}


// Sign out (optional - mostly handled client-side now)
export async function signOut() {
    // Supabase tokens are stateless JWTs - client-side delete usually enough
}
