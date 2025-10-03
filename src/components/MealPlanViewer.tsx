"use client";

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

interface MealPlanViewerProps {
  mealPlan: MealPlan;
  onClose: () => void;
}

export default function MealPlanViewer({ mealPlan, onClose }: MealPlanViewerProps) {
  const handleExport = () => {
    const text = `${mealPlan.title}\n\nGoal: ${mealPlan.goal}\nCalories: ${mealPlan.calories} cal/day\nDuration: ${mealPlan.days} day(s)\n\n${mealPlan.plan_content}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mealPlan.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 relative">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{mealPlan.title}</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
            >
              Export
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none px-2"
            >
              ×
            </button>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200">
            <div className="bg-green-50 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-600">Goal</span>
              <p className="font-semibold text-gray-900 capitalize">{mealPlan.goal}</p>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-600">Calories</span>
              <p className="font-semibold text-gray-900">{mealPlan.calories} cal/day</p>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-600">Duration</span>
              <p className="font-semibold text-gray-900">{mealPlan.days} day{mealPlan.days > 1 ? 's' : ''}</p>
            </div>
            {mealPlan.dietary_restrictions.length > 0 && (
              <div className="bg-green-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Restrictions</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {mealPlan.dietary_restrictions.map((restriction, index) => (
                    <span
                      key={index}
                      className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium"
                    >
                      {restriction}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {mealPlan.plan_content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
