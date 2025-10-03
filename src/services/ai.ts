import OpenAI from "openai";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env file.");
  }

  return new OpenAI({
    apiKey: apiKey
  });
}

export async function generateMealPlan(prompt: string) {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are Vita AI, a meal planning assistant." },
      { role: "user", content: prompt }
    ]
  });

  return response.choices[0].message?.content ?? "";
}
