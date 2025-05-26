// stores/useFolderStore.ts
import { create } from 'zustand';
import { Folder, LibraryType } from '../types/Folder';
import { v4 as uuidv4 } from 'uuid';

type FolderStore = {
    folders: Folder[];
    getFoldersByType: (type: LibraryType) => Folder[];
    addFolder: (name: string, type: LibraryType) => void;
    renameFolder: (id: string, name: string) => void;
    deleteFolder: (id: string) => void;
};

export const useFolderStore: import('zustand').UseBoundStore<import('zustand').StoreApi<FolderStore>> = create<FolderStore>((set, get) => ({
    folders: [
        { id: 'all-prompts', name: 'All', type: 'prompts' },
        { id: 'all-functions', name: 'All', type: 'functions' },
        { id: 'inspiration', name: 'Inspiration', type: 'prompts' },
        { id: 'dev-tools', name: 'Utility Functions', type: 'functions' },
    ],
    getFoldersByType: (type) =>
        get().folders.filter((folder) => folder.type === type),
    addFolder: (name, type) =>
        set((state) => ({
            folders: [
                ...state.folders,
                { id: uuidv4(), name, type },
            ],
        })),
    renameFolder: (id, name) =>
        set((state) => ({
            folders: state.folders.map((f) =>
                f.id === id ? { ...f, name } : f
            ),
        })),
    deleteFolder: (id) =>
        set((state) => ({
            folders: state.folders.filter((f) => f.id !== id),
        })),
}));
