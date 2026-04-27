import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { supabase } from "../../utils/supabaseClient";
import { MessageCircle, Heart, User, Plus } from "lucide-react";

export default function CommunityList() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // 복잡한 count 쿼리 대신, 기본 정보와 작성자 정보만 먼저 가져옵니다.
      const { data, error } = await supabase
        .from("trades")
        .select(
          `
          *,
          author:users!user_id(full_name, avatar_url)
        `,
        )
        .eq("type", "community")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error("커뮤니티 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center text-gray-500">
        데이터를 불러오는 중...
      </div>
    );

  return (
    <div className="pb-24 bg-gray-50 min-h-screen relative">
      <header className="p-4 bg-white border-b sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">커뮤니티</h1>
      </header>

      <div className="flex flex-col gap-3 p-3 max-w-md mx-auto">
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => navigate(`/community/${post.id}`)}
            className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
          >
            {/* 작성자 정보 */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                {post.author?.avatar_url ? (
                  <img
                    src={post.author.avatar_url}
                    className="w-full h-full object-cover"
                    alt="avatar"
                  />
                ) : (
                  <User size={14} className="text-gray-400" />
                )}
              </div>
              <span className="text-xs font-semibold text-gray-700">
                {post.author?.full_name || "익명"}
              </span>
              <span className="text-[10px] text-gray-400 ml-auto">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* 게시글 내용 */}
            <h2 className="font-bold text-gray-900 mb-1">
              {post.title || post.item_name}
            </h2>
            <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
              {post.content || post.description}
            </p>

            {/* 하단 아이콘 */}
            <div className="flex gap-4 text-gray-400">
              <div className="flex items-center gap-1">
                <Heart size={16} />
                <span className="text-xs">0</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle size={16} />
                <span className="text-xs">0</span>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            등록된 게시글이 없습니다.
          </div>
        )}
      </div>

      {/* ✅ 글쓰기 플로팅 버튼 추가 */}
      <Link
        to="/trades/new?type=community"
        className="fixed bottom-24 right-6 bg-orange-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors z-50 shadow-orange-200"
      >
        <Plus size={28} />
      </Link>
    </div>
  );
}
