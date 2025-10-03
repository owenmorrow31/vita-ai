"use client";
import { useState } from "react";

export default function Home() {
  const [goal, setGoal] = useState("muscle gain");
  const [calories, setCalories] = useState("2500");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setPlan(""); 

    const res = await fetch("/api/mealplan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, calories }),
    });

    const data = await res.json();
    setPlan(data.plan);
    setLoading(false);
  };

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">🍎 Vita AI</h1>
      <p className="text-gray-600">Your AI-powered meal planner</p>

      <div className="space-y-4">
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Goal (e.g. fat loss, muscle gain)"
          className="border p-2 w-full rounded"
        />

        <input
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="Calories (e.g. 2000)"
          className="border p-2 w-full rounded"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          {loading ? "Generating..." : "Generate Meal Plan"}
        </button>
      </div>

      {plan && (
        <div className="border p-4 rounded bg-gray-100 whitespace-pre-wrap">
          {plan}
        </div>
      )}
    </main>
  );
}
