import { create } from 'zustand';

type VariableState = {
    values: Record<string, string>;
    setVariable: (key: string, value: string) => void;
    getVariable: (key: string) => string | undefined;
    removeVariable: (key: string) => void;
};

export const useVariableStore = create<VariableState>((set, get) => ({
    values: {},

    setVariable: (key, value) =>
        set((state) => ({
            values: {
                ...state.values,
                [key]: value,
            },
        })),

    getVariable: (key) => get().values[key],

    removeVariable: (key) =>
        set((state) => {
            const newValues = { ...state.values };
            delete newValues[key];
            return { values: newValues };
        }),
}));
