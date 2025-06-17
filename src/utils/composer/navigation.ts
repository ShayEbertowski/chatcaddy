// src/utils/navigation.ts
import { router } from 'expo-router';

export function navigateToTree(treeId: string, rootId: string) {
    if (!treeId || !rootId) {
        console.error("❌ Missing treeId or rootId:", { treeId, rootId });
        return;
    }

    router.replace(`/(drawer)/(composer)/${treeId}/${rootId}`);
}
