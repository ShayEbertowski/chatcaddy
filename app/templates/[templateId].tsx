import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Snackbar } from 'react-native-paper';
import { v4 as uuidv4 } from 'uuid';

import { useColors } from '../../src/hooks/useColors';
import { ThemedSafeArea } from '../../src/components/shared/ThemedSafeArea';
import { ThemedButton } from '../../src/components/ui/ThemedButton';
import { supabase } from '../../src/lib/supabaseClient';
import { inferTagsFromText } from '../../src/utils/templates/inferTagsFromText';
import SavePromptModal from '../../src/components/modals/SavePromptModal';
import { generateSmartTitle } from '../../src/utils/prompt/generateSmartTitle';
import { useComposerStore } from '../../src/stores/useComposerStore';

export default function TemplateDetailScreen() {
    const colors = useColors();
    const router = useRouter();
    const { rawInput: rawInputParam } = useLocalSearchParams();

    const [output, setOutput] = useState('');
    const [rawInput, setRawInput] = useState('');
    const [inferredTags, setInferredTags] = useState<string[]>([]);

    const [showModal, setShowModal] = useState(false);
    const [saveTitle, setSaveTitle] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [snackOpen, setSnackOpen] = useState(false);

    useEffect(() => {
        if (typeof rawInputParam === 'string') {
            setRawInput(rawInputParam);
            const tags = inferTagsFromText(rawInputParam);
            setInferredTags(tags);
            setOutput(`You are writing something for: ${rawInputParam}`);
        }
    }, [rawInputParam]);

    const handleTryAgain = () => {
        router.back();
    };

    const openSaveModal = async () => {
        setIsGenerating(true);
        try {
            const smart = await generateSmartTitle(output);
            setSaveTitle(smart || 'Untitled Template');
        } catch {
            setSaveTitle('Untitled Template');
        } finally {
            setIsGenerating(false);
            setShowModal(true);
        }
    };

    const handleConfirmSave = async () => {
        setSaving(true);
        try {
            await createNewTemplate(saveTitle, output); // ✅ use correct vars
            setShowModal(false);
            setSnackOpen(true);
        } catch (err) {
            console.error('❌ Failed to save template:', err);
        } finally {
            setSaving(false);
        }
    };
    const createNewTemplate = async (title: string, content: string) => {
        const { createEmptyTree, updateNode, saveTree } = useComposerStore.getState();
        const { treeId, rootId } = await createEmptyTree();

        updateNode(rootId, {
            title: title || 'Untitled',
            content,
        });

        await saveTree();

        return { treeId, rootId };
    };

    return (
        <ThemedSafeArea>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>Suggested Template</Text>
                    {output ? (
                        <Text style={[styles.inputText, { color: colors.secondaryText }]}>{output}</Text>
                    ) : (
                        <ActivityIndicator color={colors.primary} />
                    )}
                </View>

                <View style={styles.footer}>
                    {/* <ThemedButton
                        title="Try Again"
                        onPress={handleTryAgain}
                        colorKey="accent"
                        style={{ marginBottom: 12 }}
                    /> */}
                    <ThemedButton
                        title="Save"
                        onPress={openSaveModal}
                        colorKey="primary"
                    />
                </View>

                <SavePromptModal
                    visible={showModal}
                    title={saveTitle}
                    prompt={output}
                    onChangeTitle={setSaveTitle}
                    onCancel={() => setShowModal(false)}
                    onConfirm={handleConfirmSave}
                    selectedFolder=""
                    loading={isGenerating || saving}
                />

                <Snackbar
                    visible={snackOpen}
                    onDismiss={() => {
                        setSnackOpen(false);
                        router.replace('/library'); // Or wherever you want to route after save
                    }}
                    duration={1200}
                    style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.accentSoft,
                        borderWidth: 1,
                        borderRadius: 8,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        marginHorizontal: 16,
                    }}
                >
                    <Text style={{ color: colors.onSurface }}>Template saved!</Text>
                </Snackbar>
            </View>
        </ThemedSafeArea>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 12,
    },
    inputText: {
        fontSize: 16,
        marginBottom: 24,
    },
    footer: {
        paddingTop: 16,
    },
});
