import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { ArrowLeft, Trash2, Clock, ChefHat } from "lucide-react";

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

export default function SavedRecipes() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);

  useEffect(() => {
    // 로컬 스토리지에서 저장된 레시피 불러오기
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    setRecipes(savedRecipes.reverse()); // 최신순으로 정렬
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('이 레시피를 삭제하시겠습니까?')) {
      const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
      localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes.reverse()));
      setRecipes(updatedRecipes);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-orange-500" />
            <h1 className="text-lg font-bold">저장된 레시피</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ChefHat className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">저장된 레시피가 없습니다</p>
            <p className="text-sm text-gray-400 mb-6">AI 추천을 받아보세요!</p>
            <Link to="/ai-chat">
              <button className="bg-orange-500 text-white font-medium py-3 px-6 rounded-xl hover:bg-orange-600 transition-colors">
                AI 요리 추천 받기
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <Link key={recipe.id} to={`/saved-recipes/${recipe.id}`}>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{recipe.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{recipe.difficulty}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {recipe.time}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(recipe.id);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {recipe.userChoices.purpose && (
                      <span className="bg-orange-50 text-orange-600 text-xs px-2 py-1 rounded-full">
                        {recipe.userChoices.purpose}
                      </span>
                    )}
                    {recipe.userChoices.style && (
                      <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">
                        {recipe.userChoices.style}
                      </span>
                    )}
                    {recipe.userChoices.cooking && (
                      <span className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded-full">
                        {recipe.userChoices.cooking}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400">{formatDate(recipe.savedAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}