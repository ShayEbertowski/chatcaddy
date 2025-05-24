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

export interface VariableModalProps {
    visible: boolean;
    variableName: string;
    variableValue: string;
    onChangeName: (name: string) => void;
    onChangeValue: (value: string) => void;
    onInsert: () => void;
    onClose: () => void;
}