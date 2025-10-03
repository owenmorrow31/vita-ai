"use client";

import { useState } from 'react';

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

interface MealPlanCardProps {
  mealPlan: MealPlan;
  onDelete: (id: string) => void;
  onView: (mealPlan: MealPlan) => void;
}

export default function MealPlanCard({ mealPlan, onDelete, onView }: MealPlanCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this meal plan?')) return;

    setIsDeleting(true);
    await onDelete(mealPlan.id);
    setIsDeleting(false);
  };

  const date = new Date(mealPlan.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-gray-900">{mealPlan.title}</h3>
        <span className="text-sm text-gray-500">{date}</span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-700">Goal:</span>
          <span className="text-gray-600 capitalize">{mealPlan.goal}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-700">Calories:</span>
          <span className="text-gray-600">{mealPlan.calories} cal/day</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-700">Duration:</span>
          <span className="text-gray-600">{mealPlan.days} day{mealPlan.days > 1 ? 's' : ''}</span>
        </div>
        {mealPlan.dietary_restrictions.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-700">Restrictions:</span>
            <div className="flex flex-wrap gap-1">
              {mealPlan.dietary_restrictions.map((restriction, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs"
                >
                  {restriction}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(mealPlan)}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          View Plan
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {isDeleting ? '...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
