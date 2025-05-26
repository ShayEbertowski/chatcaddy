import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  useRoute,
  RouteProp,
  useIsFocused,
  useNavigation,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import CollapsibleSection from '../../components/shared/CollapsibleSection';
import SavePromptModal from '../../components/modals/SavePromptModal';
import RichPromptEditor from '../../components/editor/RichPromptEditor';

import { useVariableStore } from '../../stores/useVariableStore';
import { placeholderText } from '../../styles/shared';
import { runPrompt } from '../../utils/prompt/runPrompt';
import { useColors } from '../../hooks/useColors';
import { MainTabParamList } from '../../types/navigation';
import {
  isDuplicatePrompt,
  getSmartTitle,
  preparePromptToSave,
  saveOrUpdatePrompt,
  loadPrompts,
} from '../../utils/prompt/promptManager';

export default function PromptSandboxScreen() {
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState('');
  const [hasRun, setHasRun] = useState(false);
  const route = useRoute<RouteProp<MainTabParamList, 'Sandbox'>>();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmSaveModal, setShowConfirmSaveModal] = useState(false);
  const [promptTitle, setPromptTitle] = useState('');
  const [autoSuggestTitle, setAutoSuggestTitle] = useState(true);
  const [showResponse, setShowResponse] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState('Uncategorized');
  const [promptsLoaded, setPromptsLoaded] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [pendingReset, setPendingReset] = useState(false);

  const colors = useColors();
  const styles = getStyles(colors);
  const saveButtonDisabled = inputText.trim() === '';
  const saveButtonIconColor = saveButtonDisabled ? colors.secondaryText : colors.primary;
  const saveButtonTextColor = saveButtonDisabled ? colors.secondaryText : colors.primary;

  const isEditing = !!route.params?.editId;
  const isFocused = useIsFocused();
  const [promptVariables, setPromptVariables] = useState<Record<string, string>>({});
  const { prompt: editingPrompt, editId, autoRun } = route.params;

  type RootStackParamList = {
    Main: NavigatorScreenParams<MainTabParamList>;
  };
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleRun = async () => {
    setHasRun(true);
    setShowResponse(true);
    setIsLoading(true);
    setResponse('');

    const filledValues = useVariableStore.getState().values;
    const result = await runPrompt(inputText, filledValues);

    if ('error' in result) {
      Alert.alert('Error', result.error);
    } else {
      setResponse(result.response);
    }

    setIsLoading(false);
  };

  const handleConfirmSave = async () => {
    const updatedPrompt = preparePromptToSave({
      id: editId,
      inputText,
      title: promptTitle,
      folder: selectedFolder,
      isEdit: isEditing,
    });

    try {
      await saveOrUpdatePrompt(updatedPrompt, isEditing);
      setHasSaved(true);
      setShowConfirmSaveModal(false);
      setInputText('');
      setResponse('');
      useVariableStore.getState().clearAll();
      console.log(`✅ Prompt ${isEditing ? 'updated' : 'saved'}`);
    } catch {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'save'} prompt.`);
    }
  };

  const handleSavePrompt = async () => {
    if (!promptsLoaded) {
      Alert.alert('Please wait', 'Still loading existing prompts.');
      return;
    }

    const isDuplicate = await isDuplicatePrompt(inputText, selectedFolder);
    if (isDuplicate) {
      Alert.alert('Duplicate', 'This prompt already exists.');
      return;
    }

    const title = await getSmartTitle(inputText);
    setPromptTitle(title);

    const currentVariables = useVariableStore.getState().values;
    setPromptVariables(currentVariables);

    setShowConfirmSaveModal(true);
  };

  useEffect(() => {
    const load = async () => {
      await loadPrompts(); // Ensures storage is initialized
      setPromptsLoaded(true);
    };
    load();
  }, []);

  useEffect(() => {
    if (autoSuggestTitle) {
      const suggested = inputText.trim().split(/\s+/).slice(0, 5).join(' ');
      setPromptTitle(prev => {
        const wasAuto = prev === '' || prev === prev.trim().split(/\s+/).slice(0, 5).join(' ');
        return wasAuto ? suggested : prev;
      });
    }
  }, [inputText, autoSuggestTitle]);

  useEffect(() => {
    const handler = (e: any) => {
      if (!isEditing || hasSaved) return;
      e.preventDefault();

      Alert.alert(
        'Discard changes?',
        'You are editing a prompt. Are you sure you want to leave?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setInputText('');
              setResponse('');
              useVariableStore.getState().clearAll();
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    };

    const unsubscribe = navigation.addListener('beforeRemove', handler);
    return unsubscribe;
  }, [navigation, isEditing]);

  useEffect(() => {
    if (!isFocused && isEditing && !pendingReset && !hasSaved) {
      Alert.alert(
        'Discard changes?',
        'You are editing a prompt. Discard your changes?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.navigate('Main', { screen: 'Sandbox', params: {} }),
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setInputText('');
              setResponse('');
              setPromptTitle('');
              useVariableStore.getState().clearAll();
              setPendingReset(true);
            },
          },
        ]
      );
    }

    if (isFocused) setPendingReset(false);
  }, [isFocused, isEditing]);

  useEffect(() => {
    if (editingPrompt?.variables) {
      Object.entries(editingPrompt.variables).forEach(([key, value]) => {
        useVariableStore.getState().setVariable(key, value);
      });
    }
  }, [editingPrompt]);

  useEffect(() => {
    if (editingPrompt?.content) {
      setInputText(editingPrompt.content);
      if (autoRun) handleRun();
    }
  }, [editingPrompt, autoRun]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardDismissMode="on-drag">
        <RichPromptEditor text={inputText} onChangeText={setInputText} />

        <CollapsibleSection
          title="response"
          isOpen={showResponse}
          onToggle={() => setShowResponse(!showResponse)}
        >
          <View style={styles.section}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#007aff" />
                <Text style={styles.loadingText}>Running...</Text>
              </View>
            ) : response === '' ? (
              <Text style={placeholderText}>Response will appear here after you run the prompt.</Text>
            ) : (
              <>
                <Text style={styles.response}>{response}</Text>
                <View style={{ alignItems: 'flex-end', marginTop: 10 }}>
                  <TouchableOpacity onPress={() => setResponse('')}>
                    <Text style={styles.clearButton}>Clear</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </CollapsibleSection>
      </ScrollView>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: saveButtonDisabled ? colors.border : colors.primary,
            },
          ]}
          onPress={handleSavePrompt}
          disabled={saveButtonDisabled}
        >
          <MaterialIcons name="save-alt" size={18} color={saveButtonIconColor} />
          <Text style={[styles.buttonText, { color: saveButtonTextColor }]}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleRun}
        >
          <MaterialIcons name="play-arrow" size={18} color={colors.onPrimary} />
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Run</Text>
        </TouchableOpacity>
      </View>

      <SavePromptModal
        visible={showConfirmSaveModal}
        title={promptTitle}
        prompt={inputText}
        onChangeTitle={setPromptTitle}
        onCancel={() => setShowConfirmSaveModal(false)}
        onConfirm={handleConfirmSave}
        selectedFolder={selectedFolder}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    section: {
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    response: {
      padding: 12,
      color: colors.text,
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
    runButton: {
      backgroundColor: colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
      marginHorizontal: 12,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 10,
      gap: 6,
    },
    container: {
      flex: 1,
    },
    scroll: {
      padding: 20,
      paddingBottom: 100,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
    },
  });
