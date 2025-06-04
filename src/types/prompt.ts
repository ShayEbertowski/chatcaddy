// src/types/prompt.ts

import { EntityType } from "./entity";

// Variables
export type StringVariable = {
    type: 'string';
    value: string;
    richCapable: boolean;
};

export type PromptVariable = {
    type: 'prompt';
    promptId: string;
    promptTitle?: string;
};

export type Variable = StringVariable | PromptVariable;
export type VariableValue = Variable;

// App-level canonical prompt
export type Prompt = {
    id: string;
    entityType: 'Prompt';
    title: string;
    content: string;
    folder: string;
    variables: Record<string, Variable>;
    createdAt?: string;
    updatedAt?: string;
};

// DB shape exactly matching Supabase
export type PromptRow = {
    id: string;
    type: EntityType;
    title: string;
    content: string;
    folder: string;
    variables: Record<string, VariableValue>;
    user_id: string;
    created_at: string;
    updatedAt: string;
};

// Function model (if needed)
export type PromptFunction = {
    id: string;
    entityType: 'Function';
    name: string;
    code: string;
    createdAt: string;
    updatedAt: string;
};

export type NewPrompt = Omit<Prompt, 'id'>;

export type LibraryProps = {
    category: 'prompts' | 'functions';
};

// For parsing prompt text chunks
export type PromptPart =
    | { type: 'text'; value: string }
    | { type: 'variable'; name: string };

    