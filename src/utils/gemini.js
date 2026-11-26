export async function gemini(parts, system, maxTokens = 1200) {
  const r = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts }],
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
    }),
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e.error?.message || `HTTP ${r.status}`);
  }
  const d = await r.json();
  return d.candidates[0].content.parts[0].text;
}

export function parseJSON(txt) {
  const m = txt.match(/[\[{][\s\S]*[\]}]/);
  if (!m) throw new Error('No JSON');
  return JSON.parse(m[0]);
}
