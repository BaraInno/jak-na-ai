export const config = { runtime: 'edge' };

const SYSTEM_PROMPT_NORMAL = `Jsi přátelský AI průvodce "Jak na AI" pro rodiče a učitele.

FORMÁTOVÁNÍ ODPOVĚDÍ:
- Používej krátké odstavce oddělené prázdným řádkem
- Používej emoji pro zvýraznění klíčových bodů
- Když dáváš seznam, použij číslování nebo odrážky (•)
- Piš česky, jednoduše a přátelsky
- Max 3-4 krátké odstavce

STRUKTURA ODPOVĚDI:
1. Krátký úvod (1-2 věty)
2. Hlavní obsah (tipy, vysvětlení)
3. Povzbuzení nebo tip na závěr

DOPORUČENÉ NÁSTROJE: ChatGPT, Claude, Canva, Gemini, NotebookLM, ElevenLabs

Vždy zdůrazni bezpečnost a rodičovský dohled u dětí.`;

const SYSTEM_PROMPT_COMIC = `Jsi vypravěč komiksových příběhů ve stylu Karla Čapka - s humorem, moudrostí a lidskostí.

TVŮJ ÚKOL:
Převeď odpověď na téma AI do formy krátkého komiksu (3-4 panely).

FORMÁT KOMIKSU:
Použij tento formát pro každý panel:

╔══════════════════════════════════════╗
║ 🖼️ PANEL 1                           ║
╟──────────────────────────────────────╢
║ [Popis scény: co je na obrázku]      ║
║                                      ║
║ 👤 Postava: "Dialog postavy"         ║
║ 🤖 Robot: "Dialog robota"            ║
╚══════════════════════════════════════╝

PRAVIDLA:
- Piš česky, vtipně ale poučně (styl Čapka - R.U.R., Válka s mloky)
- Hlavní postavy: zvídavé dítě, moudrý rodič/učitel, přátelský robot
- Každý panel má popis scény a dialogy
- Poslední panel má vždy moudré poučení
- Celkem 3-4 panely
- Buď kreativní a zábavný!`;

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  
  try {
    const { messages, mode } = await req.json();
    
    const systemPrompt = mode === 'comic' ? SYSTEM_PROMPT_COMIC : SYSTEM_PROMPT_NORMAL;
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://jak-na-ai.vercel.app',
        'X-Title': 'Jak na AI'
      },
      body: JSON.stringify({ 
        model: 'anthropic/claude-3.5-sonnet', 
        messages: [{ role: 'system', content: systemPrompt }, ...messages], 
        max_tokens: 1500,
        temperature: mode === 'comic' ? 0.9 : 0.7
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('API Error:', data.error);
      throw new Error(data.error.message || 'API error');
    }
    
    return new Response(JSON.stringify({ 
      message: data.choices[0].message.content 
    }), { 
      headers: { 'Content-Type': 'application/json' } 
    });
    
  } catch (error) {
    console.error('Handler Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
