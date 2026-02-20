export async function onRequestPost(context) {
  const { text, mode = "shorten" } = await context.request.json();

  const instruction = {
    shorten: "Raccourcis en gardant le sens. 1 seule version.",
    rewrite: "Reformule en français pro et fluide. 1 seule version.",
    fix: "Corrige grammaire et ponctuation. 1 seule version."
  }[mode] || "Raccourcis en gardant le sens. 1 seule version.";

  // Modèle rapide et très correct pour de la réécriture
  const model = "@cf/meta/llama-3.1-8b-instruct-fast";

  const messages = [
    { role: "system", content: "Tu es un assistant de réécriture. Réponds uniquement avec le texte final, sans explications." },
    { role: "user", content: `${instruction}\n\nTEXTE:\n${text}` }
  ];

  const result = await context.env.AI.run(model, { messages });

  // Selon les modèles, Cloudflare renvoie souvent un champ "response"
  const output = result?.response ?? JSON.stringify(result);

  return new Response(JSON.stringify({ result: output }), {
    headers: { "Content-Type": "application/json" }
  });
}
