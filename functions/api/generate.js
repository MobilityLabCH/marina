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
        content: "Tu es Marina, photographe artistique et professionnelle basée à Sitges, Espagne. Ton style d'écriture est chaleureux, direct, poétique, avec parfois une pointe d'humour subtil. Tu rédiges des briefs photographiques personnalisés pour tes clients. Réponds UNIQUEMENT avec le texte demandé — exactement 3 paragraphes séparés par une ligne vide. Pas de titre, pas de liste, pas de puces, pas de prix, pas d'introduction, pas d'explication. Juste les 3 paragraphes."
      },
      {
        role: "user",
        content: text
      }
    ];

    const result = await context.env.AI.run(model, {
      messages,
      max_tokens: 800
    });

    const output = result?.response ?? (typeof result === "string" ? result : JSON.stringify(result));

    if (!output || output.trim().length < 50) {
      return new Response(JSON.stringify({ error: "Réponse IA vide ou trop courte" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Nettoyer les éventuels préfixes parasites du modèle
    let clean = output.trim();
    clean = clean.replace(/^(voici (le|mon) brief[^:]*:|here'?s? (the|your) brief[^:]*:|brief[^:]*:)\s*/i, "");
    clean = clean.replace(/^(cher|chère|dear)\s+\w+,?\s*/i, "");

    return new Response(JSON.stringify({ result: clean }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message ?? "Erreur inconnue" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
