import { ComposerNode } from "../../types/composer";
import { compileComposerTree } from "./compileComposerTree";

export async function runComposerTree(node: ComposerNode): Promise<string> {
    const compiledPrompt = compileComposerTree(node);
    console.log("Compiled Prompt:", compiledPrompt);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are ChatCaddy AI." },
                { role: "user", content: compiledPrompt }
            ]
        })
    });

    if (!response.ok) throw new Error("Failed to execute AI request");

    const json = await response.json();
    const result = json.choices[0]?.message?.content ?? "[No response]";

    return result;
}
