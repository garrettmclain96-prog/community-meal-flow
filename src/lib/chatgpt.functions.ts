import { createServerFn } from "@tanstack/react-start";

type AssistantContext = {
  householdName: string;
  weeklyBudget: number;
  dinnersPerWeek: number;
  storeName: string;
  gap: number;
  excludedCount: number;
  meals: Array<{
    title: string;
    minutes: number;
    costPerServing: number;
    reasons: string[];
  }>;
};

type AssistantResult = { answer: string; model: string } | { error: string };

function stringifyContext(context: AssistantContext): string {
  return JSON.stringify(context, null, 2);
}

function readErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const error = "error" in payload ? payload.error : null;
  if (!error || typeof error !== "object") return null;
  return "message" in error && typeof error.message === "string" ? error.message : null;
}

function extractOutputText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  if ("output_text" in payload && typeof payload.output_text === "string") {
    return payload.output_text.trim() || null;
  }
  if (!("output" in payload) || !Array.isArray(payload.output)) return null;

  const lines: string[] = [];
  for (const item of payload.output) {
    if (!item || typeof item !== "object" || !("content" in item) || !Array.isArray(item.content)) {
      continue;
    }
    for (const block of item.content) {
      if (!block || typeof block !== "object") continue;
      if ("text" in block && typeof block.text === "string") {
        lines.push(block.text);
      }
    }
  }

  const text = lines.join("\n").trim();
  return text || null;
}

export const askMealPlanAssistant = createServerFn({ method: "POST" })
  .validator((data: { prompt: string; context: AssistantContext }) => {
    const prompt = data.prompt?.trim();
    if (!prompt) throw new Error("Ask ChatGPT a question first.");
    if (prompt.length > 1200) throw new Error("Keep your question under 1200 characters.");
    if (!data.context || data.context.meals.length === 0) {
      throw new Error("Build a meal plan before using ChatGPT.");
    }
    return { ...data, prompt };
  })
  .handler(async ({ data }): Promise<AssistantResult> => {
    const apiKey = process.env["OPENAI_API_KEY"];
    const model = process.env["OPENAI_MODEL"] ?? "gpt-4.1-mini";

    if (!apiKey) {
      return { error: "ChatGPT is not connected yet. Add OPENAI_API_KEY on the server." };
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: ["Bearer", apiKey].join(" "),
      },
      body: JSON.stringify({
        model,
        max_output_tokens: 450,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: "You are MealForge's ChatGPT assistant. Give concise, practical help based only on the provided household and meal-plan context. Do not invent allergies, ingredients, prices, or nutrition facts. Respect the budget and any avoided foods in the context.",
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Meal plan context:\n${stringifyContext(data.context)}\n\nQuestion:\n${data.prompt}`,
              },
            ],
          },
        ],
      }),
    });

    const payload = (await response.json().catch(() => null)) as unknown;
    if (!response.ok) {
      return {
        error: readErrorMessage(payload) ?? "ChatGPT could not answer right now.",
      };
    }

    const answer = extractOutputText(payload);
    if (!answer) return { error: "ChatGPT returned an empty response." };

    return { answer, model };
  });
