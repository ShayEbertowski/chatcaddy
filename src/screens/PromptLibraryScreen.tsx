import React, { useEffect, useRef, useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import EmptyState from '../components/EmptyState';
import PromptCard from '../components/PromptCard';
import { LibraryProps, Prompt } from '../types/components';
import { useFolderStore } from '../stores/useFolderStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import ConfirmModal from '../components/modals/ConfirmModal';
import { filterByFolder } from '../utils/libraryFilter';
import { useTabNavigation } from '../hooks/useTabNavigation';


const PROMPT_STORAGE_KEY = '@prompt_library';

export default function PromptLibraryScreen({ category }: LibraryProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [tapBehavior, setTapBehavior] = useState('preview');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tabNavigation = useTabNavigation();

  const [isPickerVisible, setPickerVisible] = useState(false);

  const [selectedFolder, setSelectedFolder] = useState('All');
  const folders = useFolderStore().folders.filter(f => f.type === 'prompts');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const confirmPromptDelete = useSettingsStore((s) => s.confirmPromptDelete); // ✅ THIS is the boolean
  const setConfirmPromptDelete = useSettingsStore((s) => s.setConfirmPromptDelete); // ✅ THIS is the setter

  const hydrated = useSettingsStore.persist?.hasHydrated() ?? false;

  const filteredPrompts = filterByFolder(prompts, selectedFolder);


  useEffect(() => {
    const loadPrompts = async () => {
      const stored = await AsyncStorage.getItem(PROMPT_STORAGE_KEY);
      if (stored) {
        setPrompts(JSON.parse(stored));
      }
    };

    loadPrompts(); // run once on mount
  }, []); // ✅ load initially only

  // ✅ separately track refocuses
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const stored = await AsyncStorage.getItem(PROMPT_STORAGE_KEY);
      if (stored) {
        setPrompts(JSON.parse(stored));
      }
    });

    return unsubscribe;
  }, [navigation]); // ✅ add navigation as dep safely


  useEffect(() => {
    const loadTapBehavior = async () => {
      const behavior = await AsyncStorage.getItem('@prompt_tap_behavior');
      setTapBehavior(behavior || 'preview');
    };
    loadTapBehavior();
  }, []);

  const handlePromptTap = async (promptText: string) => {
    try {
      const behavior = await AsyncStorage.getItem('@prompt_tap_behavior');
      navigation.navigate('Main', {
        screen: 'Sandbox',
        params: {
          prefill: promptText,
          autoRun: behavior === 'run',
        },
      });
    } catch (error) {
      console.error('Failed to handle prompt tap:', error);
    }
  };

  const renderPromptItem = ({ item }: { item: any }) => (
    <PromptCard
      title={item.title}
      content={item.content}
      onPress={() => handlePromptTap(item.content)}
      onEdit={() =>
        navigation.navigate('Main', {
          screen: 'Sandbox',
          params: {
            editId: item.id,
            prefill: item.content,
            autoRun: false, // or true if you want it to auto-run when editing
          },
        })
      }
      onDelete={() => handleDeletePrompt(item.id)}
      onRun={() => handlePromptTap(item.content)}
    />
  );

  const handleDeletePrompt = (id: string) => {
    if (!hydrated) return; // 🚫 wait until AsyncStorage loads

    if (confirmPromptDelete) {
      setPendingDeleteId(id);       // 🔐 hold onto this ID
      setShowConfirmModal(true);    // 👀 show modal
    } else {
      deletePrompt(id);             // 🚮 delete immediately
    }
  };

  const deletePrompt = async (id: string) => {
    const updated = prompts.filter((p) => p.id !== id);
    setPrompts(updated); // ✅ update local state
    await AsyncStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(updated));
  };

  const renderEmptyState = () => (
    <EmptyState
      category={category}
      onCreatePress={() => {
        console.log('✅ Switching directly to Sandbox tab');
        tabNavigation.navigate('Sandbox', {});
      }}
    />
  );


  const toggleFolderPicker = () => {
    setPickerVisible((prev) => !prev);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredPrompts}
        keyExtractor={(item) => item.id}
        renderItem={renderPromptItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 80,
          justifyContent: filteredPrompts.length === 0 ? 'center' : undefined,
        }}

      // TODO: This was the folders thing. Need to find a new way to categorize since I used top level folders for tools
      // ListHeaderComponent={
      //   <><View style={styles.dropdownWrapper}>
      //     <TouchableOpacity onPress={toggleFolderPicker} style={styles.dropdown}>
      //       <Text style={styles.dropdownText}>{selectedFolder}</Text>
      //       <MaterialIcons name="arrow-drop-down" size={24} color="#888" />
      //     </TouchableOpacity>
      //   </View><View style={{ height: 24 }} /></>
      // }
      />

      {isPickerVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            {folders.map((folder) => (
              <TouchableOpacity
                key={folder.id}
                onPress={() => {
                  setSelectedFolder(folder.id);
                  setPickerVisible(false);
                }}
                style={styles.modalItem}
              >
                <Text style={styles.modalItemText}>{folder.id}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <ConfirmModal
        visible={showConfirmModal}
        title="Delete Prompt?"
        message="Are you sure you want to delete this prompt?"
        confirmText="Delete"
        cancelText="Cancel"
        showCheckbox
        onCancel={() => {
          setShowConfirmModal(false);
          setPendingDeleteId(null);
        }}
        onConfirm={(dontShowAgain) => {
          if (dontShowAgain) {
            setConfirmPromptDelete(false); // ✅ the setter is used here
          }
          if (pendingDeleteId) {
            deletePrompt(pendingDeleteId);
          }
          setShowConfirmModal(false);
          setPendingDeleteId(null);
        }}
      />


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardPreview: {
    color: '#555',
    fontSize: 14,
  },

  // New empty state styles:
  emptyContainer: {
    flex: 1, // takes full height
    justifyContent: 'center', // centers vertically
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
    textAlign: 'center',
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#007aff',
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  dropdownWrapper: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  dropdownText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  modal: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  modalItem: {
    paddingVertical: 12,
  },

  modalItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },


});

