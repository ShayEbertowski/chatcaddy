import { ComposerTreeRecord } from "../../core/types/composer";

// src/core/composer/utils/mapper.ts
export function mapTreeRecordToItem(record: ComposerTreeRecord): { id: string; name: string } {
    return {
        id: record.id,
        name: record.name,
    };
}
