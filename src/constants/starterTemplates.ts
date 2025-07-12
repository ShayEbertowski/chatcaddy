export const starterTemplates = [
    {
        id: 'missed-class-apology',
        title: 'Apologize for Missing Class',
        tags: ['student', 'professor', 'email', 'apology', 'missed_class', 'polite'],
        generate: ({ rawInput }: { rawInput: string }) =>
            `Hi Professor,\n\n${rawInput}\n\nI just wanted to apologize and ask if there's anything I need to catch up on.\n\nThanks!`,
    },
    {
        id: 'followup-interview',
        title: 'Follow Up After a Job Interview',
        tags: ['email', 'recruiter', 'followup', 'job', 'polite'],
        generate: ({ rawInput }: { rawInput: string }) =>
            `Hi,\n\n${rawInput}\n\nJust following up on the interview — looking forward to any updates!\n\nBest,`,
    }
];
