import { supabase } from "../../lib/supabaseClient";
import { useAuthStore } from "../../stores/useAuthStore";


export type UserPreferences = {
    tap_behavior?: 'preview' | 'run';
    appearance_mode?: 'light' | 'dark' | 'system';
    confirm_prompt_delete?: boolean;
};

export async function loadUserPreferences(): Promise<UserPreferences | null> {
    const user = useAuthStore.getState().user;
    if (!user) return null;

    const token = useAuthStore.getState().accessToken;

    const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.error('Failed to load preferences', error);
        return null;
    }

    return data;
}

export async function saveUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const token = useAuthStore.getState().accessToken;

    const { error } = await supabase
        .from('user_preferences')
        .upsert({
            user_id: user.id,
            ...preferences,
        });

    if (error) {
        console.error('Failed to save preferences', error);
    }
}
