export async function onRequestPost({ request, env }) {
  try {
    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const hfRes = await fetch(
      `https://api-inference.huggingface.co/models/${env.HF_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 260, temperature: 0.7, return_full_text: false },
        }),
      }
    );

    const data = await hfRes.json().catch(() => null);

    if (!hfRes.ok) {
      return new Response(JSON.stringify({ error: "HF error", details: data }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const text =
      (Array.isArray(data) && data[0]?.generated_text) ||
      (data && data.generated_text) ||
      "";

    return new Response(JSON.stringify({ generated_text: (text || "").trim() }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
