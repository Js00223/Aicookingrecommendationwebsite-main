import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, MapPin, Clock, Heart, Share2, User, MessageCircle } from "lucide-react";

export default function TradeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('likedTrades');
    if (saved) {
      const likedItems = JSON.parse(saved);
      setLiked(likedItems.includes(Number(id)));
    }
  }, [id]);

  const handleLike = () => {
    const saved = localStorage.getItem('likedTrades');
    let likedItems = saved ? JSON.parse(saved) : [];
    
    if (liked) {
      likedItems = likedItems.filter((item: number) => item !== Number(id));
    } else {
      likedItems.push(Number(id));
    }
    
    localStorage.setItem('likedTrades', JSON.stringify(likedItems));
    setLiked(!liked);
  };

  const trade = {
    id: Number(id),
    title: "대파 나눔합니다",
    price: "무료나눔",
    description: `대파를 너무 많이 사서 나눔합니다!
    
신선한 대파이고, 직거래로만 진행합니다.
강남역 근처에서 받으실 수 있는 분 연락주세요.

- 수량: 약 10대
- 상태: 신선함
- 거래방법: 직거래
- 거래장소: 강남역 3번 출구`,
    location: "강남구",
    seller: "자취생123",
    time: "10분 전",
    views: 42,
    likes: 8,
    status: "거래중",
    images: [
      "https://images.unsplash.com/photo-1629798484280-e62d4dff3c42?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1592061172326-6a8a03ebe630?w=600&h=400&fit=crop",
    ]
  };

  const handleChat = () => {
    alert('채팅 기능은 로그인이 필요합니다.');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold">거래 상세</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Share2 className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLike}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto bg-white">
        {/* Images */}
        <div className="w-full h-80 bg-gray-200 relative">
          <img src={trade.images[0]} alt={trade.title} className="w-full h-full object-cover" />
          <div className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-sm font-bold ${
            trade.status === '거래중' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
          }`}>
            {trade.status}
          </div>
        </div>

        {/* Seller Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800">{trade.seller}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {trade.location}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{trade.title}</h1>
          <p className="text-3xl font-bold text-orange-500 mb-4">{trade.price}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {trade.time}
            </span>
            <span>조회 {trade.views}</span>
            <span>관심 {liked ? trade.likes + 1 : trade.likes}</span>
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{trade.description}</p>
          </div>
        </div>

        {/* Similar Items */}
        <div className="border-t-8 border-gray-100 p-4">
          <h3 className="font-bold text-gray-800 mb-4">비슷한 상품</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="w-full aspect-square bg-gray-200">
                <img src="https://images.unsplash.com/photo-1508747703725-719777637510?w=200&h=200&fit=crop" alt="양파" className="w-full h-full object-cover" />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-gray-800 truncate">양파 1kg</p>
                <p className="text-xs text-orange-500 font-bold">1,000원</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="w-full aspect-square bg-gray-200">
                <img src="https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop" alt="달걀" className="w-full h-full object-cover" />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-gray-800 truncate">달걀 10개</p>
                <p className="text-xs text-orange-500 font-bold">3,000원</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="w-full aspect-square bg-gray-200">
                <img src="https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&h=200&fit=crop" alt="당근" className="w-full h-full object-cover" />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-gray-800 truncate">당근 묶음</p>
                <p className="text-xs text-orange-500 font-bold">무료나눔</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-md mx-auto p-4 flex gap-3">
          <button
            onClick={handleLike}
            className={`p-3 rounded-lg border ${
              liked ? 'border-red-500 text-red-500' : 'border-gray-300 text-gray-600'
            }`}
          >
            <Heart className={`w-6 h-6 ${liked ? 'fill-red-500' : ''}`} />
          </button>
          <button
            onClick={handleChat}
            className="flex-1 bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            채팅하기
          </button>
        </div>
      </div>
    </div>
  );
}