// src/core/composer/utils/mapper.ts

import { ComposerTreeItem, ComposerTreeRecord } from "../../core/types/composer";


export function mapTreeRecordToItem(record: ComposerTreeRecord): ComposerTreeItem {
    return {
        ...record.tree_data,
        treeId: record.id
    };
}
