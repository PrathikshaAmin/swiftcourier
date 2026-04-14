import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, darkMode, setDarkMode } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const dark = darkMode;
  const bg   = dark ? '#1e293b' : '#ffffff';
  const bdr  = dark ? '#334155' : '#e2e8f0';
  const txt  = dark ? '#f1f5f9' : '#0f172a';
  const muted = dark ? '#94a3b8' : '#64748b';

  const navLink = (to, label) => {
    const active = pathname === to;
    return (
      <Link to={to} style={{
        color: active ? '#4f46e5' : muted,
        textDecoration: 'none', fontSize: '14px',
        fontWeight: active ? '700' : '500',
        padding: '6px 12px', borderRadius: '8px',
        background: active ? (dark ? '#1e1b4b' : '#eef2ff') : 'transparent',
        transition: 'all 0.15s',
      }}>{label}</Link>
    );
  };

  return (
    <nav style={{
      background: bg, borderBottom: `1px solid ${bdr}`,
      padding: '0 28px', height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 200,
      boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17, color: '#fff', fontWeight: 800,
        }}>⚡</div>
        <span style={{ fontSize: 18, fontWeight: 800, color: txt, letterSpacing: '-0.3px' }}>
          Swift<span style={{ color: '#4f46e5' }}>Courier</span>
        </span>
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {user?.role === 'customer' && <>
          {navLink('/dashboard', 'Dashboard')}
          {navLink('/book', 'Book Courier')}
          {navLink('/track', '🔍 Track Parcel')}
          {navLink('/my-couriers', 'My Orders')}
        </>}
        {user?.role === 'admin' && <>
          {navLink('/admin', '⚙️ Admin Panel')}
          {navLink('/admin/orders', '📦 Orders')}
        </>}

        {/* Dark toggle */}
        <button onClick={() => setDarkMode(!dark)} style={{
          background: dark ? '#334155' : '#f1f5f9',
          border: 'none', borderRadius: 8, padding: '7px 10px',
          cursor: 'pointer', fontSize: 15, marginLeft: 6,
        }}>{dark ? '☀️' : '🌙'}</button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 13, fontWeight: 800,
            }}>{user.name[0].toUpperCase()}</div>
            <span style={{ fontSize: 13, color: muted, fontWeight: 500 }}>{user.name}</span>
            <button onClick={() => { logout(); navigate('/login'); }} style={{
              background: 'transparent', border: `1.5px solid ${bdr}`,
              color: muted, padding: '6px 14px', borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>Logout</button>
          </div>
        ) : (
          <Link to="/login" style={{ marginLeft: 8 }}>
            <button style={{
              background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
              color: '#fff', border: 'none', padding: '8px 18px',
              borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>Login</button>
          </Link>
        )}
      </div>
    </nav>
  );
}
