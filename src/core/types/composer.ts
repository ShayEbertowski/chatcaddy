// types/composer.ts

import { VariableValue } from "../../types/prompt";
export interface ComposerNode {
    id: string;
    entityType: 'Prompt' | 'Function' | 'Snippet';
    title: string;
    content: string;
    variables: Record<string, VariableValue>;
    children: ComposerNode[];
}

// What Supabase stores
export interface ComposerTreeRecord {
    id: string;               // Supabase row ID
    name: string;
    tree_data: ComposerNode;  // Full nested tree
}
