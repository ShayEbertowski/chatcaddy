import { Variable } from "./prompt";

export type EntityForEditType =
    | { type: 'Function' | 'Snippet'; value: string }
    | { type: 'Variable'; value: string };

export type EntityType = 'Prompt' | 'Function' | 'Snippet';

export type Entity =
    | {
        entityType: 'Prompt';
        id: string;
        title: string;
        content: string;
        variables?: Record<string, Variable>;
        folder?: string;
        createdAt?: string;
        updatedAt?: string;
    }
    | {
        entityType: 'Function';
        id: string;
        name: string;
        code: string;
        createdAt?: string;
        updatedAt?: string;
    };
