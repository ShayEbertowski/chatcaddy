// styles/shared.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
  },
  saveButton: {
    backgroundColor: '#007aff',
    padding: 18,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  compactInput: {
  backgroundColor: '#f9f9f9',
  paddingVertical: 8,  // ↓ less height
  paddingHorizontal: 12,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#ddd',
  fontSize: 14,
  marginBottom: 10,
},

});

export const { input, label, saveButton, saveButtonText, compactInput } = styles;
