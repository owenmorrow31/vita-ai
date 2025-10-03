"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import MealPlanCard from "@/components/MealPlanCard";
import MealPlanViewer from "@/components/MealPlanViewer";
import { supabase } from "@/lib/supabase";

interface MealPlan {
  id: string;
  title: string;
  goal: string;
  calories: number;
  days: number;
  dietary_restrictions: string[];
  plan_content: string;
  created_at: string;
}

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
  "Low-Carb",
  "Halal",
  "Kosher",
];

const GOAL_OPTIONS = [
  "Weight Loss",
  "Muscle Gain",
  "Maintenance",
  "Athletic Performance",
  "General Health",
];

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "history">("generate");

  const [goal, setGoal] = useState("Weight Loss");
  const [calories, setCalories] = useState("2000");
  const [days, setDays] = useState("1");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedPlans, setSavedPlans] = useState<MealPlan[]>([]);
  const [viewingPlan, setViewingPlan] = useState<MealPlan | null>(null);
  const [saveTitle, setSaveTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSavedPlans();
    }
  }, [user]);

  const fetchSavedPlans = async () => {
    if (!user) return;

    const session = await supabase.auth.getSession();
    if (!session.data.session) return;

    const res = await fetch("/api/mealplans", {
      headers: {
        Authorization: `Bearer ${session.data.session.access_token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      setSavedPlans(data.mealPlans || []);
    }
  };

  const toggleDietaryRestriction = (restriction: string) => {
    setDietaryRestrictions((prev) =>
      prev.includes(restriction)
        ? prev.filter((r) => r !== restriction)
        : [...prev, restriction]
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setError("");
    setPlan("");

    try {
      const res = await fetch("/api/mealplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, calories, days, dietaryRestrictions }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate meal plan");
        return;
      }

      setPlan(data.plan);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!user || !plan) return;

    if (!saveTitle.trim()) {
      setError("Please enter a title for your meal plan");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) return;

      const res = await fetch("/api/mealplans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({
          title: saveTitle,
          goal,
          calories,
          days,
          dietaryRestrictions,
          planContent: plan,
        }),
      });

      if (res.ok) {
        setSaveTitle("");
        setPlan("");
        await fetchSavedPlans();
        setActiveTab("history");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save meal plan");
      }
    } catch {
      setError("Failed to save meal plan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!user) return;

    const session = await supabase.auth.getSession();
    if (!session.data.session) return;

    const res = await fetch(`/api/mealplans?id=${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.data.session.access_token}`,
      },
    });

    if (res.ok) {
      await fetchSavedPlans();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
              V
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              Vita AI
            </h1>
          </div>
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Your AI-Powered Meal Planner
          </h2>
          <p className="text-lg text-gray-600">
            Create personalized meal plans tailored to your goals and dietary needs
          </p>
        </div>

        {user && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
              <button
                onClick={() => setActiveTab("generate")}
                className={`px-6 py-2 rounded-md transition-all ${
                  activeTab === "generate"
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Generate Plan
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-6 py-2 rounded-md transition-all ${
                  activeTab === "history"
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                My Plans ({savedPlans.length})
              </button>
            </div>
          </div>
        )}

        {activeTab === "generate" ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fitness Goal
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {GOAL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Daily Calories
                  </label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    min="1000"
                    max="10000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number of Days
                  </label>
                  <input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    min="1"
                    max="7"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Dietary Restrictions
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleDietaryRestriction(option)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        dietaryRestrictions.includes(option)
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white text-gray-700 border-gray-300 hover:border-green-500"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold text-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating Your Meal Plan...
                  </span>
                ) : (
                  "Generate Meal Plan"
                )}
              </button>
            </div>

            {plan && (
              <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-bold text-gray-900">Your Meal Plan</h3>
                  {user && (
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={saveTitle}
                        onChange={(e) => setSaveTitle(e.target.value)}
                        placeholder="Enter plan title..."
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleSavePlan}
                        disabled={isSaving || !saveTitle.trim()}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-200 pt-6">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {plan}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {savedPlans.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Saved Meal Plans Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Generate your first meal plan and save it to access it anytime!
                </p>
                <button
                  onClick={() => setActiveTab("generate")}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Generate Your First Plan
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedPlans.map((mealPlan) => (
                  <MealPlanCard
                    key={mealPlan.id}
                    mealPlan={mealPlan}
                    onDelete={handleDeletePlan}
                    onView={setViewingPlan}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {viewingPlan && (
        <MealPlanViewer
          mealPlan={viewingPlan}
          onClose={() => setViewingPlan(null)}
        />
      )}
    </div>
  );
}
