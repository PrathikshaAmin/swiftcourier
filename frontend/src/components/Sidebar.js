import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const customerLinks = [
  { to: '/dashboard',   icon: '▦',  label: 'Dashboard'    },
  { to: '/book',        icon: '＋',  label: 'Book Courier' },
  { to: '/track',       icon: '🔍', label: 'Track Parcel' },
  { to: '/my-couriers', icon: '📋', label: 'My Orders'    },
];

const adminLinks = [
  { to: '/admin',        icon: '▦',  label: 'Overview' },
  { to: '/admin/orders', icon: '📋', label: 'Orders'   },
];

export default function Sidebar() {
  const { user, logout, darkMode, setDarkMode } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const links = user?.role === 'admin' ? adminLinks : customerLinks;

  const dark = darkMode;
  const bdr  = dark ? '#334155' : '#e2e8f0';
  const txt  = dark ? '#f1f5f9' : '#0f172a';
  const muted = dark ? '#94a3b8' : '#64748b';

  return (
    <aside className="sc-sidebar">
      {/* Logo */}
      <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${bdr}` }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, color: '#fff', fontWeight: 800, flexShrink: 0,
          }}>⚡</div>
          <span style={{ fontSize: 17, fontWeight: 800, color: txt, letterSpacing: '-0.3px' }}>
            Swift<span style={{ color: '#4f46e5' }}>Courier</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
        <p style={{ padding: '6px 20px 8px', fontSize: 11, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {user?.role === 'admin' ? 'Admin' : 'Menu'}
        </p>
        {links.map(({ to, icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`sc-nav-item${pathname === to ? ' active' : ''}`}
          >
            <span className="sc-nav-icon">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '10px 12px 14px', borderTop: `1px solid ${bdr}` }}>
        {/* Dark mode */}
        <button
          onClick={() => setDarkMode(!dark)}
          className="sc-nav-item"
          style={{ marginBottom: 4 }}
        >
          <span className="sc-nav-icon">{dark ? '☀️' : '🌙'}</span>
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* User row */}
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12,
            background: dark ? '#0f172a' : '#f8fafc',
            marginTop: 4,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 13, fontWeight: 800, flexShrink: 0,
            }}>{user.name[0].toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: txt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
              <p style={{ fontSize: 11, color: muted, textTransform: 'capitalize' }}>{user.role}</p>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              title="Logout"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: muted, fontSize: 15, padding: 4, flexShrink: 0,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = muted}
            >⏻</button>
          </div>
        )}
      </div>
    </aside>
  );
}
