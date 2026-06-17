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
      <nav className="sticky top-0 z-50 glass" style={{ borderBottom: '1px solid #21213A' }}>
        <div
          style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', height: '3.5rem' }}
          className="flex items-center justify-between"
        >
          {/* Logo */}
          <Link
            to="/"
            onClick={close}
            className="flex items-center gap-2.5 flex-shrink-0"
            style={{ textDecoration: 'none' }}
          >
            <div style={{ width: '1.75rem', height: '1.75rem', background: '#F7931A', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={14} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Crypt<span style={{ color: '#F7931A' }}>on</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center" style={{ gap: '0.125rem' }}>
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
          <div className="hidden md:flex items-center" style={{ gap: '0.25rem' }}>
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className={`nav-link${isActive(pathname, '/profile') ? ' is-active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '10rem' }}
                >
                  <User size={14} style={{ flexShrink: 0 }} />
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
            className="md:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#5A5A7A', transition: 'color 0.15s ease' }}
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
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={close}
          />
          <div
            className="fixed top-14 left-0 right-0 z-40 md:hidden animate-slide-down"
            style={{ background: '#08080F', borderBottom: '1px solid #21213A', padding: '0.75rem 1rem 1.25rem' }}
          >
            {NAV_LINKS.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={close}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  padding: '0.875rem 0.75rem', borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: isActive(pathname, path) ? 600 : 400,
                  color: isActive(pathname, path) ? '#FFFFFF' : '#5A5A7A',
                  textDecoration: 'none', transition: 'background-color 0.12s ease',
                }}
              >
                <Icon size={17} />
                {label}
              </Link>
            ))}

            <div style={{ borderTop: '1px solid #21213A', margin: '0.625rem 0' }} />

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={close}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 0.75rem', borderRadius: '8px', fontSize: '0.9375rem', color: '#5A5A7A', textDecoration: 'none' }}
                >
                  <User size={17} />
                  {session?.username ?? 'Profile'}
                </Link>
                <button
                  onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 0.75rem', borderRadius: '8px', fontSize: '0.9375rem', color: '#FF3355', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                >
                  <LogOut size={17} />
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={close}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 500, color: '#F7931A', textDecoration: 'none', border: '1px solid rgba(247,147,26,0.35)', marginTop: '0.5rem' }}
              >
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
