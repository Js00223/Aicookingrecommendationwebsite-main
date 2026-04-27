import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, User, Search, MessageCircle, Bot, Tag } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";

type ChatType = "ai" | "trade";

interface Chat {
  id: string;
  type: ChatType;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  avatar?: string;
  tradeTitle?: string; // 🚀 제목을 담을 필드 추가
}

export default function ChatList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "trade" | "ai">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedRecipesCount, setSavedRecipesCount] = useState(0);
  const [dbChats, setDbChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedRecipes = JSON.parse(
      localStorage.getItem("savedRecipes") || "[]",
    );
    setSavedRecipesCount(savedRecipes.length);
    fetchRealChatRooms();
  }, []);

  const fetchRealChatRooms = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 🚀 trade_id를 통해 trades 테이블의 정보를 가져옵니다.
      // 만약 여전히 에러가 난다면 Supabase에서 trades 테이블의 컬럼명을 꼭 확인해주세요!
      const { data, error } = await supabase
        .from("chat_rooms")
        .select(
          `
          id,
          created_at,
          buyer_id,
          seller_id,
          seller:seller_id(full_name, avatar_url),
          buyer:buyer_id(full_name, avatar_url),
          trade:trade_id(*) 
        `,
        )
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedChats: Chat[] = data.map((room: any) => {
        const isBuyer = room.buyer_id === user.id;
        const opponent = isBuyer ? room.seller : room.buyer;

        // 🚀 제목 컬럼명이 다를 경우를 대비한 방어 로직
        const title =
          room.trade?.title ||
          room.trade?.name ||
          room.trade?.subject ||
          "제목 없음";

        return {
          id: room.id,
          type: "trade",
          name: opponent?.full_name || "알 수 없는 사용자",
          lastMessage: "채팅을 시작해보세요.",
          tradeTitle: title, // 🚀 가져온 제목 저장
          time: new Date(room.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          avatar: opponent?.avatar_url,
        };
      });

      setDbChats(formattedChats);
    } catch (err) {
      console.error("목록 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = dbChats.filter((chat) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "trade" && chat.type === "trade") ||
      (activeTab === "ai" && chat.type === "ai");
    const matchesSearch =
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.tradeTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold">채팅</h1>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="채팅방 또는 제목 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "trade", "ai"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab === "all" ? "전체" : tab === "trade" ? "거래" : "AI 추천"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto">
        {(activeTab === "all" || activeTab === "ai") && (
          <button
            onClick={() => navigate("/saved-recipes")}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-sm">저장된 AI 레시피</h3>
                <p className="text-xs opacity-90">나만의 요리 보관함</p>
              </div>
            </div>
            {savedRecipesCount > 0 && (
              <span className="bg-white text-orange-500 text-xs font-bold px-2 py-1 rounded-full">
                {savedRecipesCount}
              </span>
            )}
          </button>
        )}

        {loading ? (
          <div className="p-20 text-center text-gray-400 text-sm">
            목록을 불러오는 중...
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <MessageCircle className="w-12 h-12 text-gray-200 mb-2" />
            <p className="text-gray-400 text-sm">채팅 내역이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 bg-white">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                className="w-full hover:bg-gray-50 p-4 flex items-start gap-3 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                  {chat.avatar ? (
                    <img
                      src={chat.avatar}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400 mt-2 mx-auto" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-bold text-gray-900 text-sm">
                      {chat.name}
                    </h3>
                    <span className="text-[10px] text-gray-400">
                      {chat.time}
                    </span>
                  </div>
                  {/* 🚀 제목 표시 부분 */}
                  <div className="flex items-center gap-1 mb-1">
                    <Tag size={12} className="text-orange-400" />
                    <p className="text-xs font-semibold text-orange-500 truncate">
                      {chat.tradeTitle}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {chat.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
