import { Outlet } from 'react-router-dom';
import { MessageSquare, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const Layout = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="h-full w-full flex bg-tg-dark overflow-hidden">
      {/* Sidebar Navigation */}
      <nav className="w-[68px] flex flex-col items-center justify-between py-4 bg-tg-dark border-r border-[#0e1621] shrink-0">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-tg-badge flex items-center justify-center text-white font-bold text-lg mb-2 shadow-sm uppercase">
            {user?.username?.charAt(0) || 'U'}
          </div>
          <button className="p-2.5 rounded-xl text-tg-badge bg-tg-badge/10 flex items-center justify-center">
            <MessageSquare size={26} strokeWidth={2} />
          </button>
        </div>
        <div className="flex flex-col items-center gap-4">
          <button className="p-2.5 rounded-xl text-tg-muted hover:text-tg-text hover:bg-tg-hover transition-colors flex items-center justify-center">
            <Settings size={26} strokeWidth={2} />
          </button>
          <button
            onClick={logout}
            className="p-2.5 rounded-xl text-tg-muted hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center cursor-pointer"
            title="Log Out"
          >
            <LogOut size={26} strokeWidth={2} />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
