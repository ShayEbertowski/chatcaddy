export type ComposerNodeType = 'prompt' | 'function' | 'snippet' | 'string';

export interface ComposerNode {
    id: string;
    type: ComposerNodeType;
    title: string;
    value?: string;
    children?: ComposerNode[];
}
