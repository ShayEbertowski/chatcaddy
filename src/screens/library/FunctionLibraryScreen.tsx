import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, View } from 'react-native';
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
import { useRouter } from 'expo-router';
import { useFunctionStore } from '../../stores/useFunctionStore';
import { useNavigateToEditor } from '../../stores/useNavigateToEditor';
import { useAuthStore } from '../../stores/useAuthStore';

export default function FunctionLibraryScreen({ category }: LibraryProps) {
    const [selectedFolder, setSelectedFolder] = useState('Uncategorized');
    const foldersFromStore = useFolderStore().folders.filter(f => f.type === 'prompts');
    const folders = [{ id: 'All', name: 'All' }, { id: 'Uncategorized', name: 'Uncategorized' }, ...foldersFromStore];
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [isPickerVisible, setPickerVisible] = useState(false);
    const confirmFunctionDelete = useSettingsStore((s) => s.confirmPromptDelete);
    const setConfirmFunctionDelete = useSettingsStore((s) => s.setConfirmPromptDelete);
    const router = useRouter();
    const { functions, loadFunctions, deleteFunction } = useFunctionStore();
    const navigateToEditor = useNavigateToEditor();
    const initialized = useAuthStore((state) => state.initialized);
    const filteredFunctions = filterByFolder(functions, selectedFolder);

    useEffect(() => {
        if (initialized) {
            loadFunctions();
        }
    }, [initialized]);

    const handleDeleteFunction = (id: string) => {
        if (confirmFunctionDelete) {
            setPendingDeleteId(id);
            setShowConfirmModal(true);
        } else {
            deleteFunction(id);
        }
    };

    const renderFunctionItem = ({ item }: { item: Prompt }) => (
        <PromptCard
            title={item.title}
            content={item.content}
            onPress={() => { }}  // <-- your handleFunctionTap logic
            onEdit={() => navigateToEditor('Function', item)}
            onDelete={() => handleDeleteFunction(item.id)}
        />
    );

    const renderEmptyState = () => (
        <EmptyState
            category={category}
            onCreatePress={() => navigateToEditor('Function')}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={filteredFunctions}
                keyExtractor={(item) => item.id}
                renderItem={renderFunctionItem}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: 80,
                    justifyContent: filteredFunctions.length === 0 ? 'center' : undefined,
                }}
            />

            {/* Folder Picker modal unchanged */}
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
                title="Delete Function?"
                message="Are you sure you want to delete this function?"
                confirmText="Delete"
                cancelText="Cancel"
                showCheckbox
                onCancel={() => {
                    setShowConfirmModal(false);
                    setPendingDeleteId(null);
                }}
                onConfirm={(dontShowAgain) => {
                    if (dontShowAgain) {
                        setConfirmFunctionDelete(false);
                    }
                    if (pendingDeleteId) {
                        deleteFunction(pendingDeleteId);
                    }
                    setShowConfirmModal(false);
                    setPendingDeleteId(null);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    modal: { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, width: '80%', maxWidth: 300, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
    modalItem: { paddingVertical: 12 },
    modalItemText: { fontSize: 16, color: '#333', textAlign: 'center' }
});
