import { starterTemplates } from "../../constants/starterTemplates";

export function matchTemplate(tags: string[]) {
    if (!tags || tags.length === 0) return null;

    const scored = starterTemplates.map((template) => {
        const score = template.tags.reduce((count, tag) =>
            tags.includes(tag) ? count + 1 : count, 0
        );
        return { template, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored[0]?.score > 0 ? scored[0].template : null;
}
