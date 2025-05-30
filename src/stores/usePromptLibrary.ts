import { useEffect } from 'react';
import { usePromptStore } from './usePromptsStore';

export function usePromptLibrary() {
    const { prompts, loadPrompts } = usePromptStore();

    useEffect(() => {
        loadPrompts();
    }, []);

    return { prompts };
}
