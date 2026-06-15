import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, Star, BarChart2, Newspaper, User, LogIn, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { path: '/',          label: 'Home',      icon: TrendingUp },
  { path: '/watchlist', label: 'Watchlist', icon: Star },
  { path: '/compare',   label: 'Compare',   icon: BarChart2 },
  { path: '/news',      label: 'News',      icon: Newspaper },
];

function isActive(pathname: string, path: string) {
  return path === '/' ? pathname === '/' : pathname.startsWith(path);
}

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const { isAuthenticated, session, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); setOpen(false); };
  const close = () => setOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 glass border-b border-[#21213A]">
        <div className="px-4 md:px-6 h-14 flex items-center justify-between max-w-7xl mx-auto">

          {/* Logo */}
          <Link to="/" onClick={close} className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-8 h-8 bg-[#F7931A] rounded-lg flex items-center justify-center shadow-glow-orange transition-transform group-hover:scale-105">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              Crypt<span className="text-[#F7931A]">on</span>
            </span>
          </Link>

          {/* Desktop center links */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(pathname, path)
                    ? 'bg-[#F7931A]/12 text-[#F7931A]'
                    : 'text-[#5A5A7A] hover:text-white hover:bg-[#16162A]'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(pathname, '/profile')
                      ? 'bg-[#F7931A]/12 text-[#F7931A]'
                      : 'text-[#5A5A7A] hover:text-white hover:bg-[#16162A]'
                  }`}
                >
                  <User size={15} />
                  <span className="max-w-[100px] truncate">{session?.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-[#5A5A7A] hover:text-[#FF3355] hover:bg-[#16162A] transition-all"
                  title="Sign out"
                >
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all shadow-glow-orange hover:shadow-[0_0_32px_rgba(247,147,26,0.35)] hover:scale-[1.02]"
                style={{ background: '#F7931A' }}
              >
                <LogIn size={15} />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(v => !v)}
            className="md:hidden p-2 rounded-lg text-[#5A5A7A] hover:text-white hover:bg-[#16162A] transition-all"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-sm" onClick={close} />
          <div
            className="fixed top-14 left-0 right-0 z-40 md:hidden p-3 flex flex-col gap-1 animate-slide-down border-b border-[#21213A]"
            style={{ background: '#0F0F1A' }}
          >
            {NAV_LINKS.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={close}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(pathname, path)
                    ? 'bg-[#F7931A]/10 text-[#F7931A]'
                    : 'text-[#5A5A7A] hover:text-white hover:bg-[#16162A]'
                }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            ))}

            <div className="border-t border-[#21213A] my-1" />

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={close}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-[#5A5A7A] hover:text-white hover:bg-[#16162A] transition-all"
                >
                  <User size={17} />
                  {session?.username ?? 'Profile'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-[#FF3355] hover:bg-[#16162A] w-full text-left transition-all"
                >
                  <LogOut size={17} />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={close}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: '#F7931A' }}
              >
                <LogIn size={17} />
                Sign In
              </Link>
            )}
          </div>
        </>
      )}
    </>
  );
}
