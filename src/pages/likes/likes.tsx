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

        // saved_recipes 테이블에서 현재 유저의 찜 목록을 가져오며 trades 정보를 조인합니다.
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
          console.error("데이터 조회 에러:", error.message);
        } else if (data) {
          // 조인된 데이터가 배열이거나 객체일 경우를 대비해 포맷팅
          const formattedData = data
            .map((item: any) => ({
              id: item.id,
              trades: Array.isArray(item.trades) ? item.trades[0] : item.trades,
            }))
            .filter((item: any) => item.trades !== null); // 데이터가 매칭되지 않는 건 제외

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
    // 💡 핵심: 부모 요소(카드 div)의 onClick(상세페이지 이동)이 실행되지 않도록 막음
    e.stopPropagation();

    if (!window.confirm("관심 목록에서 삭제하시겠습니까?")) return;

    try {
      // DB에서 해당 찜 기록 삭제
      const { error } = await supabase
        .from("saved_recipes")
        .delete()
        .eq("id", savedId);

      if (error) throw error;

      // 💡 UI 업데이트: 삭제된 아이템을 제외하고 상태값 변경 (새로고침 없이 즉시 반영)
      setItems((prev) => prev.filter((item) => item.id !== savedId));
    } catch (err) {
      console.error("해제 실패:", err);
      alert("찜 해제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <header className="bg-white border-b p-4 flex items-center gap-4 sticky top-0 z-40">
        <button
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">관심 거래</h1>
      </header>

      {/* 관심 목록 리스트 */}
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
                  {/* 상품 이미지 구역 */}
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

                  {/* 상품 정보 구역 */}
                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-800 line-clamp-1 text-sm">
                          {trade.item_name}
                        </h3>

                        {/* 💡 찜 해제 버튼: 하트 아이콘 클릭 시 handleUnsave 실행 */}
                        <button
                          onClick={(e) => handleUnsave(e, item.id)}
                          className="p-1 -mr-1 hover:bg-gray-100 rounded-full transition-colors z-10"
                          title="관심 목록에서 제거"
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
