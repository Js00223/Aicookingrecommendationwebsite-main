import { useNavigate } from "react-router";
import { ArrowLeft, Utensils } from "lucide-react";

export default function MyRecipes() {
  const navigate = useNavigate();
  const recipes = []; // 여기에 DB 데이터를 연결할 예정

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4 flex items-center gap-4 sticky top-0">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>
        <h1 className="text-lg font-bold">내가 쓴 레시피</h1>
      </header>

      <div className="max-w-md mx-auto p-4">
        {recipes.length === 0 ? (
          <div className="text-center py-20">
            <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">아직 등록한 레시피가 없어요.</p>
            <button className="mt-4 text-orange-500 font-bold">
              첫 레시피 작성하기
            </button>
          </div>
        ) : (
          <div className="space-y-4">{/* 레시피 카드 반복문 공간 */}</div>
        )}
      </div>
    </div>
  );
}
