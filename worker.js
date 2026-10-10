
export default {
  async fetch(request, env) {
    const allowedOrigins = [
      "https://eagleiam20-create.github.io"
    ];

    const origin = request.headers.get("Origin") || "";

    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };

    if (allowedOrigins.includes(origin)) {
      headers["Access-Control-Allow-Origin"] = origin;
    }

    const reply = (data, status = 200) =>
      new Response(JSON.stringify(data), { status, headers });

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: allowedOrigins.includes(origin) ? 204 : 403,
        headers
      });
    }

    if (!allowedOrigins.includes(origin)) {
      return reply({ error: "Website not allowed." }, 403);
    }

    if (request.method !== "POST") {
      return reply({ error: "Use POST request." }, 405);
    }

    if (!env.GEMINI_API_KEY) {
      return reply({ error: "API secret is not configured." }, 500);
    }

    let body;

    try {
      const raw = await request.text();

      if (raw.length > 10000) {
        return reply({ error: "Request too large." }, 413);
      }

      body = JSON.parse(raw);
    } catch {
      return reply({ error: "Invalid request." }, 400);
    }

    const prompt = typeof body.prompt === "string"
      ? body.prompt.trim()
      : "";

    const languages = {
      hinglish: "easy Hinglish",
      hindi: "simple Hindi",
      english: "simple English"
    };

    const language = languages[body.language]
      ? body.language
      : "hinglish";

    if (!prompt || prompt.length > 1500) {
      return reply({
        error: "Please enter a question up to 1500 characters."
      }, 400);
    }

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text:
                  "You are ONE, an everyday life assistant. Reply in " +
                  languages[language] +
                  ". Turn the user's goal into a useful action plan. " +
                  "Return only JSON with title (string), summary (string), " +
                  "and tasks (array of 3 to 8 short strings). " +
                  "Do not claim you performed real-world actions."
              }]
            },
            contents: [{
              role: "user",
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  summary: { type: "STRING" },
                  tasks: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                  }
                },
                required: ["title", "summary", "tasks"]
              }
            }
          })
        }
      );

      if (!response.ok) {
        return reply({
          error: response.status === 429
            ? "AI usage limit reached. Try again later."
            : "Gemini request failed. Check your API setup."
        }, 502);
      }

      const result = await response.json();

      const aiText = result.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("");

      if (!aiText) {
        return reply({ error: "Gemini returned no answer." }, 502);
      }

      const plan = JSON.parse(aiText);

      if (
        typeof plan.title !== "string" ||
        typeof plan.summary !== "string" ||
        !Array.isArray(plan.tasks)
      ) {
        return reply({ error: "Invalid AI response." }, 502);
      }

      const tasks = plan.tasks
        .filter(task => typeof task === "string")
        .map(task => task.trim().slice(0, 180))
        .filter(Boolean)
        .slice(0, 8);

      if (!plan.title.trim() || tasks.length === 0) {
        return reply({ error: "No usable action plan returned." }, 502);
      }

      return reply({
        title: plan.title.trim().slice(0, 100),
        summary: plan.summary.trim().slice(0, 500),
        tasks,
        provider: "gemini",
        demo: false
      });

    } catch {
      return reply({
        error: "Could not connect to Gemini. Try again."
      }, 502);
    }
  }
};
