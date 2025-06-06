export type ComposerNodeType = 'prompt' | 'function' | 'snippet' | 'string';

export type ComposerNode =
    | {
        id: string;
        type: 'string';
        value: string;
        children: ComposerNode[];
    }
    | {
        id: string;
        type: 'prompt' | 'function' | 'snippet';
        title: string;
        children: ComposerNode[];
    };

