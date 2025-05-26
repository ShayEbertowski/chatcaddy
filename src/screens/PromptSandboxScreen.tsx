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
import { v4 as uuidv4 } from 'uuid';
import { MaterialIcons } from '@expo/vector-icons';
import CollapsibleSection from '../components/CollapsibleSection';
import SavePromptModal from '../components/modals/SavePromptModal';
import RichPromptEditor from '../components/RichPromptEditor';
import { useVariableStore } from '../stores/useVariableStore';
import { placeholderText } from '../styles/shared';
import { generateSmartTitle } from '../utils/generateSmartTitle';
import { Prompt, savePrompt } from '../utils/savePrompt';
import { runPrompt } from '../utils/runPrompt';
import { useColors } from '../hooks/useColors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MainTabParamList } from '../types/navigation';

export default function PromptSandboxScreen() {
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState('');
  const [hasRun, setHasRun] = useState(false);
  const route = useRoute<RouteProp<MainTabParamList, 'Sandbox'>>();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmSaveModal, setShowConfirmSaveModal] = useState(false);
  const [promptTitle, setPromptTitle] = useState('');
  const [autoSuggestTitle, setAutoSuggestTitle] = useState(true);
  const [showResponse, setShowResponse] = useState(true); // placeholder if you want response later
  const saveButtonDisabled = inputText.trim() === '';
  const colors = useColors();
  const styles = getStyles(colors);
  const saveButtonIconColor = saveButtonDisabled ? colors.secondaryText : colors.primary;
  const saveButtonTextColor = saveButtonDisabled ? colors.secondaryText : colors.primary;
  const [selectedFolder, setSelectedFolder] = useState('Uncategorized');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [promptsLoaded, setPromptsLoaded] = useState(false);
  const isEditing = !!route.params?.editId;
  const isFocused = useIsFocused();
  const [pendingReset, setPendingReset] = useState(false);
  type RootStackParamList = {
    Main: NavigatorScreenParams<MainTabParamList>;
  };
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [confirmDiscardVisible, setConfirmDiscardVisible] = useState(false);
  const [onDiscardConfirmed, setOnDiscardConfirmed] = useState<() => void>(() => { });
  const [showResultModal, setShowResultModal] = useState(false);


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


  const handleSavePrompt = async () => {
    if (!promptsLoaded) {
      Alert.alert('Please wait', 'Still loading existing prompts.');
      return;
    }

    const normalize = (str: string) => str.trim().toLowerCase();

    const duplicate = prompts.find(
      (p) =>
        normalize(p.content) === normalize(inputText) &&
        p.folder === selectedFolder
    );

    if (duplicate) {
      Alert.alert('Duplicate', 'This prompt already exists.');
      return;
    }

    const suggested = await generateSmartTitle(inputText);
    const cleanTitle = suggested.trim().replace(/^["']+|["']+$/g, '');
    setPromptTitle(cleanTitle);
    setShowConfirmSaveModal(true);
  };


  useEffect(() => {
    const { prefill, autoRun, editId } = route.params || {};

    // Only populate if this is an edit
    if (editId && prefill) {
      setInputText(prefill);
      if (autoRun) handleRun();
    }
  }, [route.params]);

  useEffect(() => {
    if (autoSuggestTitle) {
      const suggested = inputText.trim().split(/\s+/).slice(0, 5).join(' ');

      setPromptTitle((prev) => {
        // Only update if it's still empty or previously auto-suggested
        const wasAutoSuggested = prev === '' || prev === prev.trim().split(/\s+/).slice(0, 5).join(' ');
        return wasAutoSuggested ? suggested : prev;
      });
    }
  }, [inputText, autoSuggestTitle]);

  useEffect(() => {
    const loadPrompts = async () => {
      const stored = await AsyncStorage.getItem('@prompt_library');
      if (stored) {
        setPrompts(JSON.parse(stored));
      }
      setPromptsLoaded(true);
    };
    loadPrompts();
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      if (!isEditing) return;

      e.preventDefault();

      Alert.alert(
        'Discard changes?',
        'You are editing a prompt. Are you sure you want to leave?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => { } },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setInputText('');
              setResponse('');
              useVariableStore.getState().clearAll();
              navigation.dispatch(e.data.action); // Proceed
            },
          },
        ]
      );
    };

    const unsubscribe = navigation.addListener('beforeRemove', handler);
    return unsubscribe;
  }, [navigation, isEditing]);

  useEffect(() => {
    if (!isFocused && isEditing && !pendingReset) {
      Alert.alert(
        'Discard changes?',
        'You are editing a prompt. Discard your changes?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              // 👇 Force tab switch back to Sandbox
              navigation.navigate('Main', { screen: 'Sandbox', params: {} });
            },
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

    if (isFocused) {
      setPendingReset(false);
    }
  }, [isFocused, isEditing]);




  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardDismissMode="on-drag">
          <RichPromptEditor
            text={inputText}
            onChangeText={setInputText}
          />


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
                <Text style={placeholderText}>
                  Response will appear here after you run the prompt.
                </Text>
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
              }
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
          onConfirm={async () => {
            const newPrompt = {
              id: uuidv4(),
              title: promptTitle.trim() || 'Untitled',
              content: inputText,
              folder: selectedFolder, // 👈 include the folder!
            };

            try {
              await savePrompt(newPrompt);
              console.log('✅ Prompt saved');
              setShowConfirmSaveModal(false);
              setInputText('');
              setResponse('');
              useVariableStore.getState().clearAll();
            } catch {
              Alert.alert('Error', 'Failed to save prompt.');
            }
          }}
          selectedFolder={selectedFolder}
        />

      </SafeAreaView >
    </>
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

    emptyVariableText: {
      color: colors.secondaryText,
      fontSize: 14,
      fontStyle: 'italic',
      textAlign: 'center',
      paddingHorizontal: 20,
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
