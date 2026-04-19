import { useNavigate } from "react-router";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export default function MySales() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4 flex items-center gap-4 sticky top-0">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>
        <h1 className="text-lg font-bold">판매 내역</h1>
      </header>

      <div className="max-w-md mx-auto p-4">
        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 mb-6">
          <p className="text-orange-800 text-sm">지금까지 나눈 따뜻한 마음</p>
          <p className="text-2xl font-black text-orange-500">0 건</p>
        </div>

        <div className="text-center py-10">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">거래 내역이 비어있습니다.</p>
        </div>
      </div>
    </div>
  );
}
