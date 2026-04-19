import { Outlet, useLocation, Link } from "react-router";
import { Home, MessageCircle, ShoppingBag, User, ChefHat } from "lucide-react";

export default function Root() {
  const location = useLocation();
  const hideNav = ['/login', '/signup'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      {!hideNav && (
        <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 lg:bg-white lg:border-r lg:border-gray-200 lg:flex lg:flex-col lg:z-50">
          <div className="p-6 border-b border-gray-200">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">자취요리</h1>
                <p className="text-xs text-gray-500">AI 맞춤 레시피</p>
              </div>
            </Link>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <SidebarNavItem to="/" icon={<Home />} label="홈" active={location.pathname === '/'} />
            <SidebarNavItem to="/chats" icon={<MessageCircle />} label="채팅" active={location.pathname.startsWith('/chats') || location.pathname.startsWith('/saved-recipes')} />
            <SidebarNavItem to="/trade" icon={<ShoppingBag />} label="거래" active={location.pathname.startsWith('/trade')} />
            <SidebarNavItem to="/mypage" icon={<User />} label="마이페이지" active={location.pathname === '/mypage'} />
          </nav>

          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">© 2026 자취요리</p>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className={`${!hideNav ? 'lg:ml-64' : ''} pb-16 lg:pb-0`}>
        <Outlet />
      </div>
      
      {/* Mobile Bottom Navigation */}
      {!hideNav && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex justify-around items-center h-16">
            <MobileNavItem to="/" icon={<Home />} label="홈" active={location.pathname === '/'} />
            <MobileNavItem to="/chats" icon={<MessageCircle />} label="채팅" active={location.pathname.startsWith('/chats') || location.pathname.startsWith('/saved-recipes')} />
            <MobileNavItem to="/trade" icon={<ShoppingBag />} label="거래" active={location.pathname.startsWith('/trade')} />
            <MobileNavItem to="/mypage" icon={<User />} label="마이페이지" active={location.pathname === '/mypage'} />
          </div>
        </nav>
      )}
    </div>
  );
}

function SidebarNavItem({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        active 
          ? 'bg-orange-50 text-orange-500 font-semibold' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <div className="w-6 h-6">{icon}</div>
      <span className="text-sm">{label}</span>
    </Link>
  );
}

function MobileNavItem({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center min-w-16 py-2 ${
        active ? 'text-orange-500' : 'text-gray-500'
      }`}
    >
      <div className="w-6 h-6 mb-1">{icon}</div>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}