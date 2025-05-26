// styles/shared.js
import { StyleSheet } from 'react-native';
import { Theme } from '../theme/types';

const sharedStyles = StyleSheet.create({
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

  placeholderText: {
    fontStyle: 'italic',
    color: '#888',
    fontSize: 15,
    padding: 12,
  },
  section: {
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8e8e93',
    marginTop: 24,
    marginBottom: 12,
  },

});

export const { input, label, saveButton, saveButtonText, placeholderText, section, sectionTitle } = sharedStyles;


export const getSharedStyles = ({ isDark, ...colors }: Theme) =>
  StyleSheet.create({
    divider: {
      height: 1.5,
      backgroundColor: colors.border,
      marginVertical: 16,
      opacity: 0.6,
    },
    previewVariable: {
      backgroundColor: colors.inputBackground,
      color: colors.text,
      fontStyle: 'italic',
      fontWeight: 'bold',
      paddingHorizontal: 4,
      borderRadius: 4,
    },
    chip: {
      backgroundColor: isDark ? '#1e2a38' : '#E6F0FF',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      marginRight: 6,
      marginBottom: 6,
    },
    chipText: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? '#66B2FF' : '#007AFF',
    },
  });


