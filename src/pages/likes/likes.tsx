import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Heart } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";

// 데이터 구조 정의
interface SavedTrade {
  id: string | number; // saved_recipes 테이블의 PK
  trades: {
    id: string | number; // trades 테이블의 PK
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

  // 1. 초기 데이터 불러오기
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

        // 💡 수정 포인트: trade_id를 통한 조인 확인
        // 만약 DB 컬럼명이 recipe_id라면 그대로 두시고, 일반적인 거래 테이블용이면 trade_id일 가능성이 큽니다.
        const { data, error } = await supabase
          .from("saved_recipes")
          .select(
            `
            id,
            user_id,
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
          .eq("user_id", user.id); // ✅ 현재 로그인한 유저의 데이터만 필터링

        if (error) {
          console.error("데이터 조회 에러:", error.message);
        } else if (data) {
          // 데이터 포맷팅 및 null 제외 처리
          const formattedData = data
            .map((item: any) => ({
              id: item.id,
              trades: Array.isArray(item.trades) ? item.trades[0] : item.trades,
            }))
            .filter((item: any) => item.trades !== null);

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

  // 2. 찜 해제(삭제) 함수
  const handleUnsave = async (
    e: React.MouseEvent,
    savedId: string | number,
  ) => {
    e.stopPropagation();

    if (!window.confirm("관심 목록에서 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from("saved_recipes")
        .delete()
        .eq("id", savedId);

      if (error) throw error;

      // UI 즉각 반영
      setItems((prev) => prev.filter((item) => item.id !== savedId));
    } catch (err) {
      console.error("해제 실패:", err);
      alert("찜 해제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4 flex items-center gap-4 sticky top-0 z-40">
        <button
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">관심 목록 ({items.length})</h1>
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
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex active:scale-[0.98] transition-all cursor-pointer relative"
                >
                  <div className="w-24 h-24 bg-gray-100 flex-shrink-0">
                    {trade.image_url ? (
                      <img
                        src={trade.image_url}
                        alt={trade.item_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
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

                        <button
                          onClick={(e) => handleUnsave(e, item.id)}
                          className="p-1 -mr-1 hover:bg-gray-100 rounded-full transition-colors z-10"
                        >
                          <Heart className="w-5 h-5 text-orange-500 fill-orange-500 flex-shrink-0" />
                        </button>
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
