export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `Jsi přátelský AI průvodce jménem "Jak na AI". Pomáháš rodičům a učitelům s AI ve vzdělávání. Mluv česky, jednoduše, dávej praktické tipy. Odpovídej stručně (max 2-3 odstavce). Doporučuj nástroje: ChatGPT, Claude, Canva, Gemini, NotebookLM. Zdůrazňuj bezpečnost a dohled nad dětmi.`;

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  try {
    const { messages } = await req.json();
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'anthropic/claude-3-haiku', messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages], max_tokens: 1000 })
    });
    const data = await response.json();
    return new Response(JSON.stringify({ message: data.choices[0].message.content }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
