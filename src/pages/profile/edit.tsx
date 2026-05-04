import React, { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Camera, ChevronLeft, Save } from "lucide-react";

const Edit = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 상태 관리: 기본값은 나중에 DB 데이터로 연결하세요!
  const [profileImg, setProfileImg] = useState<string>(
    "https://placehold.co/150",
  );
  const [nickname, setNickname] = useState<string>("자취요리왕");

  // 📷 이미지 클릭 시 파일 선택창 열기
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // 🖼️ 이미지 선택 시 미리보기 처리
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 💾 저장 로직 (백엔드 API 연결 시점)
  const handleSave = () => {
    console.log("저장될 데이터:", { nickname, profileImg });
    alert("프로필이 업데이트되었습니다!");
    navigate("/mypage");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white min-h-screen">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">프로필 수정</h1>
        <div className="w-10" /> {/* 밸런스를 위한 빈 공간 */}
      </div>

      <div className="flex flex-col items-center space-y-8">
        {/* 📷 프로필 이미지 섹션 */}
        <div
          className="relative group cursor-pointer"
          onClick={handleImageClick}
        >
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-100 shadow-sm">
            <img
              src={profileImg}
              alt="Profile"
              className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
            />
          </div>
          <div className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full border-2 border-white shadow-md">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
          />
        </div>

        {/* 📝 입력 폼 섹션 */}
        <div className="w-full space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              placeholder="닉네임을 입력해 주세요"
            />
          </div>

          <p className="text-xs text-gray-400 px-1">
            * 프로필 사진은 5MB 이하의 이미지 파일만 업로드 가능합니다.
          </p>
        </div>

        {/* 🚀 저장 버튼 */}
        <button
          onClick={handleSave}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 flex items-center justify-center space-y-2 transition-all active:scale-95"
        >
          <Save className="w-5 h-5 mr-2" />
          저장하기
        </button>
      </div>
    </div>
  );
};

export default Edit;
