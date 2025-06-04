export type EntityForEditType =
    | { type: 'Function' | 'Snippet'; value: string }
    | { type: 'Variable'; value: string };
