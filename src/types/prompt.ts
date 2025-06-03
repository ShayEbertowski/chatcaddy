import { GestureResponderEvent, TextInputProps } from 'react-native';

// ✨ This stays the same: your basic prompt editor UI state
export type PromptFormProps = {
    selection: { start: number; end: number };
    setSelection: (selection: { start: number; end: number }) => void;
    onOpenVariableModal: () => void;
    title: string;
    setTitle: (value: string) => void;
    content: string;
    setContent: (value: string) => void;
};

// ✨ This is your generic text input wrapper — keep as is
export type PromptInputProps = {
    label?: string;
} & TextInputProps;

// ✨ Simple button prop — keep as is
export type Props = {
    onPress: (event: GestureResponderEvent) => void;
};


// ✅ 🔧 Your prompt filtering views stay as-is
export type LibraryProps = {
    category: 'prompts' | 'functions';
};

// ✅ 🔧 Your prompt parsing model (used by parser)
export type PromptPart =
    | { type: 'text'; value: string }
    | { type: 'variable'; name: string };

// ✅ 🔧 Full database row (storage shape)
export type PromptRow = {
    id: string;
    title: string;
    content: string;
    folder: string;
    type: 'Prompt' | 'Function' | 'Snippet';
    variables: Record<string, VariableValue>;  // <-- The storage value shape (raw assigned values)
    user_id: string;
    created_at: string;
};

// ✅ 🔧 Updated PromptVariableEditor props (this is your editor component)
export type PromptVariableEditorProps = {
    prompt: Prompt;  // uses the full variable definition schema
    initialValues?: Record<string, string>;  // only holds assigned raw string values at runtime
    onChange: (values: Record<string, string>) => void;
};

export type VariableValue = Variable;

export type StringVariable = {
    type: 'string';
    value: string;
    richCapable: boolean;
};

export type PromptVariable = {
    type: 'prompt';
    promptId: string;
    promptTitle?: string;
};

export type Variable = StringVariable | PromptVariable;

export type Prompt = {
    id: string;
    title: string;
    content: string;
    folder: string;
    type: 'Prompt' | 'Function' | 'Snippet';
    variables?: Record<string, Variable>;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
};

export type NewPrompt = Omit<Prompt, 'id'>;
