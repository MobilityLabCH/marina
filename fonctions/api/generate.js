export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Données manquantes" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const model = "@cf/meta/llama-3.1-8b-instruct-fast";
    const messages = [
      {
        role: "system",
        content: "Tu es Marina, photographe artistique à Sitges. Ton style est chaleureux, pro et poétique. Rédige un brief personnalisé basé sur les infos fournies. Réponds UNIQUEMENT avec 3 paragraphes fluides, sans titres, sans listes, sans prix. Environ 200 mots."
      },
      {
        role: "user",
        content: `Rédige mon brief pour ce projet : ${text}`
      }
    ];

    const result = await context.env.AI.run(model, { messages, max_tokens: 800 });
    const output = result?.response ?? result;

    return new Response(JSON.stringify({ result: output.trim() }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
}
