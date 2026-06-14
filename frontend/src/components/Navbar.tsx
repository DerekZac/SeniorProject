import { Link, useLocation, useNavigate } from "react-router-dom";
import { TrendingUp, Star, BarChart2, Newspaper, User, LogIn, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { path: "/",         label: "Home",     icon: TrendingUp },
  { path: "/watchlist", label: "Watchlist", icon: Star },
  { path: "/compare",  label: "Compare",  icon: BarChart2 },
  { path: "/news",     label: "News",     icon: Newspaper },
];

function isActive(pathname: string, path: string): boolean {
  if (path === "/") return pathname === "/";
  return pathname.startsWith(path);
}

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const { isAuthenticated, session, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b bg-[#0D0F14] border-[#1A1D27]">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 bg-[#4B6BFB] rounded-lg flex items-center justify-center">
          <TrendingUp size={16} className="text-white" />
        </div>
        <span className="font-bold text-xl text-white tracking-tight">Crypton</span>
      </Link>

      {/* Center links */}
      <div className="flex items-center gap-1">
        {NAV_LINKS.map(({ path, label, icon: Icon }) => {
          const active = isActive(pathname, path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[#1A1D27] text-white"
                  : "text-[#8A8FA8] hover:text-white hover:bg-[#1A1D27]/60"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </div>

      {/* Auth area */}
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <Link
              to="/profile"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(pathname, "/profile")
                  ? "bg-[#1A1D27] text-white"
                  : "text-[#8A8FA8] hover:text-white hover:bg-[#1A1D27]/60"
              }`}
            >
              <User size={15} />
              <span className="max-w-[80px] truncate">{session?.username ?? 'Profile'}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#8A8FA8] hover:text-[#FF4D4D] hover:bg-[#1A1D27]/60 transition-colors"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#8A8FA8] hover:text-white hover:bg-[#1A1D27]/60 transition-colors"
          >
            <LogIn size={15} />
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
