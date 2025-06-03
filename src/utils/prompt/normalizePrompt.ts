
// src/utils/prompt/normalizePrompt.ts

import { Prompt, PromptRow } from '../../types/prompt';
import { normalizeVariables } from './promptManager';

export function normalizePromptRow(row: PromptRow): Prompt {
    return {
        id: row.id,
        entityType: 'Prompt',  // <-- hardcoded literal
        title: row.title,
        content: row.content,
        folder: row.folder,
        variables: normalizeVariables(row.variables),
        createdAt: row.created_at,
        updatedAt: row.updatedAt,
    };
}

