import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';


const API_KEY_STORAGE_KEY = 'openai_api_key';
const TAP_BEHAVIOR_KEY = '@prompt_tap_behavior';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('');
  const [editable, setEditable] = useState(true);
  const [hasSavedKey, setHasSavedKey] = useState(false);
  const [tapBehavior, setTapBehavior] = useState('preview');

  useEffect(() => {
    const loadKey = async () => {
      try {
        const storedKey = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
        if (storedKey) {
          setApiKey(storedKey);
          setHasSavedKey(true);
          setEditable(false);
        }
      } catch (error) {
        console.error('Failed to load API key:', error);
      }
    };

    const loadSettings = async () => {
      try {
        const storedBehavior = await AsyncStorage.getItem(TAP_BEHAVIOR_KEY);
        if (storedBehavior) setTapBehavior(storedBehavior);
      } catch (error) {
        console.error('Failed to load tap behavior:', error);
      }
    };

    loadKey();
    loadSettings();
  }, []);

  const saveApiKey = async () => {
    try {
      await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, apiKey);
      Alert.alert('Success', 'API key saved.');
      setStatus('');
      setEditable(false);
      setHasSavedKey(true);
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', 'Failed to save API key.');
    }
  };

  const clearApiKey = async () => {
    try {
      await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
      setApiKey('');
      setStatus('🔒 Key cleared');
      setEditable(true);
      setHasSavedKey(false);
      Alert.alert('Key Removed', 'Your API key has been deleted.');
    } catch (error) {
      console.error('Failed to clear key:', error);
      Alert.alert('Error', 'Could not remove key.');
    }
  };


  const confirmClearKey = () => {
    Alert.alert('Confirm Deletion', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: clearApiKey, style: 'destructive' },
    ]);
  };

  const saveTapBehavior = async (value: string) => {
    try {
      await AsyncStorage.setItem(TAP_BEHAVIOR_KEY, value);
      setTapBehavior(value);
    } catch (error) {
      console.error('Failed to save tap behavior:', error);
    }
  };

  const handleEditOrSave = () => {
    if (editable) {
      saveApiKey();
    } else {
      setEditable(true);
    }
  };

  const handleTestKey = async () => {
    setStatus('Testing...');
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        setStatus('✅ Key is valid!');
        Alert.alert('Success', 'Your API key is valid!');
      } else {
        setStatus('❌ Invalid key or network issue.');
        Alert.alert('Error', 'Invalid API key or network error.');
      }
    } catch (error) {
      console.error('Test key error:', error);
      setStatus('❌ Error testing key.');
      Alert.alert('Error', 'Something went wrong while testing the key.');
    }
  };



  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OpenAI API Key</Text>
          <TextInput
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="sk-..."
            secureTextEntry
            editable={editable}
            style={[styles.input, !editable && styles.disabledInput]}
          />
          <View style={styles.keyActionsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleEditOrSave}>
              <Text style={styles.actionButtonText}>{editable ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleTestKey}>
              <Text style={styles.actionButtonText}>Test</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={confirmClearKey}>
              <Text style={styles.clearButtonText}>Clear Key</Text>
            </TouchableOpacity>
          </View>


        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Tap Action</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                tapBehavior === 'preview' && styles.toggleButtonSelected,
              ]}
              onPress={() => saveTapBehavior('preview')}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  tapBehavior === 'preview' && styles.toggleButtonTextSelected,
                ]}
              >
                Preview
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                tapBehavior === 'run' && styles.toggleButtonSelected,
              ]}
              onPress={() => saveTapBehavior('run')}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  tapBehavior === 'run' && styles.toggleButtonTextSelected,
                ]}
              >
                Run
              </Text>
            </TouchableOpacity>
          </View>

        </View>

      </ScrollView>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inlineButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  buttonSpacer: {
    width: 12,
  },
  clearButtonWrapper: {
    marginTop: 16,
    alignItems: 'flex-start',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  disabledInput: {
    backgroundColor: '#eee',
    color: '#555',
  },
  scroll: {
    flexGrow: 1,
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  keyActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  actionButton: {
    backgroundColor: '#007aff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  clearButton: {
    marginTop: 12,
    alignSelf: 'center',
  },

  clearButtonText: {
    color: 'red',
    fontSize: 14,
    fontWeight: '600',
  },

  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
  },

  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },

  toggleButtonSelected: {
    backgroundColor: '#007aff',
  },

  toggleButtonText: {
    color: '#333',
    fontWeight: '500',
  },

  toggleButtonTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },



});
