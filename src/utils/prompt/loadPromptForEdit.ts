import { useEditorStore } from '../../stores/useEditorStore';
import { useVariableStore } from '../../stores/useVariableStore';
import { createSupabaseClient } from '../../lib/supabaseDataClient';
import { normalizeVariables } from './promptManager';
import { Prompt } from '../../types/prompt';  // ✅ correctly imported

export async function loadPromptForEdit(id: string, token?: string) {
    const client = createSupabaseClient(token);
    const { data, error } = await client.from('prompts').select('*').eq('id', id).single();
    if (error || !data) throw error;

    const prompt: Prompt = {
        ...data,
        variables: normalizeVariables(data.variables),
    };

    useEditorStore.getState().setEditingEntity(prompt.type, prompt); // ✅ fixed call
    useEditorStore.getState().setEntityType(prompt.type);
    useEditorStore.getState().setEditId(prompt.id);

    Object.entries(prompt.variables ?? {}).forEach(([key, value]) => {
        useVariableStore.getState().setVariable(key, value);
    });
}
