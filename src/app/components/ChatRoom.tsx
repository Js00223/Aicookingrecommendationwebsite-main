import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Send, User } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";

export default function ChatRoom() {
  const { id } = useParams(); // chat_room_id
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkUser();
    fetchMessages();

    // 🚀 실시간 구독 시작
    const channel = subscribeToMessages();

    // 🧹 컴포넌트가 사라질 때(언마운트) 구독 해제
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [id]);

  useEffect(() => {
    // 메시지가 추가될 때마다 하단으로 스크롤
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
  };

  const fetchMessages = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from("messages")
      .select(
        `
        *,
        user:users!user_id(full_name, avatar_url)
      `,
      )
      .eq("chat_room_id", id)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
    if (error) console.error("메시지 로드 에러:", error.message);
  };

  // 🚀 실시간 메시지 구독 (순서 교정: .on 다음에 .subscribe)
  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`room-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_room_id=eq.${id}`,
        },
        () => {
          // 새 메시지가 오면 목록 갱신
          fetchMessages();
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("실시간 채팅 구독 성공!");
        }
      });

    return channel;
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId || !id) return;

    const { error } = await supabase.from("messages").insert({
      chat_room_id: id,
      user_id: userId,
      content: newMessage,
    });

    if (!error) {
      setNewMessage("");
      // 내 화면 즉시 갱신 (구독보다 빠름)
      fetchMessages();
    } else {
      alert("메시지 전송 실패: " + error.message);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b p-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>
        <h1 className="font-bold">채팅 상세</h1>
      </header>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMine = msg.user_id === userId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex gap-2 max-w-[80%] ${isMine ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {msg.user?.avatar_url ? (
                    <img
                      src={msg.user.avatar_url}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <div>
                  {!isMine && (
                    <p className="text-[10px] text-gray-500 mb-1 ml-1">
                      {msg.user?.full_name || "익명 사용자"}
                    </p>
                  )}
                  <div
                    className={`p-3 rounded-2xl text-sm ${
                      isMine
                        ? "bg-orange-500 text-white rounded-tr-none"
                        : "bg-white text-gray-800 rounded-tl-none border shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-2 bg-orange-500 text-white rounded-full disabled:bg-gray-300 transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
