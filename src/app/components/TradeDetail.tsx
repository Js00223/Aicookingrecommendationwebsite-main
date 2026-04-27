import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Heart,
  Share2,
  User,
  MessageCircle,
  Send,
} from "lucide-react";
import { supabase } from "../../utils/supabaseClient";

export default function TradeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [trade, setTrade] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchTradeDetail();
    checkUser();
  }, [id]);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
  };

  const fetchTradeDetail = async () => {
    // 1. 게시글 상세 정보 + 판매자 정보
    const { data, error } = await supabase
      .from("trades")
      .select(
        `
        *,
        user:users!user_id(full_name, avatar_url)
      `,
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("게시글 로드 에러:", error.message);
    } else if (data) {
      setTrade(data);
    } else {
      console.log("해당 게시글을 찾을 수 없습니다.");
    }

    // 2. 찜 여부 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: likeData } = await supabase
        .from("saved_recipes")
        .select("*")
        .eq("user_id", user.id)
        .eq("recipe_id", id)
        .maybeSingle();
      setLiked(!!likeData);
    }

    // 3. 댓글 목록 가져오기
    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .select(
        `
        *,
        user:users!user_id(full_name, avatar_url)
      `,
      )
      .eq("trade_id", id)
      .order("created_at", { ascending: true });

    if (commentError) {
      console.error("댓글 로드 에러:", commentError.message);
    } else if (commentData) {
      setComments(commentData);
    }
  };

  const handleLike = async () => {
    if (!userId) return alert("로그인이 필요합니다.");
    if (liked) {
      await supabase
        .from("saved_recipes")
        .delete()
        .eq("user_id", userId)
        .eq("recipe_id", id);
    } else {
      await supabase
        .from("saved_recipes")
        .insert({ user_id: userId, recipe_id: id });
    }
    setLiked(!liked);
  };

  const handleChat = async () => {
    if (!userId) return alert("로그인이 필요합니다.");
    if (!trade) return;
    if (userId === trade.user_id) return alert("내 게시물입니다.");

    // 채팅방 존재 여부 확인
    const { data: existingRoom } = await supabase
      .from("chat_rooms")
      .select("id")
      .eq("trade_id", id)
      .eq("buyer_id", userId)
      .maybeSingle();

    if (existingRoom) {
      navigate(`/chat/${existingRoom.id}`);
    } else {
      // ✅ 수정 포인트: DB의 seller_id 컬럼에 게시글 작성자(trade.user_id)를 넣어줍니다.
      const { data: newRoom, error } = await supabase
        .from("chat_rooms")
        .insert({
          trade_id: id,
          buyer_id: userId,
          seller_id: trade.user_id, // 이 부분이 추가되어야 403 에러가 안 납니다!
        })
        .select()
        .single();

      if (newRoom) {
        navigate(`/chat/${newRoom.id}`);
      }

      if (error) {
        console.error("채팅방 생성 에러:", error.message);
        alert("채팅방을 생성할 수 없습니다. 관리자에게 문의하세요.");
      }
    }
  };

  const submitComment = async () => {
    if (!newComment.trim() || !userId) return;
    const { error } = await supabase.from("comments").insert({
      trade_id: id,
      user_id: userId,
      content: newComment,
    });
    if (!error) {
      setNewComment("");
      fetchTradeDetail();
    } else {
      console.error("댓글 작성 에러:", error.message);
    }
  };

  if (!trade) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
        <p className="text-gray-500 mb-4">
          게시글을 불러올 수 없거나 존재하지 않습니다.
        </p>
        <button
          onClick={() => navigate("/trade")}
          className="text-orange-500 font-bold border border-orange-500 px-4 py-2 rounded-lg"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 px-4 py-3 flex items-center justify-between border-b">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft />
        </button>
        <div className="flex gap-2">
          <button className="p-2">
            <Share2 />
          </button>
          <button onClick={handleLike} className="p-2">
            <Heart className={liked ? "fill-red-500 text-red-500" : ""} />
          </button>
        </div>
      </header>

      {/* Hero Image */}
      <div className="w-full aspect-video bg-gray-100 mt-14">
        <img
          src={trade.image_url}
          className="w-full h-full object-cover"
          alt={trade.item_name}
        />
      </div>

      {/* Info Sections */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 overflow-hidden">
            {trade.user?.avatar_url ? (
              <img
                src={trade.user.avatar_url}
                className="w-full h-full object-cover"
                alt="avatar"
              />
            ) : (
              <User />
            )}
          </div>
          <div>
            <p className="font-bold text-gray-900">
              {trade.user?.full_name || "익명 판매자"}
            </p>
            <p className="text-xs text-gray-500">
              {trade.location || "지역 정보 없음"}
            </p>
          </div>
        </div>

        <h1 className="text-xl font-bold mb-2">{trade.item_name}</h1>
        <p className="text-2xl font-black text-orange-500 mb-4">
          {Number(trade.price).toLocaleString()}원
        </p>
        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap mb-8">
          {trade.description}
        </p>

        {/* 댓글 섹션 */}
        <div className="border-t pt-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            댓글 <span className="text-orange-500">{comments.length}</span>
          </h3>
          <div className="space-y-4 mb-6">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0 overflow-hidden">
                  {c.user?.avatar_url ? (
                    <img
                      src={c.user.avatar_url}
                      className="w-full h-full object-cover"
                      alt="comment-avatar"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <User size={16} />
                    </div>
                  )}
                </div>
                <div className="flex-1 bg-gray-50 p-3 rounded-2xl text-sm">
                  <p className="font-bold mb-1">
                    {c.user?.full_name || "유저"}
                  </p>
                  <p className="text-gray-700">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
            />
            <button
              onClick={submitComment}
              className="p-2 bg-orange-500 text-white rounded-full"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 하단 바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className="flex flex-col items-center">
            <Heart
              className={liked ? "fill-red-500 text-red-500" : "text-gray-400"}
            />
            <span className="text-[10px] mt-1">관심</span>
          </button>
        </div>
        <button
          onClick={handleChat}
          className="flex-1 bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle size={20} /> 채팅하기
        </button>
      </div>
    </div>
  );
}
