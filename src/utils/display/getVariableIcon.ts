export function getVariableIcon(name: string): string | undefined {
    const lower = name.toLowerCase();

    if (lower.includes('count') || lower.includes('number') || lower.includes('amount') || lower.includes('total')) {
        return '🔢';
    }
    if (lower.includes('year') || lower.includes('date') || lower.includes('time')) {
        return '📅';
    }
    if (lower.includes('city') || lower.includes('place') || lower.includes('location') || lower.includes('destination')) {
        return '🧭';
    }
    if (lower.includes('name') || lower.includes('person') || lower.includes('user')) {
        return '🧑';
    }
    if (lower.includes('topic') || lower.includes('subject')) {
        return '📚';
    }

    return undefined;
}
