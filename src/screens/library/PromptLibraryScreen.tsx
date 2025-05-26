import React, { useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import EmptyState from '../../components/shared/EmptyState';
import PromptCard from '../../components/prompt/PromptCard';
import { LibraryProps, Prompt } from '../../types/prompt';
import { useFolderStore } from '../../stores/useFolderStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import ConfirmModal from '../../components/modals/ConfirmModal';
import { filterByFolder } from '../../utils/storage/libraryFilter';
import { useTabNavigation } from '../../hooks/useTabNavigation';
import BaseModal from '../../components/modals/BaseModal';
import {
  loadPrompts,
  deletePrompt as deletePromptFromStorage,
} from '../../utils/prompt/promptManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PromptLibraryScreen({ category }: LibraryProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [tapBehavior, setTapBehavior] = useState('preview');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tabNavigation = useTabNavigation();

  const [selectedFolder, setSelectedFolder] = useState('All');
  const folders = useFolderStore().folders.filter(f => f.type === 'prompts');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  const confirmPromptDelete = useSettingsStore((s) => s.confirmPromptDelete);
  const setConfirmPromptDelete = useSettingsStore((s) => s.setConfirmPromptDelete);
  const hydrated = useSettingsStore.persist?.hasHydrated() ?? false;

  const filteredPrompts = filterByFolder(prompts, selectedFolder);

  const refreshPrompts = async () => {
    const stored = await loadPrompts();
    setPrompts(stored);
  };

  useEffect(() => {
    refreshPrompts();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', refreshPrompts);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const loadTapBehavior = async () => {
      const behavior = await AsyncStorage.getItem('@prompt_tap_behavior');
      setTapBehavior(behavior || 'preview');
    };
    loadTapBehavior();
  }, []);

  const handlePromptTap = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
  };

  const handleDeletePrompt = (id: string) => {
    if (!hydrated) return;

    if (confirmPromptDelete) {
      setPendingDeleteId(id);
      setShowConfirmModal(true);
    } else {
      deletePrompt(id);
    }
  };

  const deletePrompt = async (id: string) => {
    const updated = prompts.filter((p) => p.id !== id);
    setPrompts(updated);
    await deletePromptFromStorage(id);
  };

  const renderPromptItem = ({ item }: { item: Prompt }) => (
    <PromptCard
      title={item.title}
      content={item.content}
      onPress={() => handlePromptTap(item)}
      onEdit={() =>
        tabNavigation.navigate('Sandbox', {
          editId: item.id,
          prompt: item,
          autoRun: false,
        })
      }
      onDelete={() => handleDeletePrompt(item.id)}
      onRun={() => handlePromptTap(item)}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      category={category}
      onCreatePress={() => tabNavigation.navigate('Sandbox', {})}
    />
  );

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

      {selectedPrompt && (
        <BaseModal
          visible={true}
          onRequestClose={() => setSelectedPrompt(null)}
          blur
        >
          <Text style={styles.modalTitle}>{selectedPrompt.title}</Text>
          <Text style={styles.modalContent}>{selectedPrompt.content}</Text>

          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setSelectedPrompt(null)}
          >
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </BaseModal>
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
            setConfirmPromptDelete(false);
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#111',
  },
  modalContent: {
    fontSize: 15,
    color: '#333',
  },
  modalCloseButton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});
