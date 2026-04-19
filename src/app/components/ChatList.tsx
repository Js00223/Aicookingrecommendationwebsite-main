import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, User, Search, MessageCircle, Bot } from "lucide-react";

type ChatType = 'ai' | 'trade';

interface Chat {
  id: number;
  type: ChatType;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  avatar?: string;
}

export default function ChatList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'trade' | 'ai'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedRecipesCount, setSavedRecipesCount] = useState(0);

  useEffect(() => {
    // 저장된 레시피 개수 확인
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    setSavedRecipesCount(savedRecipes.length);
  }, []);

  const chats: Chat[] = [
    {
      id: 2,
      type: 'trade',
      name: '자취생123',
      lastMessage: '강남역에서 받을 수 있어요!',
      time: '30분 전',
      unread: 2,
    },
    {
      id: 3,
      type: 'trade',
      name: '요리왕',
      lastMessage: '네 감사합니다~',
      time: '1시간 전',
    },
    {
      id: 5,
      type: 'trade',
      name: '혼밥러버',
      lastMessage: '아직 거래 가능한가요?',
      time: '3시간 전',
      unread: 1,
    },
  ];

  const filteredChats = chats.filter(chat => {
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'trade' && chat.type === 'trade') ||
      (activeTab === 'ai' && chat.type === 'ai');
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleChatClick = (chat: Chat) => {
    if (chat.type === 'ai') {
      navigate('/ai-chat');
    } else {
      alert('채팅 상세 페이지로 이동합니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
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
              placeholder="채팅 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setActiveTab('trade')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'trade'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              거래
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'ai'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              AI 추천
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto">
        {/* AI 레시피 저장소 배너 */}
        {(activeTab === 'all' || activeTab === 'ai') && (
          <button
            onClick={() => navigate('/saved-recipes')}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex items-center justify-between hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-7 h-7" />
              </div>
              <div className="text-left">
                <h3 className="font-bold">저장된 AI 레시피</h3>
                <p className="text-sm opacity-90">내가 저장한 요리 레시피 보기</p>
              </div>
            </div>
            {savedRecipesCount > 0 && (
              <span className="bg-white text-orange-500 text-sm font-bold px-3 py-1 rounded-full">
                {savedRecipesCount}개
              </span>
            )}
          </button>
        )}

        {filteredChats.length === 0 && (activeTab === 'all' || activeTab === 'trade') ? (
          <div className="flex flex-col items-center justify-center py-20">
            <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500">채팅 내역이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleChatClick(chat)}
                className="w-full bg-white hover:bg-gray-50 p-4 flex items-start gap-3 transition-colors"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  chat.type === 'ai' ? 'bg-orange-100' : 'bg-gray-200'
                }`}>
                  {chat.type === 'ai' ? (
                    <Bot className="w-7 h-7 text-orange-500" />
                  ) : (
                    <User className="w-7 h-7 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-800">{chat.name}</h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate pr-2">{chat.lastMessage}</p>
                    {chat.unread && (
                      <span className="bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}