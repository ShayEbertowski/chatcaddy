// import React, { useState, useLayoutEffect, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   Alert,
//   TouchableOpacity,
//   Text as RNText,
//   ScrollView,
//   FlatList,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
// import { v4 as uuidv4 } from 'uuid';
// import { SafeAreaView } from 'react-native-safe-area-context';

// import PromptInput from '../src/components/PromptInput';
// import VariableModal from '../src/components/modals/VariableModal';
// import VariableToolbarButton from '..//src/components/VariableToolbarButton';

// import { useVariables } from '../src/hooks/useVariables';
// import { insertAtCursor } from '..//src/utils/insertAtCursor';

// import { input, label, saveButton, saveButtonText } from '../src/styles/shared';
// import { RootStackParamList } from '../src/types/navigation';


// const PROMPT_STORAGE_KEY = '@prompt_library';

// export default function PromptEditorScreen() {
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [selection, setSelection] = useState({ start: 0, end: 0 });

//   const [showVariableModal, setShowVariableModal] = useState(false);
//   const [tempVariableName, setTempVariableName] = useState('');

//   const navigation = useNavigation();
//   const route = useRoute<RouteProp<RootStackParamList, 'Edit Prompt'>>();
//   const isEditing = !!route.params?.prompt;

//   const { variables, filledValues, setFilledValues } = useVariables(content);

//   const uuid = uuidv4();


//   useLayoutEffect(() => {
//     navigation.setOptions({
//       title: isEditing ? 'Edit Prompt' : 'Save Prompt',
//     });
//   }, [navigation, isEditing]);

//   useEffect(() => {
//     if (isEditing) {
//       const { title, content } = route.params.prompt;
//       setTitle(title);
//       setContent(content);
//     }
//   }, [isEditing]);

//   const handleSavePrompt = async () => {
//     try {
//       if (!title.trim() || !content.trim()) {
//         Alert.alert('Missing Fields', 'Please provide both a title and content.');
//         return;
//       }

//       const newPrompt = {
//         id: isEditing ? route.params.prompt.id : uuidv4(),
//         title: title.trim(),
//         content: content.trim(),
//       };

//       const existing = await AsyncStorage.getItem(PROMPT_STORAGE_KEY);
//       const prompts = existing ? JSON.parse(existing) : [];

//       const updatedPrompts = isEditing
//         ? prompts.map((p: { id: string; }) => (p.id === newPrompt.id ? newPrompt : p))
//         : [...prompts, newPrompt];

//       await AsyncStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(updatedPrompts));
//       navigation.goBack();
//     } catch (error) {
//       console.error('Error saving prompt:', error);
//       Alert.alert('Save Failed', 'There was an error saving your prompt.');
//     }
//   };

//   const openVariableDialog = () => {
//     setTempVariableName('');
//     setShowVariableModal(true);
//   };

//   const insertNamedVariable = () => {
//     const name = tempVariableName.trim();
//     if (!name) return;

//     const { updated, newCursor } = insertAtCursor(content, selection, `{{${name}}}`);
//     setContent(updated);
//     setSelection({ start: newCursor, end: newCursor });
//     setShowVariableModal(false);
//   };

//   return (
//     <>
//       <VariableModal
//         visible={showVariableModal}
//         variableName={tempVariableName}
//         onChangeName={setTempVariableName}
//         onClose={() => setShowVariableModal(false)}
//         onInsert={insertNamedVariable}
//       />

//       <SafeAreaView style={styles.container}>
//         <ScrollView contentContainerStyle={styles.scroll} keyboardDismissMode="on-drag">
//           <VariableToolbarButton onPress={openVariableDialog} />

//           <PromptInput
//             label="Prompt Title:"
//             value={title}
//             onChangeText={setTitle}
//             placeholder="Enter a title"
//           />

//           <PromptInput
//             label="Prompt Content:"
//             value={content}
//             onChangeText={setContent}
//             multiline
//             numberOfLines={4}
//             placeholder="Enter prompt content"
//             onSelectionChange={({ nativeEvent }) => setSelection(nativeEvent.selection)}
//             selection={selection}
//           />
//         </ScrollView>

//         {variables.length > 0 && (
//           <View style={{ marginBottom: 20 }}>
//             <Text style={label}>Fill in variables:</Text>
//             <FlatList
//               data={variables}
//               keyExtractor={(item) => item}
//               renderItem={({ item }) => (
//                 <TextInput
//                   placeholder={item}
//                   value={filledValues[item]}
//                   onChangeText={(text) =>
//                     setFilledValues((prev) => ({ ...prev, [item]: text }))
//                   }
//                   style={input}
//                 />
//               )}
//             />
//           </View>
//         )}


//         <TouchableOpacity style={saveButton} onPress={handleSavePrompt}>
//           <RNText style={saveButtonText}>
//             {isEditing ? 'Update Prompt' : 'Save Prompt'}
//           </RNText>
//         </TouchableOpacity>
//       </SafeAreaView>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scroll: {
//     padding: 20,
//     paddingBottom: 100,
//   },
// });
