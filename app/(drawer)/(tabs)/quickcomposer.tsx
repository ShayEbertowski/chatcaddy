// [QuickComposerScreen.tsx]
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
import { runPrompt } from '../../../src/utils/prompt/runPrompt';
import { PREDEFINED_TAGS, PREDEFINED_MODIFIERS } from '../../../src/constants/entities';

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

    const [modalStep, setModalStep] = useState<'type' | 'select'>('type');
    const [insertType, setInsertType] = useState<'template' | 'snippet' | 'tag' | 'modifier' | null>(null);

    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);

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
        setModalStep('type');
        setInsertType(null);
    };

    const handleRun = async () => {
        const templateText = selectedTemplates.map((t) => t.content).join('\n\n').trim();

        // Detect translation intent
        const translatedModifier = selectedModifiers.find((m) =>
            m.toLowerCase().startsWith('translate to ')
        );
        const isTranslation = !!translatedModifier;
        const targetLanguage = translatedModifier?.split('translate to ')[1] ?? '';

        // Build strong language persona + rule enforcement
        const translationInstruction = isTranslation
            ? `You are a professional storyteller who only writes in ${targetLanguage}. From start to finish, your entire output must be written in ${targetLanguage}, using correct grammar and vocabulary as used by native speakers. Do not write in any other language.`
            : '';

        // Other modifiers (skip translation one)
        const otherModifiers = selectedModifiers
            .filter((m) => !m.toLowerCase().startsWith('translate to '))
            .map((m) => `- ${m}`)
            .join('\n');

        const modifierLine = otherModifiers
            ? `Apply the following modifiers:\n${otherModifiers}`
            : '';

        // Tags
        const tagLine = selectedTags.length > 0
            ? `Your response should reflect the following tags: ${selectedTags.map(t => `#${t}`).join(', ')}.`
            : '';

        // Smart prompt enrichment
        const baseUserText = text.trim();
        const isShort = baseUserText.length < 60;
        const enrichedUserText =
            !templateText && isShort && !baseUserText.toLowerCase().includes('story')
                ? `Write a short, creative story based on the following: ${baseUserText}`
                : baseUserText;

        const finalUserPrompt = isTranslation
            ? `Tell a short and creative story in ${targetLanguage}: ${enrichedUserText}`
            : enrichedUserText;

        // Final input
        const finalInput = [
            translationInstruction,
            modifierLine,
            tagLine,
            templateText,
            finalUserPrompt,
        ]
            .filter(Boolean)
            .join('\n\n');

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
                <View style={{ alignItems: 'flex-end', marginBottom: 16 }}>
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        style={styles.insertIconButton}
                    >
                        <Text style={{ fontSize: 20, color: colors.accent }}>＋</Text>
                    </TouchableOpacity>
                </View>

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
                                        onPress={() =>
                                            setSelectedTemplates((prev) => prev.filter((t) => t.id !== template.id))
                                        }
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

                <View style={styles.selectedList}>
                    {selectedTags.map((tag) => (
                        <View
                            key={tag}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                backgroundColor: colors.card,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                marginBottom: 8,
                                borderRadius: 999,
                            }}
                        >
                            <Text style={[sharedStyles.chipText, { color: colors.text }]}>#{tag}</Text>

                            <TouchableOpacity
                                onPress={() =>
                                    setSelectedTags((prev) => prev.filter((t) => t !== tag))
                                }
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


                {selectedModifiers.length > 0 && (
                    <CollapsibleSection title="Selected Modifiers" isOpen onToggle={() => { }}>
                        <View style={styles.selectedList}>
                            {selectedModifiers.map((mod) => (
                                <View
                                    key={mod}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                        backgroundColor: colors.card,
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        marginBottom: 8,
                                        borderRadius: 999,
                                    }}
                                >
                                    <Text style={[sharedStyles.chipText, { color: colors.text }]}>
                                        {mod}
                                    </Text>

                                    <TouchableOpacity
                                        onPress={() =>
                                            setSelectedModifiers((prev) => prev.filter((m) => m !== mod))
                                        }
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
                    onRequestClose={() => {
                        setModalVisible(false);
                        setModalStep('type');
                        setInsertType(null);
                    }}
                    dismissOnBackdropPress
                >
                    {modalStep === 'type' ? (
                        <>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>What would you like to insert?</Text>
                            <View style={styles.modalButtonList}>
                                {['Prompt', 'Snippet', 'Tag', 'Modifier'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => {
                                            setInsertType(type.toLowerCase() as any);
                                            setModalStep('select');
                                        }}
                                        style={styles.insertTypeButton}
                                    >
                                        <Text style={styles.insertTypeText}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    ) : (
                        <ScrollView style={{ maxHeight: 300 }}>
                            {insertType === 'tag' || insertType === 'modifier' ? (
                                (insertType === 'tag' ? PREDEFINED_TAGS : PREDEFINED_MODIFIERS).map((label) => (
                                    <TouchableOpacity
                                        key={label}
                                        onPress={() => {
                                            if (insertType === 'tag') {
                                                if (!selectedTags.includes(label)) setSelectedTags((prev) => [...prev, label]);
                                            } else {
                                                if (!selectedModifiers.includes(label)) setSelectedModifiers((prev) => [...prev, label]);
                                            }
                                            setModalVisible(false);
                                            setModalStep('type');
                                            setInsertType(null);
                                        }}
                                        style={styles.insertTypeButton}
                                    >
                                        <Text style={styles.insertTypeText}>
                                            {insertType === 'tag' ? `#${label}` : label}
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                entities
                                    .filter((e) => e.entityType.toLowerCase() === insertType)
                                    .map((entity) => (
                                        <TouchableOpacity
                                            key={entity.id}
                                            onPress={() => handleTemplateSelect(entity)}
                                            style={styles.insertTypeButton}
                                        >
                                            <Text style={styles.insertTypeText}>{entity.title}</Text>
                                        </TouchableOpacity>
                                    ))
                            )}
                        </ScrollView>
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
        templateContentText: {
            fontSize: 15,
            lineHeight: 22,
            textAlign: 'left',
        },
        insertTypeButton: {
            backgroundColor: colors.surface,
            borderColor: colors.borderThin,
            borderWidth: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 6,
            marginBottom: 12,
            alignItems: 'center',
        },
        insertTypeText: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
        },
        modalButtonList: {
            marginTop: 12,
        },
        insertIconButton: {
            backgroundColor: colors.surface,
            borderColor: colors.borderThin,
            borderWidth: 1,
            padding: 8,
            borderRadius: 6,
        },
    });
