// types/composer.ts

import { Variable } from "./prompt";

export type ComposerNode = {
    id: string;
    title: string;
    entityType: string;
    content: string;
    variables: Record<string, Variable>;
    children: ComposerNode[];
};


// What Supabase stores
export interface ComposerTreeRecord {
    id: string;               // Supabase row ID
    name: string;
    tree_data: ComposerNode;  // Full nested tree
}