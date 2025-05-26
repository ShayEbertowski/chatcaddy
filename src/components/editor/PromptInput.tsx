import {
  View,
  Text,
  TextInput,
} from 'react-native';
import { PromptInputProps } from '../../types/prompt';


export default function PromptInput({ label, ...props }: PromptInputProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text style={{ fontWeight: '600', marginBottom: 6 }}>{label}</Text>
      )}
      <TextInput
        style={{
          minHeight: 120,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 10,
          padding: 12,
          textAlignVertical: 'top',
          backgroundColor: '#f9f9f9',
        }}
        {...props}
      />
    </View>
  );
}
