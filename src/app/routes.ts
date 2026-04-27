import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Home from "./components/Home";
import AIChat from "./components/AIChat";
import Community from "./components/Community";
import Trade from "./components/Trade";
import ChatList from "./components/ChatList";
import MyPage from "./components/MyPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import TradeDetail from "./components/TradeDetail";
import CommunityDetail from "./components/CommunityDetail";
import SavedRecipes from "./components/SavedRecipes";
import SavedRecipeDetail from "./components/SavedRecipeDetail";
import NotFound from "./components/NotFound";

// [추가] pages 폴더에서 가져오는 새 컴포넌트들
import MyRecipes from "../pages/my-posts/MyRecipes";
import MySales from "../pages/sales/MySales";
import Likes from "../pages/likes/likes"; // 방금 만든 관심 목록
import Account from "../pages/account"; // 방금 만든 계정 설정
import ChatRoom from "./components/ChatRoom";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "ai-chat", Component: AIChat },
      { path: "community", Component: Community },
      { path: "community/:id", Component: CommunityDetail },
      { path: "trade", Component: Trade },
      { path: "trades/:id", Component: TradeDetail },
      { path: "chats", Component: ChatList },
      { path: "chat/:id", Component: ChatRoom },

      // 기존 저장된 레시피 경로 (필요 시 유지)
      { path: "saved-recipes", Component: SavedRecipes },
      { path: "saved-recipes/:id", Component: SavedRecipeDetail },

      // 마이페이지 메인
      { path: "mypage", Component: MyPage },

      // [추가] 마이페이지 상세 기능 경로
      { path: "my-posts", Component: MyRecipes }, // 내가 쓴 레시피
      { path: "sales", Component: MySales }, // 판매 내역
      { path: "likes", Component: Likes }, // 관심 목록 (신규)
      { path: "settings", Component: Account }, // 계정 설정 (신규)

      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "*", Component: NotFound },
    ],
  },
]);
