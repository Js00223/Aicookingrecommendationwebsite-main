import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "../../utils/supabaseClient";
import { ArrowLeft, Send, User, Clock } from "lucide-react"; // 👈 여기를 lucide-react로 수정했습니다!

export default function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPostAndComments();
  }, [id]);

  const fetchPostAndComments = async () => {
    setLoading(true);
    try {
      const { data: postData, error: postError } = await supabase
        .from("trades")
        .select(
          `
          *,
          author:user_id(full_name, avatar_url)
        `,
        )
        .eq("id", id)
        .single();

      if (postError) throw postError;

      const { data: commentData, error: commentError } = await supabase
        .from("comments")
        .select(
          `
          *,
          author:user_id(full_name, avatar_url)
        `,
        )
        .eq("trade_id", id)
        .order("created_at", { ascending: true });

      if (commentError) throw commentError;

      setPost(postData);
      setComments(commentData || []);
    } catch (err) {
      console.error("상세 페이지 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("로그인이 필요합니다.");
        return;
      }

      const { error } = await supabase.from("comments").insert({
        trade_id: id,
        user_id: user.id,
        content: newComment,
      });

      if (error) throw error;

      setNewComment("");
      fetchPostAndComments();
    } catch (err) {
      console.error("댓글 작성 실패:", err);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center text-gray-500 text-sm">로딩 중...</div>
    );
  if (!post)
    return (
      <div className="p-20 text-center text-gray-500 text-sm">
        게시글을 찾을 수 없습니다.
      </div>
    );

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* 상단 헤더 */}
      <header className="p-4 border-b flex items-center gap-3 sticky top-0 bg-white z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <span className="font-bold text-lg text-gray-800">게시글 상세</span>
      </header>

      <div className="max-w-md mx-auto">
        <div className="p-5 border-b">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
              {post.author?.avatar_url ? (
                <img
                  src={post.author.avatar_url}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="text-gray-400" />
              )}
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">
                {post.author?.full_name || "익명"}
              </p>
              <div className="flex items-center gap-1 text-gray-400">
                <Clock size={12} />
                <span className="text-[11px]">
                  {new Date(post.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold mb-4 text-gray-900">
            {post.title || post.item_name}
          </h1>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[150px]">
            {post.content || post.description}
          </div>
        </div>

        <div className="p-5">
          <p className="text-sm font-bold text-gray-800 mb-6">
            댓글 <span className="text-orange-500">{comments.length}</span>
          </p>
          <div className="flex flex-col gap-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                  {comment.author?.avatar_url ? (
                    <img
                      src={comment.author.avatar_url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={16} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1 bg-gray-50 p-3 rounded-2xl">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-bold text-gray-800">
                      {comment.author?.full_name || "익명"}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{comment.content}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-10">
                첫 번째 댓글을 남겨보세요!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 하단 댓글 입력 바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto p-3 flex gap-2 items-center">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 남겨보세요..."
            className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 transition-all"
          />
          <button
            onClick={handleSendComment}
            disabled={!newComment.trim()}
            className="p-2.5 bg-orange-500 text-white rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
