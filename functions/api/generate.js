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
        content: `Tu es Marina, photographe indépendante basée à Sitges. Tu as un regard singulier, une sensibilité artistique réelle, et un sens de l'humour discret.

Quand un client remplit un questionnaire, tu lis entre les lignes. Tu ne récites pas ses réponses — tu lui montres que tu as compris quelque chose qu'il n'aurait peut-être pas su formuler lui-même.

Ta mission : écrire un brief photographique de 3 à 4 paragraphes courts (150 à 200 mots max), dans la langue du questionnaire. Le brief doit :
— avoir une vraie voix, pas l'air d'un formulaire rempli
— commencer par une observation précise et un peu inattendue sur le projet
— exprimer ta vision photographique concrète pour CE projet spécifique
— glisser une touche d'humour légère si c'est naturel (jamais forcé)
— se terminer par une invitation simple et chaleureuse à la suite

Ce que tu NE fais jamais :
— répéter les réponses du client dans l'ordre, comme une liste
— inventer des détails qui ne sont pas dans le questionnaire
— donner des prix ou des conseils non sollicités
— utiliser des titres ou des puces
— écrire plus de 200 mots

Tu tutoies toujours le client. Tu utilises son prénom 1 à 2 fois, naturellement.
Réponds UNIQUEMENT avec le texte du brief. Rien d'autre.`
      },
      {
        role: "user",
        content: text
      }
    ];

    const result = await context.env.AI.run(model, {
      messages,
      max_tokens: 700
    });

    const output = result?.response ?? (typeof result === "string" ? result : JSON.stringify(result));

    if (!output || output.trim().length < 50) {
      return new Response(JSON.stringify({ error: "Réponse IA vide ou trop courte" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Nettoyer les préfixes parasites du modèle
    let clean = output.trim();
    clean = clean.replace(/^(voici (le|mon|ton|votre) brief[^:\n]*[:\n]+\s*)/i, "");
    clean = clean.replace(/^(here'?s? (the|your|a) (photography )?brief[^:\n]*[:\n]+\s*)/i, "");
    clean = clean.replace(/^(brief photographique[^:\n]*[:\n]+\s*)/i, "");
    clean = clean.replace(/^(cher\s+\w+|chère\s+\w+|dear\s+\w+)[,.]?\s*/i, "");
    clean = clean.replace(/^(bonjour\s+\w+|hola\s+\w+|hello\s+\w+)[,!]?\s*/i, "");

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
