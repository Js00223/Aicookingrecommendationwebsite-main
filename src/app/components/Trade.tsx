import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Search,
  Plus,
  Heart,
  MessageCircle,
  User,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../../utils/supabaseClient";

// 데이터 구조 정의
interface TradeItem {
  id: string;
  item_name: string;
  price: number;
  location: string;
  image_url: string;
  status: string;
  created_at: string;
  user_id: string;
  type: string;
  author?: {
    full_name: string;
    avatar_url: string;
  };
}

export default function Trade() {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "liked">("all");
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // 탭 상태가 변경될 때마다 데이터를 다시 불러옵니다.
  useEffect(() => {
    fetchTrades();
  }, [activeTab]);

  const fetchTrades = async () => {
    setLoading(true);
    setDebugInfo("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (activeTab === "all") {
        // --- 1. [전체] 탭 로직 ---
        const { data, error } = await supabase
          .from("trades")
          .select(
            `
            *,
            author:user_id(full_name, avatar_url)
          `,
          )
          .eq("type", "trade") // 식재료 거래글만 필터링
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTrades(data || []);
      } else {
        // --- 2. [관심 상품] 탭 로직 (에러 수정 완료) ---
        if (!user) {
          setDebugInfo("로그인이 필요한 서비스입니다.");
          setTrades([]);
          setLoading(false);
          return;
        }

        // 💡 [수정 포인트] trade_id 대신 실제 존재하는 컬럼명 recipe_id를 사용합니다.
        const { data: savedData, error: savedError } = await supabase
          .from("saved_recipes")
          .select("recipe_id")
          .eq("user_id", user.id);

        if (savedError) throw savedError;

        if (!savedData || savedData.length === 0) {
          // 찜한 데이터가 아예 없는 경우
          setTrades([]);
        } else {
          // 가져온 recipe_id 리스트를 배열로 만듭니다.
          const likedIds = savedData
            .map((item) => item.recipe_id)
            .filter(Boolean);

          if (likedIds.length === 0) {
            setTrades([]);
          } else {
            // 찜한 ID들에 해당하는 게시글만 trades 테이블에서 가져옵니다.
            const { data: likedPosts, error: postError } = await supabase
              .from("trades")
              .select(
                `
                *,
                author:user_id(full_name, avatar_url)
              `,
              )
              .in("id", likedIds) // ID 리스트에 포함된 것만
              .eq("type", "trade")
              .order("created_at", { ascending: false });

            if (postError) throw postError;
            setTrades(likedPosts || []);
          }
        }
      }
    } catch (err: any) {
      console.error("❌ 데이터 로드 중 예외 발생:", err);
      setDebugInfo(`데이터를 불러오지 못했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 검색어 필터링
  const filteredTrades = trades.filter((trade) =>
    (trade.item_name || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 검색 바 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-lg font-bold text-gray-900">식재료 거래</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="식재료 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        {/* 오류 메시지 출력 영역 */}
        {debugInfo && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{debugInfo}</p>
          </div>
        )}

        {/* 상단 탭 (전체 / 관심 상품) */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === "all"
                ? "bg-orange-500 text-white shadow-md"
                : "bg-white border text-gray-500 hover:bg-gray-50"
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setActiveTab("liked")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === "liked"
                ? "bg-orange-500 text-white shadow-md"
                : "bg-white border text-gray-500 hover:bg-gray-50"
            }`}
          >
            관심 상품
          </button>
        </div>

        {/* 게시글 그리드 리스트 */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 font-medium">
            데이터를 불러오는 중입니다...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTrades.map((trade) => (
              <Link key={trade.id} to={`/trades/${trade.id}`}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all h-full flex flex-col group">
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={
                        trade.image_url ||
                        "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop"
                      }
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt={trade.item_name}
                    />
                    <div
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm ${
                        trade.status === "active"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    >
                      {trade.status === "active" ? "판매중" : "거래완료"}
                    </div>
                  </div>

                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-bold text-sm mb-1 truncate text-gray-900">
                      {trade.item_name}
                    </h3>
                    <p className="text-orange-600 font-extrabold text-base mb-2">
                      {Number(trade.price || 0).toLocaleString()}원
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-auto pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-1">
                        <User size={12} className="text-gray-300" />
                        <span className="truncate w-16">
                          {trade.author?.full_name || "익명"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5">
                          <Heart
                            className={`w-3 h-3 ${activeTab === "liked" ? "fill-orange-500 text-orange-500" : ""}`}
                          />{" "}
                          찜
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MessageCircle className="w-3 h-3" /> 0
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 결과 없음 메시지 */}
        {!loading && filteredTrades.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-400 text-sm">
              {activeTab === "all"
                ? "등록된 거래 상품이 없습니다."
                : "관심 목록에 등록된 상품이 없습니다."}
            </p>
          </div>
        )}
      </div>

      {/* 새 게시글 작성 버튼 */}
      <button
        onClick={() => navigate("/trades/new")}
        className="fixed bottom-24 right-6 bg-orange-500 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:bg-orange-600 transition-all z-40"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}
