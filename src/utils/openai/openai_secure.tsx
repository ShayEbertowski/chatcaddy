import * as SecureStore from 'expo-secure-store';

const API_KEY_STORAGE_KEY = 'openai_api_key';

export async function runPrompt(promptText: any) {
  try {
    const apiKey = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);

    if (!apiKey) {
      console.warn('⚠️ No API key found in SecureStore.');
      return '⚠️ No API key found. Please enter it in Settings.';
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: promptText }],
      }),
    });

    const raw = await response.text();
    console.log('🔍 Raw OpenAI response:', raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch (parseErr) {
      console.error('❌ Failed to parse OpenAI response:', parseErr);
      return '⚠️ Invalid response format from OpenAI.';
    }

    if (data.error) {
      console.error('🚨 OpenAI API Error:', data.error.message);
      return `⚠️ API Error: ${data.error.message}`;
    }

    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      console.warn('⚠️ Unexpected response shape:', data);
      return '⚠️ No valid response received from OpenAI.';
    }

    return reply;
  } catch (err) {
    console.error('❌ Network or Fetch Error:', err);
    return '⚠️ Failed to reach OpenAI. Check your connection or key.';
  }
}