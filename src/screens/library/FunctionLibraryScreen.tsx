import React, { useEffect, useState } from 'react';
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
import { RootStackParamList } from '../../types/navigation';
import EmptyState from '../../components/shared/EmptyState';
import PromptCard from '../../components/prompt/PromptCard';
import { LibraryProps, Prompt } from '../../types/prompt';
import { useFolderStore } from '../../stores/useFolderStore';
import { filterByFolder } from '../../utils/storage/libraryFilter';
import { useTabNavigation } from '../../hooks/useTabNavigation';
import { useRouter } from 'expo-router';
import { useFunctionEditorStore } from '../../stores/useFunctionEditorStore';
import { usePromptLibrary } from '../../stores/usePromptLibrary';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useFunctionStore } from '../../stores/useFunctionStore';
import ConfirmModal from '../../components/modals/ConfirmModal';
import { useNavigateToEditor } from '../../stores/useNavigateToEditor';

export default function FunctionLibraryScreen({ category }: LibraryProps) {
    const [tapBehavior, setTapBehavior] = useState('preview');
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const tabNavigation = useTabNavigation();

    const [isPickerVisible, setPickerVisible] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState('Uncategorized');

    const foldersFromStore = useFolderStore().folders.filter(f => f.type === 'prompts');
    const folders = [{ id: 'All' }, { id: 'Uncategorized' }, ...foldersFromStore];

    const { functions } = useFunctionStore();
    const filteredFunctions = filterByFolder(functions, selectedFolder);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const confirmFunctionDelete = useSettingsStore((s) => s.confirmPromptDelete);
    const { deleteFunction } = useFunctionStore();
    const setConfirmFunctionDelete = useSettingsStore((s) => s.setConfirmPromptDelete);
    const router = useRouter();
    const navigateToEditor = useNavigateToEditor();


    useEffect(() => {
        const loadBehavior = async () => {
            const behavior = await AsyncStorage.getItem('@prompt_tap_behavior');
            setTapBehavior(behavior || 'preview');
        };
        loadBehavior();
    }, []);

    const handleFunctionTap = async (prompt: Prompt) => {
        // TODO ---
    };

    const handleDeleteFunction = (id: string) => {
        if (confirmFunctionDelete) {
            setPendingDeleteId(id);
            setShowConfirmModal(true);
        } else {
            console.log('🐒');

            deleteFunction(id);
        }
    };

    const renderEmptyState = () => (
        <EmptyState
            category={category}
            onCreatePress={() => {
                navigateToEditor('Function');
            }}

        />
    );


    const renderFunctionItem = ({ item }: { item: Prompt }) => (
        <PromptCard
            title={item.title}
            content={item.content}
            onPress={() => handleFunctionTap(item)}
            onEdit={() => {
                navigateToEditor('Function');
            }}
            onDelete={() => handleDeleteFunction(item.id)}
        />
    );


    const toggleFolderPicker = () => {
        setPickerVisible((prev) => !prev);
    };


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
                onConfirm={(dontShowAgain: any) => {
                    if (dontShowAgain) {
                        setConfirmFunctionDelete(false);
                    }
                    if (pendingDeleteId) {
                        handleDeleteFunction(pendingDeleteId);
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
