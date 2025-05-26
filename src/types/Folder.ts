// types/Folder.ts
export type libraryType = 'prompts' | 'functions' | 'snippets';

export type folder = {
    id: string;
    name: string;
    type: libraryType; // e.g., "prompts", "functions"
};
