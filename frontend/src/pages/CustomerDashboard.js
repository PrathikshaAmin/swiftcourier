import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function CustomerDashboard() {
  const { user, darkMode } = useAuth();
  const navigate = useNavigate();
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courier/my').then(({ data }) => {
      setCouriers(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const bg     = darkMode ? '#0f172a' : '#f1f5f9';
  const card   = darkMode ? '#1e293b' : '#ffffff';
  const border = darkMode ? '#334155' : '#e2e8f0';
  const text   = darkMode ? '#f1f5f9' : '#0f172a';
  const muted  = darkMode ? '#94a3b8' : '#64748b';

  const inTransit = couriers.filter(c =>
    ['Packaging', 'In Transit', 'Reached Depot', 'Out for Delivery'].includes(c.status)
  ).length;

  const stats = [
    { label: 'Total Orders', value: couriers.length,                                          icon: '📦', color: '#4f46e5' },
    { label: 'Delivered',    value: couriers.filter(c => c.status === 'Delivered').length,    icon: '✅', color: '#22c55e' },
    { label: 'In Transit',   value: inTransit,                                                icon: '🚚', color: '#f59e0b' },
    { label: 'Order Placed', value: couriers.filter(c => c.status === 'Order Placed').length, icon: '🆕', color: '#6366f1' },
  ];

  return (
    <div className="sc-page" style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Welcome */}
      <div style={{ marginBottom: 28, animation: 'fadeUp 0.35s ease' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: text }}>Welcome back, {user?.name} 👋</h1>
        <p style={{ color: muted, marginTop: 5, fontSize: 14 }}>Here's your shipment overview</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }} className="sc-grid-4">
        {stats.map(({ label, value, icon, color }, i) => (
          <div key={label} className="sc-stat" style={{ animation: `fadeUp ${0.3 + i * 0.07}s ease` }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 13, color: muted, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, animation: 'fadeUp 0.45s ease' }}>
        <Link to="/book" style={{ textDecoration: 'none' }}>
          <button className="sc-btn" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', boxShadow: '0 2px 8px rgba(79,70,229,0.3)' }}>
            + Book New Courier
          </button>
        </Link>
        <Link to="/my-couriers" style={{ textDecoration: 'none' }}>
          <button className="sc-btn" style={{ background: darkMode ? '#334155' : '#f1f5f9', color: text, border: `1px solid ${border}` }}>
            📋 All My Orders
          </button>
        </Link>
      </div>

      {/* Recent orders */}
      <div className="sc-card" style={{ padding: 24, animation: 'fadeUp 0.5s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: text }}>Recent Orders</h2>
          <Link to="/my-couriers" style={{ fontSize: 13, color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
        </div>

        {loading ? <Spinner /> : couriers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: muted }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 15 }}>No orders yet</p>
            <Link to="/book">
              <button className="sc-btn" style={{ marginTop: 16, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff' }}>
                Book your first courier
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {couriers.slice(0, 5).map(c => (
              <div key={c._id} style={{
                padding: '14px 16px', borderRadius: 12,
                background: darkMode ? '#0f172a' : '#f8fafc',
                border: `1px solid ${border}`,
                transition: 'background 0.15s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <p onClick={() => navigate(`/track/${c.trackingId}`)}
                      style={{ fontWeight: 700, color: '#4f46e5', fontSize: 14, letterSpacing: '0.3px', cursor: 'pointer', display: 'inline-block' }}>
                      {c.trackingId}
                    </p>
                    <p style={{ color: muted, fontSize: 12, marginTop: 3 }}>
                      To: {c.receiverName} · {c.packageType} · {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                    <p style={{ fontSize: 12, marginTop: 2 }}>
                      <span style={{ color: muted }}>📅 Expected: </span>
                      <span style={{ fontWeight: 600, color: c.status === 'Delivered' ? '#16a34a' : '#f59e0b' }}>
                        {c.status === 'Delivered' ? 'Delivered ✅'
                          : new Date(new Date(c.createdAt).getTime() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </p>
                    <span style={{
                      display: 'inline-block', marginTop: 6, fontSize: 11, fontWeight: 700,
                      padding: '2px 8px', borderRadius: 20,
                      background: c.paymentStatus === 'Paid' ? (darkMode ? '#052e16' : '#f0fdf4') : (darkMode ? '#1c1400' : '#fffbeb'),
                      color: c.paymentStatus === 'Paid' ? '#16a34a' : '#d97706',
                    }}>
                      {c.paymentStatus === 'Paid' ? '✅ Paid' : '💵 COD - Pending'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <StatusBadge status={c.status} />
                    <button className="sc-btn" onClick={() => navigate(`/track/${c.trackingId}`)}
                      style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', padding: '6px 14px', fontSize: 12 }}>
                      🔍 Track
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
