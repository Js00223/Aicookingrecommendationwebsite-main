import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Heart } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";

interface SavedTrade {
  id: string | number;
  trades: {
    id: string | number;
    item_name: string;
    price: number;
    status: string;
    image_url?: string;
    description?: string;
  } | null;
}

export default function Likes() {
  const navigate = useNavigate();
  const [items, setItems] = useState<SavedTrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikes = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // 💡 핵심 수정:
        // 1. 현재 saved_recipes.recipe_id가 'recipes' 테이블을 참조하고 있다면 에러가 납니다.
        // 2. 만약 거래(trades) 전용 찜 테이블이 따로 없다면,
        //    직접 'trades' 테이블을 참조하도록 이름을 명시하거나 조인 대상을 바꿔야 합니다.
        // 3. 여기서는 테이블 관계를 유추하여 'trades' 테이블을 직접 조인하도록 쿼리를 짭니다.

        const { data, error } = await supabase
          .from("saved_recipes")
          .select(
            `
            id,
            trades:recipe_id ( 
              id,
              item_name,
              price,
              status,
              image_url,
              description
            )
          `,
          )
          .eq("user_id", user.id);

        if (error) {
          // 만약 여기서 계속 에러가 난다면, saved_recipes 테이블이 'recipes' 테이블하고만
          // 강하게 연결(FK)되어 있어서 trades 테이블을 못 찾는 것입니다.
          console.error("데이터 조회 에러:", error.message);
        } else if (data) {
          // 데이터가 배열로 들어오는 구조 해결
          const formattedData = data
            .map((item: any) => ({
              id: item.id,
              trades: Array.isArray(item.trades) ? item.trades[0] : item.trades,
            }))
            .filter((item: any) => item.trades !== null); // 거래 데이터가 있는 것만 필터링

          setItems(formattedData);
        }
      } catch (err) {
        console.error("예상치 못한 오류:", err);
      } finally {
        setLoading(false);
      }
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
        <h1 className="text-lg font-bold">관심 거래</h1>
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
            <p className="text-gray-500">관심 있는 상품이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const trade = item.trades;
              if (!trade) return null;

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/trades/${trade.id}`)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="w-24 h-24 bg-gray-100 flex-shrink-0">
                    {trade.image_url ? (
                      <img
                        src={trade.image_url}
                        alt={trade.item_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        이미지 없음
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-800 line-clamp-1 text-sm">
                          {trade.item_name}
                        </h3>
                        <Heart className="w-4 h-4 text-orange-500 fill-orange-500 flex-shrink-0 ml-2" />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {trade.status === "active" ? "판매중" : "거래완료"}
                      </p>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="font-bold text-orange-600">
                        {trade.price?.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
