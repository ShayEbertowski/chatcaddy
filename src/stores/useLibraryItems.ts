// src/hooks/useLibraryItems.ts

import { useFunctionStore } from '../stores/useFunctionStore';
import { useSnippetStore } from '../stores/useSnippetStore';
import { Prompt } from '../types/prompt';
import { usePromptStore } from './usePromptsStore';

export function useLibraryItems(entityType: 'Prompt' | 'Function' | 'Snippet'): Prompt[] {
    const prompts = usePromptStore((s) => s.prompts);
    const functions = useFunctionStore((s) => s.functions);
    const snippets = useSnippetStore((s) => s.snippets); // assuming you have snippets too

    if (entityType === 'Prompt') return prompts;
    if (entityType === 'Function') return functions;
    if (entityType === 'Snippet') return snippets;

    return [];
}
