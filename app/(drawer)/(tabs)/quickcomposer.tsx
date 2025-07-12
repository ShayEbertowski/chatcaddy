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
} from 'react-native';

import { useColors } from '../../../src/hooks/useColors';
import { ThemedSafeArea } from '../../../src/components/shared/ThemedSafeArea';
import { getSharedStyles } from '../../../src/styles/shared';
import { ThemedButton } from '../../../src/components/ui/ThemedButton';
import BaseModal from '../../../src/components/modals/BaseModal';
import { starterTemplates } from '../../../src/constants/starterTemplates';
import { supabase } from '../../../src/lib/supabaseClient';

export default function QuickComposerScreen() {
    const colors = useColors();
    const sharedStyles = getSharedStyles(colors);
    const styles = getStyles(colors);

    const [text, setText] = useState('');
    const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
    const [modalVisible, setModalVisible] = useState(false);


    const insertTemplate = (templateText: string) => {
        const before = text.slice(0, selection.start);
        const after = text.slice(selection.end);
        const inserted = `${before}${templateText}${after}`;
        setText(inserted);

        const newCursor = before.length + templateText.length;
        setSelection({ start: newCursor, end: newCursor });
        setModalVisible(false);
    };

    type IndexedEntity = {
        id: string;
        tree_id: string;
        root_id: string;
        entityType: string;
        title: string;
        content: string;
        variables: Record<string, any>;
    };

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


    return (
        <ThemedSafeArea>
            <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
                <ThemedButton
                    title="Insert Template"
                    onPress={() => setModalVisible(true)}
                    colorKey="accent"
                    style={{ marginBottom: 16 }}
                />

                <TextInput
                    value={text}
                    onChangeText={setText}
                    onSelectionChange={(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) =>
                        setSelection(e.nativeEvent.selection)
                    }
                    selection={selection}
                    multiline
                    placeholder="Start typing or paste a prompt..."
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
                                onPress={() => insertTemplate(template.content)}
                                style={[styles.templateButton, { borderColor: colors.border }]}
                            >
                                <Text style={[styles.templateText, { color: colors.accent }]}>
                                    {template.title}
                                </Text>
                            </TouchableOpacity>
                        ))
                    )}

                </BaseModal>
            </ScrollView>
        </ThemedSafeArea>
    );
}

const getStyles = (colors: ReturnType<typeof useColors>) =>
    StyleSheet.create({
        container: {
            flexGrow: 1,
            padding: 24,
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
            color: '#007AFF', // iOS blue
        },


    });
