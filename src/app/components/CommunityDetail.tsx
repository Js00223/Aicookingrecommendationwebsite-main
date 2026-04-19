import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Heart, MessageCircle, Share2, User } from "lucide-react";

export default function CommunityDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');

  const post = {
    id: Number(id),
    title: "김치볶음밥 황금레시피",
    author: "자취고수123",
    content: `안녕하세요! 오늘은 정말 맛있는 김치볶음밥 레시피를 공유합니다.

재료:
- 밥 1공기
- 김치 100g
- 대파 약간
- 계란 1개
- 참기름 1큰술
- 식용유 약간

조리 방법:
1. 김치를 적당한 크기로 잘라주세요.
2. 팬에 식용유를 두르고 김치를 먼저 볶습니다.
3. 김치가 익으면 밥을 넣고 같이 볶아주세요.
4. 대파를 넣고 참기름으로 마무리!
5. 계란 프라이를 올려서 완성!

포인트는 참기름입니다. 참기름을 넣으면 정말 맛있어요! 👍`,
    likes: 245,
    comments: [
      { id: 1, author: "요리왕", content: "오 진짜 맛있어보여요! 당장 해먹어야겠어요", time: "1시간 전" },
      { id: 2, author: "자취생A", content: "참기름이 포인트군요! 감사합니다", time: "2시간 전" },
      { id: 3, author: "혼밥러버", content: "저도 이렇게 해먹는데 진짜 꿀맛이에요", time: "3시간 전" },
    ],
    image: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=600&h=400&fit=crop",
    time: "2시간 전"
  };

  const handleComment = () => {
    if (!comment.trim()) return;
    alert('댓글이 등록되었습니다!');
    setComment('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 lg:pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold">레시피 상세</h1>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-md mx-auto bg-white">
        {/* Post Image */}
        {post.image && (
          <div className="w-full h-64 bg-gray-200">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Post Content */}
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{post.title}</h1>
          
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{post.author}</p>
              <p className="text-xs text-gray-500">{post.time}</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{post.content}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-2 ${liked ? 'text-red-500' : 'text-gray-500'}`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
              <span className="font-medium">{liked ? post.likes + 1 : post.likes}</span>
            </button>
            <div className="flex items-center gap-2 text-gray-500">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{post.comments.length}</span>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="border-t-8 border-gray-100 p-4">
          <h3 className="font-bold text-gray-800 mb-4">댓글 {post.comments.length}</h3>
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-800">{comment.author}</span>
                    <span className="text-xs text-gray-500">{comment.time}</span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comment Input */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-7xl mx-auto p-4 flex gap-2 lg:ml-64">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleComment()}
            placeholder="댓글을 입력하세요..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={handleComment}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}