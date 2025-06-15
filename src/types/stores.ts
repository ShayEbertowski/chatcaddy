import { ComposerNode } from "./composer";
import { Variable } from "./prompt";

export interface ComposerStoreState {
    activeTreeId: string | null;
    rootNode: ComposerNode | null;
    availableTrees: { id: string; name: string }[];

    setRootNode: (newRoot: ComposerNode) => void;
    updateVariable: (variableName: string, variableValue: Variable) => void;
    loadTree: (treeId: string) => Promise<void>;
    saveTree: (name: string) => Promise<string | null>
    clearTree: () => void;
    listTrees: () => Promise<{ id: string; name: string }[]>;
    addChild: (parentId: string, childNode: ComposerNode) => void;
    createTree: (tree: {
        id: string;
        name: string;
        rootNode: ComposerNode;
    }) => void;
    createEmptyTree: () => Promise<string>;

}
