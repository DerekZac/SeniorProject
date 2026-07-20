import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, BookOpen, Scale, Building2, Calculator, Newspaper, Star, User, LogIn, LogOut, Menu, X, Wallet, LineChart, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { path: '/',              label: 'Home',      icon: TrendingUp },
  { path: '/compare',       label: 'Compare',   icon: TrendingUp },
  { path: '/portfolio',     label: 'Portfolio', icon: Wallet },
  { path: '/paper-trading', label: 'Trade',     icon: LineChart },
  { path: '/alerts',        label: 'Alerts',    icon: Bell },
  { path: '/tools',         label: 'Tools',     icon: Calculator },
  { path: '/news',          label: 'News',      icon: Newspaper },
  { path: '/learn',         label: 'Learn',     icon: BookOpen },
  { path: '/exchanges',     label: 'Exchanges', icon: Building2 },
  { path: '/regulations',   label: 'Regs',      icon: Scale },
  { path: '/watchlist',     label: 'Watchlist', icon: Star },
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
      <nav className="sticky top-0 z-50 glass nav-border">
        <div className="nav-container flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            onClick={close}
            className="flex items-center gap-2.5 flex-shrink-0"
          >
            <div className="logo-mark">
              <TrendingUp size={14} color="#fff" />
            </div>
            <span className="logo-text">
              Crypt<span className="logo-accent">on</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-xs">
            {NAV_LINKS.map(({ path, label }) => (
                <Link
                key={path}
                to={path}
                className={`nav-link${isActive(pathname, path) ? ' is-active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-sm">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className={`nav-link profile-link${isActive(pathname, '/profile') ? ' is-active' : ''}`}
                >
                  <User size={14} className="flex-no-shrink" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session?.username}</span>
                </Link>
                <button className="logout-btn" onClick={handleLogout} title="Sign out">
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <Link to="/login" className="signin-link">
                <LogIn size={14} />
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(v => !v)}
            className="md:hidden hamburger-btn"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 md:hidden mobile-overlay"
            onClick={close}
          />
          <div
            className="fixed top-14 left-0 right-0 z-40 md:hidden animate-slide-down mobile-drawer"
          >
            {NAV_LINKS.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={close}
                className={`mobile-link${isActive(pathname, path) ? ' is-active' : ''}`}
              >
                <Icon size={17} />
                {label}
              </Link>
            ))}

            <div className="divider" />

            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={close} className="auth-action">
                  <User size={17} />
                  {session?.username ?? 'Profile'}
                </Link>
                <button onClick={handleLogout} className="auth-action auth-action-danger">
                  <LogOut size={17} />
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={close} className="signin-link-inline">
                <LogIn size={17} />
                Sign in
              </Link>
            )}
          </div>
        </>
      )}
    </>
  );
}
