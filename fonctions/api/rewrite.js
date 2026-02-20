export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Missing text parameter" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const model = "@cf/meta/llama-3.1-8b-instruct-fast";

    const messages = [
      {
        role: "system",
        content:
          "Tu es Marina, photographe professionnelle et artistique basée à Sitges, Espagne. Tu as un style chaleureux, direct, parfois avec une pointe d'humour. Tu rédiges des briefs personnalisés pour tes clients. Réponds UNIQUEMENT avec le texte du brief — 3 paragraphes séparés par une ligne vide, 200 à 250 mots au total. Pas de titre, pas de liste, pas de puces, pas de prix, pas d'introduction, pas d'explication. Juste le texte des 3 paragraphes.",
      },
      {
        role: "user",
        content: text,
      },
    ];

    const result = await context.env.AI.run(model, {
      messages,
      max_tokens: 600,
    });

    // Cloudflare Workers AI returns { response: "..." }
    const output =
      result?.response ??
      (typeof result === "string" ? result : JSON.stringify(result));

    if (!output || output.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "AI returned empty or too-short response" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    return new Response(JSON.stringify({ result: output.trim() }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err?.message ?? "Unknown error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
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
