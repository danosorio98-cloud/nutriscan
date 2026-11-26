// Vercel serverless function: proxies requests to Gemini so the API key stays on the server.
const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: { message: 'Method not allowed' } });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: { message: 'GEMINI_API_KEY no está configurada' } });

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(req.body),
        signal: AbortSignal.timeout(50000),
      }
    );
    const data = await r.json().catch(() => ({}));
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: { message: e.message } });
  }
}
