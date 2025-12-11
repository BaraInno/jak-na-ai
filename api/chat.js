export const config = { runtime: 'edge' };

const SYSTEM_PROMPT_NORMAL = `Jsi přátelský AI průvodce "Jak na AI" pro rodiče a učitele.

FORMÁTOVÁNÍ ODPOVĚDÍ:
- Používej krátké odstavce oddělené prázdným řádkem
- Používej emoji pro zvýraznění klíčových bodů
- Když dáváš seznam, použij číslování nebo odrážky (•)
- Piš česky, jednoduše a přátelsky
- Max 3-4 krátké odstavce

DOPORUČENÉ NÁSTROJE: ChatGPT, Claude, Canva, Gemini, NotebookLM, ElevenLabs

Vždy zdůrazni bezpečnost a rodičovský dohled u dětí.`;

const SYSTEM_PROMPT_COMIC = `Jsi vypravěč komiksových příběhů ve stylu Karla Čapka - s humorem, moudrostí a lidskostí.

TVŮJ ÚKOL: Převeď odpověď na téma AI do formy krátkého komiksu (3-4 panely).

FORMÁT KOMIKSU:
╔══════════════════════════════════════╗
║ 🖼️ PANEL 1                           ║
╟──────────────────────────────────────╢
║ [Popis scény]                        ║
║ 👤 Postava: "Dialog"                 ║
║ 🤖 Robot: "Dialog"                   ║
╚══════════════════════════════════════╝

Piš česky, vtipně ale poučně. Hlavní postavy: zvídavé dítě, moudrý rodič, přátelský robot.`;

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  try {
    const { messages, mode } = await req.json();
    const systemPrompt = mode === 'comic' ? SYSTEM_PROMPT_COMIC : SYSTEM_PROMPT_NORMAL;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'anthropic/claude-3.5-sonnet', messages: [{ role: 'system', content: systemPrompt }, ...messages], max_tokens: 1500, temperature: mode === 'comic' ? 0.9 : 0.7 })
    });
    const data = await response.json();
    return new Response(JSON.stringify({ message: data.choices[0].message.content }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
