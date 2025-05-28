import { GestureResponderEvent, TextInputProps } from 'react-native';

export type PromptFormProps = {
    selection: { start: number; end: number };
    setSelection: (selection: { start: number; end: number }) => void;
    onOpenVariableModal: () => void;
    title: string;
    setTitle: (value: string) => void;
    content: string;
    setContent: (value: string) => void;
};

export type PromptInputProps = {
    label?: string;
} & TextInputProps;

export type Props = {
    onPress: (event: GestureResponderEvent) => void;
};

export type VariableValue =
    | { type: 'string'; value: string }
    | { type: 'prompt'; promptId: string; promptTitle?: string };

export type Prompt = {
    id: string;
    title: string;
    content: string;
    folder: string;
    type?: 'Prompt' | 'Function' | 'Snippet';
    variables?: Record<string, VariableValue>;
};

export type NewPrompt = Omit<Prompt, 'id'>;


export type LibraryProps = {
    category: 'prompts' | 'functions';
};

export type PromptPart =
    | { type: 'text'; value: string }
    | { type: 'variable'; value: string; defaultValue?: string };
