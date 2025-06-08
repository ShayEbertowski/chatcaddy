import { ComposerNode } from "../../core/types/composer";
import { EntityType } from "../../types/entity";


export function toComposerEntityType(entityType: EntityType): ComposerNode['entityType'] {
    return entityType === 'Template' ? 'Prompt' : entityType;
}
