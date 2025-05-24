import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainTabParamList } from '../src/types/navigation';
import { useVariables } from '../src/hooks/useVariables';
import { label } from '../src/styles/shared';
import { RootStackParamList } from '../src/types/navigation';
import { v4 as uuidv4 } from 'uuid';
import { MaterialIcons } from '@expo/vector-icons';
import RichPromptEditor from './components/RichPromptEditor';
import { useVariableStore } from './stores/useVariableStore';



type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function PromptSandboxScreen() {
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState('');
  const [hasRun, setHasRun] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const route = useRoute<RouteProp<MainTabParamList, 'Sandbox'>>();
  const navigation = useNavigation<Navigation>();

  const [showVariableModal, setShowVariableModal] = useState(false);
  const [tempVariableName, setTempVariableName] = useState('');
  const [showVariables, setShowVariables] = useState(true);
  const { variables, filledValues, setFilledValues } = useVariables(inputText);
  const [isLoading, setIsLoading] = useState(false);

  const saveButtonDisabled = inputText.trim() === '';
  const saveButtonBorderColor = saveButtonDisabled ? '#ccc' : '#1A73E8';
  const saveButtonTextColor = saveButtonDisabled ? '#999' : '#007aff';
  const saveButtonIconColor = saveButtonDisabled ? '#999' : '#007aff';

  const handleRun = async () => {
    setHasRun(true);
    setIsLoading(true);       // ← show spinner
    setResponse('');          // ← clear old response

    try {
      const apiKey = await SecureStore.getItemAsync('openai_api_key');
      if (!apiKey) {
        setResponse('No API key found. Please enter one in settings.');
        setIsLoading(false);
        return;
      }

      const filledValues = useVariableStore.getState().values;
      let finalPrompt = inputText;

      const usedVars = [...inputText.matchAll(/{{\s*(.*?)\s*}}/g)].map(match => match[1]);

      for (const varName of usedVars) {
        const value = filledValues[varName];
        if (!value?.trim()) {
          Alert.alert('Missing Variable', `Please fill in "${varName}"`);
          setIsLoading(false);
          return;
        }

        const pattern = new RegExp(`{{\\s*${varName}\\s*}}`, 'g');
        finalPrompt = finalPrompt.replace(pattern, value);
      }

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: finalPrompt }],
        }),
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'No response';
      setResponse(reply);
    } catch (error: any) {
      setResponse('Error: ' + error.message);
    } finally {
      setIsLoading(false); // ← hide spinner
    }
  };



  const handleSavePrompt = () => {
    const suggestedTitle = inputText.trim().split(/\s+/).slice(0, 5).join(' ');
    navigation.navigate('Edit Prompt', {
      prompt: {
        id: uuidv4(),
        title: suggestedTitle,
        content: inputText,
      },
    });
  };


  useEffect(() => {
    if (route.params?.prefill) {
      setInputText(route.params.prefill);
      if (route.params.autoRun) {
        handleRun();
      }
    }
  }, [route.params]);

  return (
    <>

      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardDismissMode="on-drag">

          <RichPromptEditor
            text={inputText}
            onChangeText={setInputText}
            onEditVariable={(name: any) => {
              console.log('Tapped variable:', name);
              // This is where you'd show a modal or editing UI
            }}
          />

          <View style={styles.responseHeader}>
            <Text style={styles.sectionTitle}>Response:</Text>
            {response !== '' && (
              <TouchableOpacity onPress={() => setResponse('')}>
                <Text style={styles.clearButton}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#007aff" />
                <Text style={styles.loadingText}>Running...</Text>
              </View>
            ) : response === '' ? (
              <Text style={styles.placeholderText}>
                Response will appear here after you run the prompt.
              </Text>
            ) : (
              <Text style={styles.response}>{response}</Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[
              styles.saveButton, { borderColor: saveButtonBorderColor }
            ]}
            onPress={handleSavePrompt}
            disabled={inputText.trim() === ''}
            activeOpacity={0.7}
          >
            <View style={styles.iconButtonContent}>
              <MaterialIcons name="save-alt" size={18} color={saveButtonIconColor} />
              <Text style={[styles.saveButtonText, { color: saveButtonTextColor }]} > Save Prompt</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.runButton} onPress={handleRun} activeOpacity={0.7}>
            <View style={styles.iconButtonContent}>
              <MaterialIcons name="play-arrow" size={18} color="#fff" style={styles.runIcon} />
              <Text style={styles.runButtonText}>Run Prompt</Text>
            </View>
          </TouchableOpacity>
        </View >
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

  bottomActions: {
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },

  saveButton: {
    backgroundColor: '#f4f4f4',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 12,
    borderColor: '#1A73E8',
  },

  iconButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // or marginLeft on the Text if you're on React Native < 0.71
  },

  runIcon: {
    marginRight: 6,
  },

  saveButtonText: {
    color: '#007aff',
    fontWeight: '600',
    fontSize: 16,
  },

  runButton: {
    backgroundColor: '#007aff',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },

  runButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
  placeholderText: {
    fontStyle: 'italic',
    color: '#888',
    fontSize: 15,
    padding: 12,
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
