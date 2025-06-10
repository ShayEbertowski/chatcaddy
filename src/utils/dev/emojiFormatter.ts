/**
 * 🚧 Dev Utility - Safe to keep for future AI-powered formatting experiments.
 * 
 * This helper uses OpenAI to prefix each line of text with contextually appropriate emojis.
 * 
 * Not wired into production code. Keep for future use during development or debugging.
 */



// TODO: this below isnt working, but I dont need it yet anyways. Just provisioning
// import { OpenAI } from 'openai';  // <-- assumes you're using openai npm package

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY
// });

// export async function prefixLinesWithEmojisAI(text: string): Promise<string> {
//     const prompt = `
// You are an assistant that rewrites multi-line text by prefixing each line with a contextually appropriate emoji. 
// Choose emojis that match the meaning of the text, but don't overdo it. 
// Keep the rest of the text unchanged after the emoji. Use one emoji per line.

// Example:

// Input:
// Line 1: Build the rocket
// Line 2: Fuel the engines
// Line 3: Perform safety checks

// Output:
// 🚀 Build the rocket
// ⛽ Fuel the engines
// 🧪 Perform safety checks

// Now process this input:

// ${text}
//     `.trim();

//     const response = await openai.chat.completions.create({
//         model: 'gpt-4o',
//         messages: [
//             { role: 'system', content: 'You are a helpful assistant that formats text by prefixing lines with suitable emojis.' },
//             { role: 'user', content: prompt }
//         ],
//         temperature: 0.3,
//         max_tokens: 500
//     });

//     const result = response.choices[0]?.message?.content?.trim();
//     return result ?? text;
// }
