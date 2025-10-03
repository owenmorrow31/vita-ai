import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export async function generateMealPlan(prompt: string) {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are Vita AI, a meal planning assistant." },
      { role: "user", content: prompt }
    ]
  });

  return response.choices[0].message?.content ?? "";
}
