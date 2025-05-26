// types/Folder.ts
export type LibraryType = 'prompts' | 'functions' | 'snippets';

export type Folder = {
    id: string;
    name: string;
    type: LibraryType; // e.g., "prompts", "functions"
};
