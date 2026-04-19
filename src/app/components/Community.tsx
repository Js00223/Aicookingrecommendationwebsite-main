import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Search, Plus, Heart, MessageCircle, Eye } from "lucide-react";

export default function Community() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const posts = [
    {
      id: 1,
      title: "김치볶음밥 황금레시피",
      author: "자취고수123",
      content: "김치볶음밥 맛있게 만드는 법! 참기름이 포인트입니다.",
      likes: 245,
      comments: 32,
      views: 1203,
      image: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400&h=300&fit=crop",
      time: "2시간 전"
    },
    {
      id: 2,
      title: "간장계란밥 5분 완성",
      author: "요리초보",
      content: "진짜 간단한 자취 요리! 계란만 있으면 됩니다.",
      likes: 189,
      comments: 24,
      views: 892,
      image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop",
      time: "5시간 전"
    },
    {
      id: 3,
      title: "참치마요덮밥 꿀조합",
      author: "혼밥러버",
      content: "참치캔 하나로 맛있는 덮밥 만들기",
      likes: 321,
      comments: 45,
      views: 1567,
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
      time: "1일 전"
    },
    {
      id: 4,
      title: "라면 계란말이 레시피",
      author: "라면매니아",
      content: "남은 라면으로 계란말이 만드는 꿀팁",
      likes: 412,
      comments: 67,
      views: 2103,
      image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop",
      time: "2일 전"
    }
  ];

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => navigate(-1)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold">커뮤니티</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="레시피 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPosts.map((post) => (
            <Link key={post.id} to={`/community/${post.id}`}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow h-full">
                {post.image && (
                  <div className="w-full h-48 bg-gray-200">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 text-lg mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium">{post.author}</span>
                    <span>{post.time}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.views}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => alert('글쓰기 기능은 로그인이 필요합니다.')}
        className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 bg-orange-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors z-40"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}