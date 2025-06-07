// src/core/composer/utils/mapper.ts

import { ComposerTreeItem } from "../../../app/(drawer)/(composer)";
import { ComposerTreeRecord } from "../../core/types/composer";


export function mapTreeRecordToItem(record: ComposerTreeRecord): ComposerTreeItem {
    return {
        ...record.tree_data,
        treeId: record.id
    };
}
