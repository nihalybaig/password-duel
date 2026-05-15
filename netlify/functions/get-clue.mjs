export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { word, category, previousClues, clueNumber } = await req.json();

    if (!word || !category || clueNumber == null) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prevClueStr =
      previousClues && previousClues.length > 0
        ? `Previous clues given: ${previousClues.join(", ")}. Do NOT repeat any of these.`
        : "";

    const difficultyHint =
      clueNumber <= 2
        ? "Be creative and tricky - make them think!"
        : clueNumber <= 4
        ? "Be moderately helpful."
        : "Be very direct and helpful.";

    const prompt = `You are the clue-giver in a word guessing game called "Password". The secret word is "${word}" (category: ${category}).

Rules:
- Give exactly ONE single word as a clue
- The clue cannot be the secret word itself or any part/form of it
- The clue cannot rhyme with the secret word as a phonetic hint
- ${prevClueStr}
- Clue #${clueNumber} of 5: ${difficultyHint}

Respond with ONLY the single clue word, nothing else. No punctuation, no explanation.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 50,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI service error", status: response.status }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const clue = data.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("")
      .trim()
      .replace(/[^a-zA-Z]/g, "");

    if (!clue) {
      return new Response(JSON.stringify({ error: "Empty clue from AI" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ clue }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/get-clue",
};
