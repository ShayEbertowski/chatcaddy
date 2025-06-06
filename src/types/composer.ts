export type ComposerNode = {
    id: string;
    entityType: 'Prompt' | 'Function' | 'Snippet';
    title: string;
    content: string;
    variables: Record<string, VariableValue>;
};

export type VariableValue =
    | { type: 'string'; value: string }
    | { type: 'entity'; entity: ComposerNode };
