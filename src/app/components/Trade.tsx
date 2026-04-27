import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Search,
  MapPin,
  Plus,
  Clock,
  Heart,
  MessageCircle,
} from "lucide-react";
import { supabase } from "../../utils/supabaseClient";

interface TradeItem {
  id: string;
  item_name: string;
  price: number;
  location: string;
  image_url: string;
  status: string;
  created_at: string;
  likes_count: { count: number }[];
  comments_count: { count: number }[];
}

export default function Trade() {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "liked">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrades();
  }, [activeTab]);

  const fetchTrades = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase
      .from("trades")
      .select(
        `
        *,
        likes_count:saved_recipes(count),
        comments_count:comments(count)
      `,
      )
      .order("created_at", { ascending: false });

    // 관심 상품 탭일 경우 필터링 (내 ID가 saved_recipes에 있는 것만)
    if (activeTab === "liked" && user) {
      // 실제 구현 시에는 내 찜 목록 id 리스트를 먼저 가져와서 filter 하거나 조인 쿼리 사용
      // 여기서는 간단히 전체 로드 후 프론트 필터링 혹은 찜 테이블 기준 쿼리로 전환 가능
    }

    const { data, error } = await query;
    if (data) setTrades(data as any);
    setLoading(false);
  };

  const filteredTrades = trades.filter((trade) =>
    trade.item_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-lg font-bold">식재료 거래</h1>
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
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 rounded-full text-sm ${activeTab === "all" ? "bg-orange-500 text-white" : "bg-white border text-gray-500"}`}
          >
            전체
          </button>
          <button
            onClick={() => setActiveTab("liked")}
            className={`px-4 py-1.5 rounded-full text-sm ${activeTab === "liked" ? "bg-orange-500 text-white" : "bg-white border text-gray-500"}`}
          >
            관심 상품
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">불러오는 중...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTrades.map((trade) => (
              <Link key={trade.id} to={`/trades/${trade.id}`}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                  <div className="relative aspect-square">
                    <img
                      src={trade.image_url || "/api/placeholder/400/400"}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white ${trade.status === "active" ? "bg-green-500" : "bg-gray-400"}`}
                    >
                      {trade.status === "active" ? "판매중" : "거래완료"}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm mb-1 truncate">
                      {trade.item_name}
                    </h3>
                    <p className="text-orange-500 font-bold mb-2">
                      {trade.price.toLocaleString()}원
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>{trade.location || "위치 정보 없음"}</span>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5">
                          <Heart className="w-3 h-3" />{" "}
                          {trade.likes_count?.[0]?.count || 0}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MessageCircle className="w-3 h-3" />{" "}
                          {trade.comments_count?.[0]?.count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate("/trades/new")}
        className="fixed bottom-24 right-6 bg-orange-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors z-40"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}
