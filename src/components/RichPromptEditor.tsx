import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    NativeSyntheticEvent,
    TextInputSelectionChangeEventData,
} from 'react-native';
import VariableModal from './modals/VariableModal'; // adjust path as needed
import { useVariableStore } from '../stores/useVariableStore';
import { MaterialIcons } from '@expo/vector-icons';

type PromptPart =
    | { type: 'text'; value: string }
    | { type: 'variable'; value: string };

type Props = {
    text: string;
    onChangeText: (newText: string) => void;
    onEditVariable?: (name: string) => void;
};

export default function RichPromptEditor({
    text,
    onChangeText,
    onEditVariable,
}: Props) {
    const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });

    // Modal state
    const [showVariableModal, setShowVariableModal] = useState(false);
    const [tempVariableName, setTempVariableName] = useState('');
    const [tempVariableValue, setTempVariableValue] = useState('');
    const [isEditingVariable, setIsEditingVariable] = useState(false);
    const [originalVariableName, setOriginalVariableName] = useState('');
    const [showVariables, setShowVariables] = useState(false);
    const filledValues = useVariableStore((state) => state.values);
    const setVariable = useVariableStore((state) => state.setVariable);


    const handleEditVariable = (name: string) => {
        setIsEditingVariable(true);
        setOriginalVariableName(name);
        setTempVariableName(name);
        setTempVariableValue(useVariableStore.getState().getVariable(name) ?? '');
        setShowVariableModal(true);
    };


    const parsePrompt = (input: string): PromptPart[] => {
        const parts = input.split(/({{.*?}})/g);
        return parts.map(part => {
            const match = part.match(/^{{(.*?)}}$/);
            if (match) return { type: 'variable', value: match[1] };
            return { type: 'text', value: part };
        });
    };

    const usedVars = Array.from(
        new Set(
            parsePrompt(text)
                .filter((part) => part.type === 'variable')
                .map((part) => part.value)
        )
    );

    const preview = text.replace(/{{(.*?)}}/g, (_, name) => {
        const value = useVariableStore.getState().getVariable(name);
        return value?.trim() ? value : '?';
    });

    const parsePreviewChunks = (str: string): { type: 'text' | 'variable', value: string }[] => {
        const parts = str.split(/({{.*?}})/g);
        return parts.map(part => {
            const match = part.match(/^{{(.*?)}}$/);
            if (match) {
                return { type: 'variable', value: match[1] };
            }
            return { type: 'text', value: part };
        });
    };


    const insertNamedVariable = () => {
        if (isEditingVariable) {
            // Replace all instances of the old variable name
            const updatedText = text.replace(
                new RegExp(`{{${originalVariableName}}}`, 'g'),
                `{{${tempVariableName}}}`
            );

            onChangeText(updatedText);

            // Update store
            useVariableStore.getState().setVariable(tempVariableName, tempVariableValue);

        } else {
            // Insert new variable at cursor
            const before = text.slice(0, selection.start);
            const after = text.slice(selection.end);
            const insert = `{{${tempVariableName}}}`;
            const newText = before + insert + after;
            const newCursor = before.length + insert.length;

            onChangeText(newText);
            setSelection({ start: newCursor, end: newCursor });

            useVariableStore.getState().setVariable(tempVariableName, tempVariableValue);
        }

        // Clear modal state
        setTempVariableName('');
        setTempVariableValue('');
        setIsEditingVariable(false);
        setOriginalVariableName('');
        setShowVariableModal(false);
    };




    const renderPart = (part: PromptPart, i: number) => {
        if (part.type === 'text') {
            return null; // Don't render plain text chunks in chip preview
        }

        return (
            <TouchableOpacity
                key={i}
                onPress={() => handleEditVariable(part.value)}
                style={styles.chip}
            >
                <Text style={styles.chipText}>{part.value}</Text>
            </TouchableOpacity>
        );
    };


    const getVariableIcon = (name: string): string | undefined => {
        const lower = name.toLowerCase();

        if (lower.includes('count') || lower.includes('number') || lower.includes('amount') || lower.includes('total')) {
            return '🔢';
        }
        if (lower.includes('year') || lower.includes('date') || lower.includes('time')) {
            return '📅';
        }
        if (lower.includes('city') || lower.includes('place') || lower.includes('location') || lower.includes('destination')) {
            return '🧭';
        }
        if (lower.includes('name') || lower.includes('person') || lower.includes('user')) {
            return '🧑';
        }
        if (lower.includes('topic') || lower.includes('subject')) {
            return '📚';
        }

        return undefined; // ← no icon if no match
    };




    return (
        <View style={styles.container}>
            {/* Row with +Variable aligned right */}
            <View style={styles.headerRow}>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                    onPress={() => {
                        setIsEditingVariable(false);
                        setOriginalVariableName('');
                        setTempVariableName('');
                        setTempVariableValue('');
                        setShowVariableModal(true);
                    }}
                    style={styles.addButton}
                >
                    <Text style={styles.addButtonText}>+ Variable</Text>
                </TouchableOpacity>

            </View>




            <TextInput
                value={text}
                onChangeText={onChangeText}
                onSelectionChange={(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) =>
                    setSelection(e.nativeEvent.selection)
                }
                selection={selection}
                multiline
                style={styles.input}
                placeholder="Try anything here..."
            />

            {/* Toggle row above the section */}
            <TouchableOpacity
                onPress={() => setShowVariables(!showVariables)}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}
            >
                <Text style={styles.sectionTitle}>
                    {showVariables ? 'Hide' : 'Show'} variables
                </Text>
                <MaterialIcons
                    name={showVariables ? 'expand-less' : 'expand-more'}
                    size={20}
                    color="#8e8e93"
                />
            </TouchableOpacity>

            {/* Collapsible section with variables inside */}
            {showVariables && (
                <View style={styles.chipContainer}>
                    {usedVars.length === 0 ? (
                        <Text style={{ color: '#999', fontStyle: 'italic', paddingVertical: 6 }}>
                            No variables yet. Add one above.
                        </Text>
                    ) : (
                        usedVars.map((varName, i) =>
                            renderPart({ type: 'variable', value: varName }, i)
                        )
                    )}
                </View>
            )}


            <View style={styles.divider} />


            <Text style={styles.sectionTitle}>Preview:</Text>
            <View style={styles.section}>
                <View style={styles.previewContainer}>

                    <Text style={styles.previewText}>
                        {parsePreviewChunks(text).map((chunk, i) => {
                            if (chunk.type === 'variable') {
                                const rawValue = useVariableStore.getState().getVariable(chunk.value);
                                const isMissing = !rawValue?.trim();
                                const display = isMissing ? '⚠️' : rawValue;
                                const icon = isMissing ? getVariableIcon(chunk.value) : undefined;

                                return (
                                    <Text
                                        key={i}
                                        style={[
                                            styles.previewVariable,
                                            isMissing && styles.previewVariableMissing,
                                        ]}
                                    >
                                        {icon ? `${icon} ` : ''}{display}
                                    </Text>
                                );
                            }

                            return <Text key={i}>{chunk.value}</Text>;
                        })}

                    </Text>
                </View>

            </View>


            <View style={styles.divider} />


            <VariableModal
                visible={showVariableModal}
                variableName={tempVariableName}
                variableValue={tempVariableValue}
                onChangeName={setTempVariableName}
                onChangeValue={setTempVariableValue}
                onClose={() => setShowVariableModal(false)}
                onInsert={insertNamedVariable}
            />
        </View>
    );

}

