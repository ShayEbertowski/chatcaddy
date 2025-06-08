import React from 'react';
import Dropdown from './Dropdown';
import { EntityType } from '../../types/entity';

type Props = {
    value: EntityType;
    options: EntityType[];
    onSelect: (val: EntityType) => void;
};

export default function EntityTypeDropdown({ value, options, onSelect }: Props) {
    const mappedOptions = options.map(type => ({ label: type, value: type }));
    return (
        <Dropdown
            value={value}
            options={mappedOptions}
            onSelect={(val) => onSelect(val as EntityType)}
        />
    );
}
