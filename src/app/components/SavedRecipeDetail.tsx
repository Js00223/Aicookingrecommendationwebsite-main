import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Clock, ChefHat, Trash2 } from "lucide-react";

interface SavedRecipe {
  id: string;
  name: string;
  difficulty: string;
  time: string;
  servings: string;
  ingredients: string[];
  steps: string[];
  additionalInfo?: string;
  userChoices: {
    purpose?: string;
    style?: string;
    ingredients?: string;
    cooking?: string;
    time?: string;
  };
  savedAt: string;
}

export default function SavedRecipeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [recipe, setRecipe] = useState<SavedRecipe | null>(null);

  useEffect(() => {
    const savedRecipes: SavedRecipe[] = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    const foundRecipe = savedRecipes.find(r => r.id === id);
    if (foundRecipe) {
      setRecipe(foundRecipe);
    } else {
      navigate('/saved-recipes');
    }
  }, [id, navigate]);

  const handleDelete = () => {
    if (confirm('이 레시피를 삭제하시겠습니까?')) {
      const savedRecipes: SavedRecipe[] = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
      const updatedRecipes = savedRecipes.filter(r => r.id !== id);
      localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
      navigate('/saved-recipes');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">레시피를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold">레시피 상세</h1>
          </div>
          <button
            onClick={handleDelete}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        {/* Recipe Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 lg:p-8 text-white">
          <div className="flex items-center gap-2 mb-3">
            <ChefHat className="w-8 h-8" />
            <span className="text-sm opacity-90">AI 추천 레시피</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">{recipe.name}</h1>
          <div className="flex items-center gap-4 text-sm lg:text-base">
            <span>{recipe.difficulty}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {recipe.time}
            </span>
            <span>{recipe.servings}</span>
          </div>
        </div>

        {/* User Choices */}
        <div className="bg-white p-4 lg:p-6 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 mb-2">선택한 조건</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {recipe.userChoices.purpose && (
              <span className="bg-orange-50 text-orange-600 text-sm px-3 py-1 rounded-full">
                목적: {recipe.userChoices.purpose}
              </span>
            )}
            {recipe.userChoices.style && (
              <span className="bg-blue-50 text-blue-600 text-sm px-3 py-1 rounded-full">
                스타일: {recipe.userChoices.style}
              </span>
            )}
            {recipe.userChoices.cooking && (
              <span className="bg-green-50 text-green-600 text-sm px-3 py-1 rounded-full">
                조리: {recipe.userChoices.cooking}
              </span>
            )}
          </div>
          {recipe.userChoices.ingredients && (
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-medium">사용 재료:</span> {recipe.userChoices.ingredients}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-0 lg:gap-6 lg:p-6">
          {/* Ingredients */}
          <div className="bg-white p-6 border-b lg:border-b-0 lg:rounded-xl lg:shadow-sm border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🥘 필요한 재료
            </h2>
            <div className="space-y-2">
              {recipe.ingredients.map((ingredient, idx) => (
                <p key={idx} className="text-gray-700 leading-relaxed">
                  {ingredient}
                </p>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="bg-white p-6 border-b lg:border-b-0 lg:rounded-xl lg:shadow-sm border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              👨‍🍳 조리 방법
            </h2>
            <div className="space-y-4">
              {recipe.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <p className="flex-1 text-gray-700 leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {recipe.additionalInfo && (
          <div className="bg-white p-6 lg:mx-6 lg:rounded-xl lg:shadow-sm border-b lg:border-b-0 border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              💡 추가 정보
            </h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {recipe.additionalInfo}
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="bg-white p-4 text-center text-sm text-gray-500 lg:mx-6 lg:rounded-b-xl">
          저장 일시: {formatDate(recipe.savedAt)}
        </div>
      </div>
    </div>
  );
}