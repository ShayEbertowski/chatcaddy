import { create } from 'zustand';
import { VariableValue } from '../types/prompt';

type VariableState = {
    values: Record<string, VariableValue>;
    setVariable: (key: string, value: VariableValue) => void;
    getVariable: (key: string) => VariableValue | undefined;
    removeVariable: (key: string) => void;
    clearAll: () => void;
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

    clearAll: () => set({ values: {} }),
}));
