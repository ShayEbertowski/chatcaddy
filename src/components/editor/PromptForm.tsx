// components/PromptForm.js
import React from 'react';
import { ScrollView } from 'react-native';
import PromptInput from './PromptInput';
import { PromptFormProps } from '../../types/prompt';
import VariableToolbarButton from '../toolbar/VariableToolbarButton';

export default function PromptForm({
  selection,
  setSelection,
  onOpenVariableModal,
  title,
  setTitle,
  content,
  setContent,
}: PromptFormProps) {
  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      keyboardDismissMode="on-drag"
    >
      <VariableToolbarButton onPress={onOpenVariableModal} />

      <PromptInput
        label="Prompt Title:"
        value={title}
        onChangeText={setTitle}
        placeholder="Enter a title"
      />

      <PromptInput
        label="Prompt Content:"
        value={content}
        onChangeText={setContent}
        selection={selection}
        onSelectionChange={({
          nativeEvent: { selection },
        }: {
          nativeEvent: { selection: { start: number; end: number } };
        }) => {
          setSelection(selection);
        }}
        multiline
      />
    </ScrollView>
  );
}