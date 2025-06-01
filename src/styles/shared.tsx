// styles/shared.js
import { StyleSheet } from 'react-native';
import { Theme } from '../theme/types';

export const getSharedStyles = ({ isDark, ...colors }: Theme) =>
  StyleSheet.create({
    divider: {
      height: 1.5,
      backgroundColor: colors.border,
      marginVertical: 16,
      opacity: 0.6,
    },
    previewVariable: {
      color: colors.text,
      fontStyle: 'italic',
      fontWeight: 'bold',
      paddingHorizontal: 4,
      borderRadius: 4,
    },
    chip: {
      backgroundColor: colors.accent + '33',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      marginRight: 6,
      marginBottom: 6,
    },
    chipText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.accent
    },
    response: {
      color: colors.text,
      backgroundColor: colors.card,
      padding: 16,
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    clearButton: {
      color: colors.error,
      fontWeight: '400',
      fontSize: 15,
      paddingTop: 16,
    },
    loadingText: {
      fontSize: 15,
      color: colors.secondaryText,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
    },
    pageTitle: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      color: colors.text,
    },
    backButton: {
      flex: 1,
      color: colors.text,
    },
    section: {
      backgroundColor: colors.card, // use your theme's card color
      padding: 16,
      borderRadius: 10,
      marginBottom: 24,
      shadowColor: colors.cardShadow ?? '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 5,
      elevation: 1,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
      color: colors.accent,
    },
    input: {
      borderColor: colors.border,
      borderWidth: 1,
      padding: 10,
      borderRadius: 6,
      fontSize: 16,
      backgroundColor: colors.inputBackground ?? '#f9f9f9',
      color: colors.text,
    },
    disabledInput: {
      backgroundColor: colors.disabledBackground ?? '#eee',
      color: colors.secondaryText,
    },
    actionButton: {
      backgroundColor: colors.accent,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    actionButtonText: {
      color: colors.onPrimary,
      fontWeight: '600',
      fontSize: 14,
    },
    clearButtonText: {
      color: colors.warning ?? 'red',
      fontSize: 14,
      fontWeight: '600',
    },
    toggleRow: {
      flexDirection: 'row',
      backgroundColor: colors.toggleBackground ?? colors.inputBackground,
      borderRadius: 12,
      overflow: 'hidden',
      marginTop: 10,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
    },
    toggleButtonSelected: {
      backgroundColor: colors.primary,
    },
    toggleButtonText: {
      color: colors.text,
      fontWeight: '500',
    },
    toggleButtonTextSelected: {
      color: colors.onPrimary,
      fontWeight: '700',
    },
    scroll: {
      flexGrow: 1,
      paddingVertical: 32,
      paddingHorizontal: 20,
    },
    keyActionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
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
      color: colors.placeholder,
      fontSize: 15,
      padding: 12,
    },

  });


