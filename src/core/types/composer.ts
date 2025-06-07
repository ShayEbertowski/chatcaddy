import { EntityType } from "../../types/entity";

export interface ComposerNode {
    id: string;
    entityType: EntityType;
    title: string;
    content: string;
    variables: Record<string, VariableValue>;
    children: ComposerNode[];
}


export type VariableValue =
    | { type: 'string'; value: string }
    | { type: 'entity'; entity: ComposerNode };


export interface ComposerTreeRecord {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    tree_data: ComposerNode;
}

export interface ComposerStoreState {
    activeTreeId: string | null;
    rootNode: ComposerNode | null;
    availableTrees: ComposerNode[];

    setRootNode(newRoot: ComposerNode): void;
    updateVariable(variableName: string, variableValue: VariableValue): void;
    loadTree(treeId: string): Promise<void>;
    saveTree(name: string): Promise<string>;
    clearTree(): void;
    listTrees(): Promise<ComposerNode[]>;   // ✅ <-- the real fix right here
    addChild(parentId: string, childNode: ComposerNode): void;
}



