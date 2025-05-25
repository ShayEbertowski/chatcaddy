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
} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainTabParamList } from '../src/types/navigation';
import { placeholderText } from '../src/styles/shared';
import { v4 as uuidv4 } from 'uuid';
import { MaterialIcons } from '@expo/vector-icons';
import RichPromptEditor from './components/RichPromptEditor';
import CollapsibleSection from './components/CollapsibleSection';
import { generateSmartTitle } from './utils/generateSmartTitle';
import { savePrompt } from './utils/savePrompt';
import SavePromptModal from './components/modals/SavePromptModal';
import { useVariableStore } from './stores/useVariableStore';
import { runPrompt } from './utils/runPrompt';

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
  const saveButtonTextColor = saveButtonDisabled ? '#999' : '#007aff';
  const saveButtonIconColor = saveButtonDisabled ? '#999' : '#007aff';

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
    const suggested = await generateSmartTitle(inputText);
    setPromptTitle(suggested);
    setShowConfirmSaveModal(true);
  };

  useEffect(() => {
    if (route.params?.prefill) {
      setInputText(route.params.prefill);
      if (route.params.autoRun) {
        handleRun();
      }
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
            style={[styles.button, styles.saveButton]}
            onPress={handleSavePrompt}
            disabled={inputText.trim() === ''}
          >
            <MaterialIcons name="save-alt" size={18} color={saveButtonIconColor} />
            <Text style={[styles.buttonText, { color: saveButtonTextColor }]}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.runButton]}
            onPress={handleRun}
          >
            <MaterialIcons name="play-arrow" size={18} color="#fff" />
            <Text style={[styles.buttonText, { color: '#fff' }]}>Run</Text>
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
            };

            try {
              await savePrompt(newPrompt);
              console.log('✅ Prompt saved');
              setShowConfirmSaveModal(false);
            } catch {
              Alert.alert('Error', 'Failed to save prompt.');
            }
          }}
        />
      </SafeAreaView >
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#f2f2f7', //light mode: '#f2f2f7' dark mode: 'light mode: '#1c1c1e'
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8e8e93',
    marginTop: 24,
    marginBottom: 12
  },

  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingBottom: 100,
  },
  response: {
    // backgroundColor: '#ffffff',
    padding: 12,
    // borderRadius: 6,
    // color: '#333',
  },
  clearButton: {
    color: 'red',
    fontWeight: '400',
    fontSize: 15, // ← match `sectionTitle`
    paddingTop: 16, // ← adjust this to nudge vertically into alignment
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 8,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12, // ← adjust spacing between buttons
    marginHorizontal: 12
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

  saveButton: {
    backgroundColor: '#f4f4f4',
    borderWidth: 1,
    borderColor: '#ccc',
  },

  runButton: {
    backgroundColor: '#007aff',
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  iconButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  runButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },



  runIcon: {
    marginRight: 6,
  },

  emptyVariableContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },

  emptyVariableIcon: {
    marginBottom: 12,
  },

  emptyVariableText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },

  loadingText: {
    fontSize: 15,
    color: '#555',
  },
});
