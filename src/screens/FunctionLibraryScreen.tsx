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
import { RootStackParamList } from '../types/navigation';
import EmptyState from '../components/EmptyState';
import PromptCard from '../components/PromptCard';
import { LibraryProps, Prompt } from '../types/components';
import { useFolderStore } from '../stores/useFolderStore';
import { filterByFolder } from '../utils/libraryFilter';
import { useTabNavigation } from '../hooks/useTabNavigation';

const FUNCTION_STORAGE_KEY = '@function_library';

export default function FunctionLibraryScreen({ category }: LibraryProps) {
    const [functions, setFunctions] = useState<Prompt[]>([]);
    const [tapBehavior, setTapBehavior] = useState('preview');
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const tabNavigation = useTabNavigation();

    const [isPickerVisible, setPickerVisible] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState('All');

    const folders = useFolderStore().folders.filter(f => f.type === 'prompts');
    const filteredFunctions = filterByFolder(functions, selectedFolder);


    useEffect(() => {
        const load = async () => {
            const stored = await AsyncStorage.getItem(FUNCTION_STORAGE_KEY);
            if (stored) {
                setFunctions(JSON.parse(stored));
            }
        };
        load();

        const unsubscribe = navigation.addListener('focus', load);
        return () => unsubscribe();
    }, [navigation]);

    useEffect(() => {
        const loadBehavior = async () => {
            const behavior = await AsyncStorage.getItem('@prompt_tap_behavior');
            setTapBehavior(behavior || 'preview');
        };
        loadBehavior();
    }, []);

    const handleFunctionTap = async (content: string) => {
        try {
            const behavior = await AsyncStorage.getItem('@prompt_tap_behavior');
            navigation.navigate('Main', {
                screen: 'Sandbox',
                params: {
                    prefill: content,
                    autoRun: behavior === 'run',
                },
            });
        } catch (err) {
            console.error('Failed to navigate to sandbox:', err);
        }
    };

    const handleDeleteFunction = async (id: string) => {
        const updated = functions.filter((f) => f.id !== id);
        setFunctions(updated);
        await AsyncStorage.setItem(FUNCTION_STORAGE_KEY, JSON.stringify(updated));
    };

    const renderEmptyState = () => (
        <EmptyState
            category={category}
            onCreatePress={() => {
                tabNavigation.navigate('Sandbox', {});
            }}
        />
    );

    const renderFunctionItem = ({ item }: { item: Prompt }) => (
        <PromptCard
            title={item.title}
            content={item.content}
            onPress={() => handleFunctionTap(item.content)}
            onEdit={() =>
                navigation.navigate('Main', {
                    screen: 'Sandbox',
                    params: {
                        editId: item.id,
                        prefill: item.content,
                        autoRun: false,
                    },
                })
            }
            onDelete={() => handleDeleteFunction(item.id)}
            onRun={() => handleFunctionTap(item.content)}
        />
    );

    const toggleFolderPicker = () => {
        setPickerVisible((prev) => !prev);
    };

    useEffect(() => {
        const seedFunctions = async () => {
            const existing = await AsyncStorage.getItem(FUNCTION_STORAGE_KEY);
            if (existing) return; // Don't overwrite if already seeded

            const seed = [
                {
                    id: 'fn-1',
                    title: 'Summarize Text',
                    content: `Summarize the following text in 3 bullet points: "{{input}}"`,
                    folder: 'all-functions',
                },
                {
                    id: 'fn-2',
                    title: 'Generate Music Prompt',
                    content: `Compose a melody prompt in the style of {{artist}}, using the theme "{{theme}}"`,
                    folder: 'dev-tools',
                },
                {
                    id: 'fn-3',
                    title: 'Regex Extractor',
                    content: `Extract all matches using this regex: "{{pattern}}" from this text: "{{text}}"`,
                    folder: 'dev-tools',
                },
            ];

            await AsyncStorage.setItem(FUNCTION_STORAGE_KEY, JSON.stringify(seed));
            setFunctions(seed); // Show immediately
        };

        seedFunctions();
    }, []);


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
                                <Text style={styles.modalItemText}>{folder.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
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
