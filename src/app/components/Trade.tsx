import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Search, MapPin, Plus, Clock, Heart } from "lucide-react";

export default function Trade() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'liked'>('all');
  const [likedItems, setLikedItems] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('likedTrades');
    if (saved) {
      setLikedItems(JSON.parse(saved));
    }
  }, []);

  const trades = [
    {
      id: 1,
      title: "대파 나눔합니다",
      price: "무료나눔",
      location: "강남구",
      image: "https://images.unsplash.com/photo-1629798484280-e62d4dff3c42?w=300&h=300&fit=crop",
      time: "10분 전",
      status: "거래중"
    },
    {
      id: 2,
      title: "양파 1kg",
      price: "1,000원",
      location: "송파구",
      image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=300&h=300&fit=crop",
      time: "30분 전",
      status: "판매중"
    },
    {
      id: 3,
      title: "달걀 10개",
      price: "3,000원",
      location: "마포구",
      image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&h=300&fit=crop",
      time: "1시간 전",
      status: "판매중"
    },
    {
      id: 4,
      title: "감자 2kg",
      price: "2,000원",
      location: "강남구",
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=300&fit=crop",
      time: "2시간 전",
      status: "판매중"
    },
    {
      id: 5,
      title: "당근 묶음",
      price: "무료나눔",
      location: "서초구",
      image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=300&fit=crop",
      time: "3시간 전",
      status: "거래중"
    },
    {
      id: 6,
      title: "토마토 500g",
      price: "2,500원",
      location: "용산구",
      image: "https://images.unsplash.com/photo-1546470427-e26264be0b2e?w=300&h=300&fit=crop",
      time: "5시간 전",
      status: "판매중"
    }
  ];

  const filteredTrades = trades.filter(trade => 
    trade.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trade.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLike = (id: number) => {
    if (likedItems.includes(id)) {
      setLikedItems(likedItems.filter(item => item !== id));
    } else {
      setLikedItems([...likedItems, id]);
    }
    localStorage.setItem('likedTrades', JSON.stringify(likedItems));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => navigate(-1)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
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

      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg ${
                activeTab === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={`px-3 py-1 rounded-lg ${
                activeTab === 'liked' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              관심 상품
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
          {activeTab === 'all' ? filteredTrades.map((trade) => (
            <Link key={trade.id} to={`/trade/${trade.id}`}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow h-full">
                <div className="relative">
                  <div className="w-full aspect-square bg-gray-200">
                    <img src={trade.image} alt={trade.title} className="w-full h-full object-cover" />
                  </div>
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${
                    trade.status === '거래중' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
                  }`}>
                    {trade.status}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-800 text-sm mb-1 truncate">{trade.title}</h3>
                  <p className="text-orange-500 font-bold text-base mb-2">{trade.price}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {trade.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {trade.time}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )) : filteredTrades.filter(trade => likedItems.includes(trade.id)).map((trade) => (
            <Link key={trade.id} to={`/trade/${trade.id}`}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow h-full">
                <div className="relative">
                  <div className="w-full aspect-square bg-gray-200">
                    <img src={trade.image} alt={trade.title} className="w-full h-full object-cover" />
                  </div>
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${
                    trade.status === '거래중' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
                  }`}>
                    {trade.status}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-800 text-sm mb-1 truncate">{trade.title}</h3>
                  <p className="text-orange-500 font-bold text-base mb-2">{trade.price}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {trade.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {trade.time}
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
        onClick={() => alert('상품 등록 기능은 로그인이 필요합니다.')}
        className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 bg-orange-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors z-40"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}