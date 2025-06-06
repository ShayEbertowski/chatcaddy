import { Variable } from "./prompt";

export type EntityType = 'Prompt' | 'Function' | 'Snippet';

export type PromptEntity = {
    entityType: 'Prompt';
    id: string;
    title: string;
    content: string;
    variables?: Record<string, Variable>;
    folder?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type FunctionEntity = {
    entityType: 'Function';
    id: string;
    title: string;
    code: string;
    createdAt?: string;
    updatedAt?: string;
};

export type Entity = PromptEntity | FunctionEntity;

// (optional but good to keep for InsertModal / toolbar etc)
export type EntityForEditType =
    | { type: 'Function' | 'Snippet'; value: string }
    | { type: 'Variable'; value: string };
