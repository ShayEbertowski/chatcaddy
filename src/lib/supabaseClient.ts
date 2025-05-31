import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';

const SUPABASE_URL = 'https://zepkjgnkqdddzsmstqtu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplcGtqZ25rcWRkZHpzbXN0cXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2Mzc5OTEsImV4cCI6MjA2NDIxMzk5MX0.hKJbh0SuH1GeK2UmnxnE108bw2Jc1f8IGpLJN_h4XWI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: {
        params: {
            // This forces realtime to never connect; you're essentially disabling it.
            eventsPerSecond: 0,
        },
    },
});
