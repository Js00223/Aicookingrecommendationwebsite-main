import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, User, Mail, Shield, LogOut } from "lucide-react";
import { supabase } from "../utils/supabaseClient";

export default function Account() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        setNickname(user.user_metadata?.full_name || "");
      }
    };
    getUserData();
  }, []);

  const handleUpdate = async () => {
    if (!nickname.trim()) return alert("닉네임을 입력해주세요.");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: nickname },
    });

    if (error) {
      alert("오류 발생: " + error.message);
    } else {
      alert("성공적으로 변경되었습니다!");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      await supabase.auth.signOut();
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4 flex items-center gap-4 sticky top-0 z-40">
        <button
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">계정 설정</h1>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* 프로필 섹션 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4 border border-gray-100">
          <div className="flex items-center gap-2 text-orange-500 font-bold border-b border-gray-50 pb-3">
            <User className="w-5 h-5" />
            <span>프로필 정보 수정</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                이메일 계정
              </label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl mt-1 text-gray-500">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{email}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                새 닉네임
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="변경할 닉네임을 입력하세요"
                className="w-full p-3 bg-white border border-gray-200 rounded-xl mt-1 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:bg-gray-300 shadow-lg shadow-orange-100 mt-2"
          >
            {loading ? "저장 중..." : "설정 저장"}
          </button>
        </div>

        {/* 보안 및 기타 섹션 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-700 font-bold border-b border-gray-50 pb-3 mb-2">
            <Shield className="w-5 h-5 text-gray-400" />
            <span>보안 및 서비스</span>
          </div>
          <button className="w-full text-left py-3 text-sm text-gray-600 hover:text-orange-500 transition-colors border-b border-gray-50">
            비밀번호 변경하기
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left py-3 text-sm text-gray-600 hover:text-orange-500 transition-colors border-b border-gray-50 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> 로그아웃
          </button>
          <button className="w-full text-left py-3 text-sm text-red-400 font-medium mt-2">
            회원 탈퇴
          </button>
        </div>
      </div>
    </div>
  );
}
