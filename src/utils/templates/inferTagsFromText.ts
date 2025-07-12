export function inferTagsFromText(text: string): string[] {
    const tags: string[] = [];

    const lower = text.toLowerCase();

    // Persona
    if (lower.includes('nursing')) tags.push('nursing', 'student');
    if (lower.includes('student')) tags.push('student');
    if (lower.includes('developer') || lower.includes('programming')) tags.push('developer');

    // Format / Audience
    if (lower.includes('email')) tags.push('email');
    if (lower.includes('professor') || lower.includes('teacher')) tags.push('professor', 'formal');
    if (lower.includes('recruiter')) tags.push('recruiter', 'job');

    // Intents
    if (lower.includes('missed') || lower.includes('class')) tags.push('apology', 'missed_class');
    if (lower.includes('follow up')) tags.push('followup');
    if (lower.includes('recommendation')) tags.push('ask_recommendation');

    // Tone hints
    if (lower.includes('apologize')) tags.push('polite');
    if (lower.includes('help') || lower.includes('struggling')) tags.push('support');

    return tags;
}
