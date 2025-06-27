import { create } from 'zustand';
import { Variable } from '../types/prompt';  // ✅ use Variable (not VariableValue anymore)

type VariableState = {
    values: Record<string, Variable>;
    setVariable: (key: string, value: Variable) => void;
    setVariables: (vars: Record<string, Variable>) => void; // ✅ Add this
    getVariable: (key: string) => Variable | undefined;
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

    setVariables: (vars) => set({ values: vars }), // ✅ Sets everything at once

    getVariable: (key) => get().values[key],

    removeVariable: (key) =>
        set((state) => {
            const newValues = { ...state.values };
            delete newValues[key];
            return { values: newValues };
        }),

    clearAll: () => set({ values: {} }),
}));
