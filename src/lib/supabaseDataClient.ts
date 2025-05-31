import { PostgrestClient } from '@supabase/postgrest-js';
import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';
import { useAuthStore } from '../stores/useAuthStore';

const SUPABASE_URL = Constants.expoConfig?.extra?.SUPABASE_URL;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY;

export function createSupabaseClient(token?: string) {
    const client = new PostgrestClient(`${SUPABASE_URL}/rest/v1`, {
        headers: {
            apikey: SUPABASE_ANON_KEY,
            authorization: token ? `Bearer ${token}` : `Bearer ${SUPABASE_ANON_KEY}`,
        },
    });

    return client;
}