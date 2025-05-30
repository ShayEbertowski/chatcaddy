import { PostgrestClient } from '@supabase/postgrest-js';
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';

const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';

export const supabase = new PostgrestClient(`${SUPABASE_URL}/rest/v1`, {
    headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
});
