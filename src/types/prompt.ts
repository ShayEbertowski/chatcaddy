// src/types/prompt.ts

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

// Models
export type Prompt = {
    id: string;
    entityType: 'Prompt';
    title: string;
    content: string;
    folder: string;   // <-- ADD THIS BACK IN
    variables: Record<string, Variable>;
    createdAt: string;
    updatedAt: string;
};


export type PromptFunction = {
    id: string;
    entityType: 'Function';
    name: string;
    code: string;
    createdAt: string;
    updatedAt: string;
};

// Unified entity
export type Entity = Prompt | PromptFunction;

// THIS IS THE MISSING PIECE RIGHT HERE:
export type EntityType = 'Prompt' | 'Function' | 'Snippet';

// For creating new prompts
export type NewPrompt = Omit<Prompt, 'id'>;

export type LibraryProps = {
    category: 'prompts' | 'functions';
};
