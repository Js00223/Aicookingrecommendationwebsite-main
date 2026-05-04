import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import {
  User,
  Heart,
  MessageSquare,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { supabase } from "../../utils/supabaseClient";

export default function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 실제 DB에서 가져올 통계 데이터 상태
  const [stats, setStats] = useState({
    recipes: 0,
    trades: 0,
    likes: 0,
  });

  useEffect(() => {
    let isMounted = true; // 메모리 누수 및 중복 실행 방지

    const getProfileAndStats = async () => {
      try {
        setLoading(true);

        // 1. getUser 대신 getSession을 먼저 호출하여 Lock 경쟁을 최소화합니다.
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session?.user) {
          if (isMounted) setUser(session.user);

          // 2. 실제 통계 데이터 가져오기
          // Promise.all을 사용하여 병렬 처리하되, 세션 유저 ID를 활용합니다.
          const [recipesRes, tradesRes, likesRes] = await Promise.all([
            supabase
              .from("trades")
              .select("*", { count: "exact", head: true })
              .eq("user_id", session.user.id)
              .eq("type", "community"),
            supabase
              .from("trades")
              .select("*", { count: "exact", head: true })
              .eq("user_id", session.user.id)
              .eq("type", "trade"),
            supabase
              .from("saved_recipes")
              .select("*", { count: "exact", head: true })
              .eq("user_id", session.user.id),
          ]);

          if (isMounted) {
            setStats({
              recipes: recipesRes.count || 0,
              trades: tradesRes.count || 0,
              likes: likesRes.count || 0,
            });
          }
        }
      } catch (error: any) {
        // Lock 관련 에러는 서비스에 지장이 없으므로 경고만 띄웁니다.
        if (error.message?.includes("lock")) {
          console.warn("Supabase Auth Lock 경합이 감지되었습니다.");
        } else {
          console.error("데이터 로드 중 오류 발생:", error);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getProfileAndStats();

    return () => {
      isMounted = false; // 언마운트 시 플래그 변경
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("로그아웃 중 오류가 발생했습니다.");
    } else {
      alert("로그아웃 되었습니다.");
      navigate("/login");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">로딩 중...</p>
        </div>
      </div>
    );

  // 비로그인 뷰
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-md mx-auto px-4 py-3">
            <h1 className="text-lg font-bold">마이페이지</h1>
          </div>
        </header>
        <div className="max-w-md mx-auto p-4">
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              로그인이 필요합니다
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              로그인하고 Foodket의 다양한 기능을 이용해보세요
            </p>
            <div className="space-y-3">
              <Link to="/login" className="block">
                <button className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-orange-600 transition-colors">
                  로그인
                </button>
              </Link>
              <Link to="/signup" className="block">
                <button className="w-full bg-gray-100 text-gray-800 font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors">
                  회원가입
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold">마이페이지</h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Profile Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-9 h-9 text-orange-500" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">
                {user.user_metadata?.full_name || "사용자"}님
              </h2>
              <p className="text-sm text-gray-600 mt-1">{user.email}</p>
            </div>
            <button
              onClick={() => navigate("/profile/edit")}
              className="text-sm text-orange-500 font-medium"
            >
              프로필 수정
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard count={stats.recipes} label="작성한 레시피" />
          <StatCard count={stats.trades} label="거래 건수" />
          <StatCard count={stats.likes} label="관심 목록" />
        </div>

        {/* Menu List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <MenuItem
            icon={<Heart className="w-5 h-5" />}
            label="관심 목록"
            onClick={() => navigate("/likes")}
          />
          <MenuItem
            icon={<MessageSquare className="w-5 h-5" />}
            label="내가 쓴 글"
            onClick={() => navigate("/my-posts")}
          />
          <MenuItem
            icon={<ShoppingBag className="w-5 h-5" />}
            label="판매 내역"
            onClick={() => navigate("/sales")}
          />
          <MenuItem
            icon={<User className="w-5 h-5" />}
            label="계정 설정"
            onClick={() => navigate("/settings")}
          />
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-2xl p-4 flex items-center justify-center gap-2 text-red-500 font-medium hover:bg-red-50 transition-colors shadow-sm"
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </button>
      </div>
    </div>
  );
}

function StatCard({ count, label }: { count: number; label: string }) {
  return (
    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
      <p className="text-2xl font-bold text-orange-500">{count}</p>
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-center gap-3">
        <div className="text-gray-600">{icon}</div>
        <span className="font-medium text-gray-800">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );
}
