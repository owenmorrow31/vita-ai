import { NextResponse } from "next/server";
import { generateMealPlan } from "@/services/ai";

export async function POST(req: Request) {
  const { goal, calories } = await req.json();

  const prompt = `Create a simple 1-day meal plan for someone whose goal is ${goal}, 
  aiming for about ${calories} calories.`;

  const plan = await generateMealPlan(prompt);

  return NextResponse.json({ plan });
}
