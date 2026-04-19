import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Heart } from "lucide-react";
import { supabase } from "../utils/supabaseClient";

// TypeScript 에러 방지를 위한 인터페이스 정의
interface SavedRecipe {
  id: string | number;
  recipes: {
    id: string | number;
    title: string;
    content: string;
  };
}

export default function Likes() {
  const navigate = useNavigate();
  const [items, setItems] = useState<SavedRecipe[]>([]); // 타입을 SavedRecipe 배열로 지정
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikes = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Supabase에서 유저가 찜한 레시피와 해당 레시피의 정보를 조인해서 가져옴
      const { data, error } = await supabase
        .from("saved_recipes")
        .select(
          `
          id,
          recipes (
            id,
            title,
            content
          )
        `,
        )
        .eq("user_id", user.id);

      if (!error && data) {
        // Supabase 조인 결과가 배열 형태이므로 타입 캐스팅 후 저장
        setItems(data as any as SavedRecipe[]);
      }
      setLoading(false);
    };

    fetchLikes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4 flex items-center gap-4 sticky top-0 z-40">
        <button
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">관심 목록</h1>
      </header>

      <div className="max-w-md mx-auto p-4">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-400">불러오는 중...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">찜한 레시피가 없습니다.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 text-orange-500 font-medium"
            >
              레시피 보러가기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/saved-recipes/${item.recipes.id}`)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="flex-1 mr-4">
                  <h3 className="font-bold text-gray-800">
                    {item.recipes.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {item.recipes.content}
                  </p>
                </div>
                <Heart className="w-5 h-5 text-orange-500 fill-orange-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
