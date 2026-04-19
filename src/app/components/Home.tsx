import { Link } from "react-router";
import { Bot, Users, ShoppingCart, Clock, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-orange-500">자취요리 AI</h1>
          <p className="text-sm text-gray-600 mt-1">혼자서도 맛있게, 간편하게</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* AI 추천 배너 */}
        <Link to="/ai-chat">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 lg:p-8 text-white shadow-lg hover:shadow-xl transition-shadow mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold mb-2">AI 요리 추천</h2>
                <p className="text-sm lg:text-base opacity-90">지금 먹고 싶은 음식을 찾아보세요</p>
              </div>
              <Bot className="w-12 h-12 lg:w-16 lg:h-16 opacity-80" />
            </div>
          </div>
        </Link>

        {/* 빠른 메뉴 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          <Link to="/community">
            <div className="bg-white rounded-xl p-5 lg:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <Users className="w-8 h-8 lg:w-10 lg:h-10 text-orange-500 mb-3" />
              <h3 className="font-semibold text-gray-800">커뮤니티</h3>
              <p className="text-xs text-gray-500 mt-1">레시피 공유</p>
            </div>
          </Link>

          <Link to="/trade">
            <div className="bg-white rounded-xl p-5 lg:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <ShoppingCart className="w-8 h-8 lg:w-10 lg:h-10 text-orange-500 mb-3" />
              <h3 className="font-semibold text-gray-800">식재료 거래</h3>
              <p className="text-xs text-gray-500 mt-1">남은 재료 나눔</p>
            </div>
          </Link>

          <Link to="/chats">
            <div className="bg-white rounded-xl p-5 lg:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow lg:block hidden">
              <Users className="w-8 h-8 lg:w-10 lg:h-10 text-orange-500 mb-3" />
              <h3 className="font-semibold text-gray-800">채팅</h3>
              <p className="text-xs text-gray-500 mt-1">거래 문의</p>
            </div>
          </Link>

          <Link to="/saved-recipes">
            <div className="bg-white rounded-xl p-5 lg:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow lg:block hidden">
              <Bot className="w-8 h-8 lg:w-10 lg:h-10 text-orange-500 mb-3" />
              <h3 className="font-semibold text-gray-800">저장 레시피</h3>
              <p className="text-xs text-gray-500 mt-1">내 레시피 모음</p>
            </div>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 인기 레시피 섹션 */}
          <section className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                인기 레시피
              </h3>
              <Link to="/community" className="text-sm text-orange-500 font-medium">
                전체보기
              </Link>
            </div>
            <div className="space-y-3">
              {mockRecipes.map((recipe) => (
                <div key={recipe.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
                    <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 truncate">{recipe.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{recipe.author}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{recipe.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 최근 거래 */}
          <section className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                <ShoppingCart className="w-5 h-5 text-orange-500" />
                최근 거래
              </h3>
              <Link to="/trade" className="text-sm text-orange-500 font-medium">
                전체보기
              </Link>
            </div>
            <div className="grid grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {mockTrades.map((trade) => (
                <div key={trade.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="w-full aspect-square bg-gray-200 rounded-lg mb-2">
                    <img src={trade.image} alt={trade.title} className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{trade.title}</p>
                  <p className="text-xs text-orange-500 font-bold mt-1">{trade.price}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const mockRecipes = [
  { id: 1, title: "김치볶음밥", author: "자취고수123", time: "15분", image: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=200&h=200&fit=crop" },
  { id: 2, title: "간장계란밥", author: "요리초보", time: "5분", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=200&fit=crop" },
  { id: 3, title: "참치마요덮밥", author: "혼밥러버", time: "10분", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=200&fit=crop" },
];

const mockTrades = [
  { id: 1, title: "대파", price: "1,000원", image: "https://images.unsplash.com/photo-1629798484280-e62d4dff3c42?w=200&h=200&fit=crop" },
  { id: 2, title: "양파", price: "무료나눔", image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=200&h=200&fit=crop" },
  { id: 3, title: "달걀", price: "3,000원", image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop" },
];