const styles = StyleSheet.create({
    section: {
        backgroundColor: '#f2f2f7', //light mode: '#f2f2f7' dark mode: 'light mode: '#1c1c1e'
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginBottom: 12
    },

    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#8e8e93',
        marginTop: 24,
        marginBottom: 12
    },

    divider: {
        height: StyleSheet.hairlineWidth, // usually 1px
        backgroundColor: '#c6c6c8', // iOS light divider (or '#d1d1d6')
        marginVertical: 12, // spacing above and below
    },

    container: {
        padding: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 8,
    },
    input: {
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 16,
        borderRadius: 6,
        minHeight: 60,
    },
    addButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    addButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    renderedPrompt: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        alignItems: 'center',
        marginTop: 12,
    },
    text: {
        fontSize: 16,
    },

    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10,
    },
    chip: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginRight: 6,
        marginBottom: 6,
    },

    chipText: {
        fontSize: 16,
        fontWeight: '500',
    },
    previewContainer: {
        marginTop: 16,
    },
    previewLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 4,
    },
    previewText: {
        fontSize: 16,
        color: '#222',
        flexWrap: 'wrap',
        lineHeight: 22,
        paddingBottom: 8
    },
    previewVariable: {
        backgroundColor: '#eee',
        color: '#555',
        fontStyle: 'italic',
        fontWeight: 'bold',
        paddingHorizontal: 4,
        borderRadius: 4,
    },

    previewVariableMissing: {
        // keep this here in casez
    },
    previewVariableNumber: {
        // color: '#0057D9',
    },
    previewVariableLocation: {
        // color: '#007a5e',
    },

});
