import { PostgrestClient } from '@supabase/postgrest-js';
import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';

const SUPABASE_URL = Constants.expoConfig?.extra?.SUPABASE_URL;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY;

export const supabaseData = new PostgrestClient(`${SUPABASE_URL}/rest/v1`, {
    headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
});
