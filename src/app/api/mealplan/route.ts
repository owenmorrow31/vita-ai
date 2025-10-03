import { NextResponse } from "next/server";
import { generateMealPlan } from "@/services/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { goal, calories, days = 1, dietaryRestrictions = [] } = body;

    if (!goal || !calories) {
      return NextResponse.json(
        { error: "Goal and calories are required" },
        { status: 400 }
      );
    }

    const caloriesNum = parseInt(calories);
    if (isNaN(caloriesNum) || caloriesNum < 1000 || caloriesNum > 10000) {
      return NextResponse.json(
        { error: "Calories must be between 1000 and 10000" },
        { status: 400 }
      );
    }

    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 7) {
      return NextResponse.json(
        { error: "Days must be between 1 and 7" },
        { status: 400 }
      );
    }

    let prompt = `Create a detailed ${daysNum}-day meal plan for someone whose goal is ${goal}, aiming for about ${caloriesNum} calories per day.`;

    if (dietaryRestrictions.length > 0) {
      prompt += ` Dietary restrictions: ${dietaryRestrictions.join(', ')}.`;
    }

    prompt += ` For each day, provide:
- Breakfast, Lunch, Dinner, and Snacks
- Approximate calories and macros (protein, carbs, fat) for each meal
- Brief preparation instructions
- Total daily calories and macros

Format the response clearly with headers for each day and meal.`;

    const plan = await generateMealPlan(prompt);

    return NextResponse.json({ plan, success: true });
  } catch (error) {
    console.error("Meal plan generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate meal plan. Please try again." },
      { status: 500 }
    );
  }
}
