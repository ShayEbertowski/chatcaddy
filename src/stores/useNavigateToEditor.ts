import { useRouter } from 'expo-router';
import { useEditorStore } from '../stores/useEditorStore';

export function useNavigateToEditor() {
    const router = useRouter();
    const setEditingEntity = useEditorStore((s) => s.setEditingEntity);
    const resetEditor = useEditorStore((s) => s.resetEditor);

    return (entityType: 'Prompt' | 'Function' | 'Snippet', entity?: any, autoRun?: boolean) => {
        resetEditor();
        if (entity) {
            setEditingEntity(entityType, entity, { autoRun });
        }
        router.push('/2-sandbox');
    };
}
