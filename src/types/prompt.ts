// Variables — still fully used across your app
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

// Optional: if you're still mapping DB rows to internal model
import { EntityType } from "./entity";

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

// Still valid for parsing chunks
export type PromptPart =
    | { type: 'text'; value: string }
    | { type: 'variable'; name: string };

// May still be used by your library screen:
export type LibraryProps = {
    category: 'prompts' | 'functions';
};
