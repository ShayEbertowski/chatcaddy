import { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    NativeSyntheticEvent,
    TextInputSelectionChangeEventData,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';

import { useColors } from '../../../src/hooks/useColors';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { getSharedStyles } from '../../../src/styles/shared';
import { ThemedButton } from '../../../src/components/ui/ThemedButton';
import BaseModal from '../../../src/components/modals/BaseModal';
import { supabase } from '../../../src/lib/supabaseClient';
import CollapsibleSection from '../../../src/components/shared/CollapsibleSection';
import { PromptResult } from '../../../src/components/prompt/PromptResult';
import { Variable } from '../../../src/types/prompt';
import { runPrompt } from '../../../src/utils/prompt/runPrompt';

type IndexedEntity = {
    id: string;
    tree_id: string;
    root_id: string;
    entityType: string;
    title: string;
    content: string;
    variables: Record<string, any>;
};

export default function QuickComposerScreen() {
    const colors = useColors();
    const sharedStyles = getSharedStyles(colors);
    const styles = getStyles(colors);

    const [text, setText] = useState('');
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTemplates, setSelectedTemplates] = useState<IndexedEntity[]>([]);
    const [activeTemplate, setActiveTemplate] = useState<IndexedEntity | null>(null);
    const [showTemplates, setShowTemplates] = useState(true);
    const [response, setResponse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showResponse, setShowResponse] = useState(true);
    const [entities, setEntities] = useState<IndexedEntity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadEntities() {
            const { data, error } = await supabase
                .from('indexed_entities')
                .select('id, tree_id, root_id, entity_type, title, content, variables');

            if (error) {
                console.error('Error loading indexed entities:', error);
                return;
            }

            const normalized = (data || []).map((item) => ({
                ...item,
                entityType: item.entity_type,
                root_id: item.root_id,
                variables: item.variables ?? {},
            }));

            setEntities(normalized);
            setLoading(false);
        }

        loadEntities();
    }, []);

    const templates = useMemo(
        () => entities.filter((e) => e.entityType === 'Prompt'),
        [entities]
    );

    const handleTemplateSelect = (template: IndexedEntity) => {
        if (!selectedTemplates.find((t) => t.id === template.id)) {
            setSelectedTemplates((prev) => [...prev, template]);
        }
        setModalVisible(false);
    };

    const handleTemplateRemove = (templateId: string) => {
        setSelectedTemplates((prev) => prev.filter((t) => t.id !== templateId));
    };

    const handleRun = async () => {
        const templateText = selectedTemplates.map((t) => t.content).join('\n\n').trim();
        const userText = text.trim();
        const finalInput = [templateText, userText].filter(Boolean).join('\n\n');

        if (!finalInput) {
            Alert.alert('Empty Prompt', 'Please enter a prompt first.');
            return;
        }

        setIsLoading(true);
        setResponse(null);

        try {
            const result = await runPrompt(finalInput);
            if ('error' in result) {
                console.error(result.error);
                setResponse(`⚠️ ${result.error}`);
            } else {
                setResponse(result.response ?? '[No output]');
            }
        } catch (err) {
            console.error('Error running prompt:', err);
            Alert.alert('Error', 'There was a problem running the prompt.');
            setResponse('[Error running prompt]');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ThemedSafeArea>
            <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
                <ThemedButton
                    title="Insert Template"
                    onPress={() => setModalVisible(true)}
                    colorKey="accent"
                    style={{ marginBottom: 16 }}
                />

                {selectedTemplates.length > 0 && (
                    <CollapsibleSection
                        title="Inserted Templates"
                        isOpen={showTemplates}
                        onToggle={() => setShowTemplates(!showTemplates)}
                    >
                        <View style={styles.selectedList}>
                            {selectedTemplates.map((template) => (
                                <View
                                    key={template.id}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        marginBottom: 8,
                                        backgroundColor: colors.card,
                                        borderRadius: 999,
                                        width: '100%',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => setActiveTemplate(template)}
                                        style={{ flexShrink: 1, flex: 1 }}
                                    >
                                        <Text
                                            style={[sharedStyles.chipText, { color: colors.text }]}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            {template.title}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => handleTemplateRemove(template.id)}
                                        style={{
                                            marginLeft: 8,
                                            paddingHorizontal: 8,
                                            paddingVertical: 4,
                                            borderRadius: 999,
                                            backgroundColor: colors.error ?? '#F66',
                                        }}
                                    >
                                        <Text style={{ color: '#fff', fontSize: 12 }}>✕</Text>
                                    </TouchableOpacity>
                                </View>

                            ))}
                        </View>
                    </CollapsibleSection>

                )}

                <TextInput
                    value={text}
                    onChangeText={setText}
                    onSelectionChange={(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) =>
                        setSelection(e.nativeEvent.selection)
                    }
                    selection={selection}
                    multiline
                    placeholder="Add additional context here..."
                    placeholderTextColor={colors.secondaryText}
                    style={[styles.input, { borderColor: colors.borderThin, color: colors.text }]}
                />

                <BaseModal
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                    dismissOnBackdropPress
                >
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Insert a Template</Text>
                    {loading ? (
                        <Text style={{ color: colors.secondaryText, textAlign: 'center' }}>Loading...</Text>
                    ) : templates.length === 0 ? (
                        <Text style={{ color: colors.secondaryText, textAlign: 'center' }}>No templates found.</Text>
                    ) : (
                        templates.map((template) => (
                            <TouchableOpacity
                                key={template.id}
                                onPress={() => handleTemplateSelect(template)}
                                style={styles.templateButton}
                            >
                                <Text style={styles.templateText}>{template.title}</Text>
                            </TouchableOpacity>
                        ))
                    )}
                </BaseModal>

                <BaseModal
                    visible={!!activeTemplate}
                    onRequestClose={() => setActiveTemplate(null)}
                    dismissOnBackdropPress
                >
                    <Text style={[styles.modalTitle, { color: colors.text }]}>
                        {activeTemplate?.title}
                    </Text>
                    <ScrollView>
                        <Text style={[styles.templateContentText, { color: colors.secondaryText }]}>
                            {activeTemplate?.content}
                        </Text>
                    </ScrollView>
                </BaseModal>

                <CollapsibleSection
                    title="Response"
                    isOpen={showResponse}
                    onToggle={() => setShowResponse(prev => !prev)}
                >
                    {isLoading ? (
                        <ActivityIndicator size="large" color={colors.accent} style={{ marginVertical: 20 }} />
                    ) : (
                        <PromptResult
                            response={response ?? ''}
                            isLoading={false}
                            onClear={() => setResponse(null)}
                        />
                    )}
                </CollapsibleSection>
            </ScrollView>

            <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: 16,
                backgroundColor: colors.background,
                borderTopColor: colors.borderThin,
                borderTopWidth: 1,
            }}>
                <ThemedButton title="Run Prompt" onPress={handleRun} colorKey="primary" />
            </View>
        </ThemedSafeArea>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: {
            flexGrow: 1,
            padding: 24,
        },
        selectedList: {
            flexDirection: 'column',
            width: '100%',
        },

        input: {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 6,
            fontSize: 16,
            paddingVertical: 16,
            paddingHorizontal: 16,
            textAlignVertical: 'top',
            minHeight: 200,
            marginTop: 16,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 16,
            textAlign: 'center',
        },
        templateButton: {
            paddingVertical: 14,
            paddingHorizontal: 12,
            borderRadius: 10,
            backgroundColor: 'transparent',
            alignItems: 'center',
        },
        templateText: {
            fontSize: 17,
            fontWeight: '400',
            color: colors.onSurface,
        },
        templateContentText: {
            fontSize: 15,
            lineHeight: 22,
            textAlign: 'left',
        },
    });
