import { useRouter } from 'expo-router';
import { usePromptEditorStore } from './usePromptEditorStore';

export function useNavigateToEditor() {
    const router = useRouter();
    const setEntityType = usePromptEditorStore((s) => s.setEntityType);
    const resetEditor = usePromptEditorStore((s) => s.resetEditor);

    return (entityType: 'Prompt' | 'Function' | 'Snippet') => {
        resetEditor();
        setEntityType(entityType);
        router.push('/2-sandbox');
    };
}
