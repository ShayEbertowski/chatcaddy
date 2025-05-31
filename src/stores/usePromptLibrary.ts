import { useEffect } from 'react';

import { usePromptStore } from './usePromptsStore';
import { useAuthStore } from './useAuthStore';

export function usePromptLibrary() {
    const { prompts, loadPrompts } = usePromptStore();
    const initialized = useAuthStore((state) => state.initialized);

    useEffect(() => {
        if (initialized) {
            loadPrompts();
        }
    }, [initialized]);
    return { prompts };
}
