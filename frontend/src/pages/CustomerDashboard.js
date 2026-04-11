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
    <div style={{ minHeight: '100vh', background: bg, padding: '40px 24px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Welcome */}
        <div style={{ marginBottom: '32px', animation: 'fadeUp 0.4s ease' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: text }}>
            Welcome back, {user?.name} 👋
          </h1>
          <p style={{ color: muted, marginTop: '6px' }}>Here's your shipment overview</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {stats.map(({ label, value, icon, color }, i) => (
            <div key={label} style={{ background: card, borderRadius: '16px', padding: '22px', border: `1px solid ${border}`, animation: `fadeUp ${0.4 + i * 0.08}s ease` }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{icon}</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color }}>{value}</div>
              <div style={{ fontSize: '13px', color: muted, marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', animation: 'fadeUp 0.6s ease' }}>
          <Link to="/book" style={{ textDecoration: 'none' }}>
            <button style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              + Book New Courier
            </button>
          </Link>
          <Link to="/my-couriers" style={{ textDecoration: 'none' }}>
            <button style={{ background: darkMode ? '#334155' : '#f1f5f9', color: text, border: `1px solid ${border}`, padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              📋 All My Orders
            </button>
          </Link>
        </div>

        {/* Recent orders with Track button */}
        <div style={{ background: card, borderRadius: '20px', padding: '28px', border: `1px solid ${border}`, animation: 'fadeUp 0.7s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: text }}>Recent Orders</h2>
            <Link to="/my-couriers" style={{ fontSize: '13px', color: '#4f46e5', fontWeight: '600', textDecoration: 'none' }}>View all →</Link>
          </div>

          {loading ? <Spinner /> : couriers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: muted }}>
              <div style={{ fontSize: '52px', marginBottom: '12px' }}>📭</div>
              <p style={{ fontSize: '16px' }}>No orders yet</p>
              <Link to="/book">
                <button style={{ marginTop: '16px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  Book your first courier
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {couriers.slice(0, 5).map(c => (
                <div key={c._id} style={{ padding: '16px', borderRadius: '12px', background: darkMode ? '#0f172a' : '#f8fafc', border: `1px solid ${border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '700', color: '#4f46e5', fontSize: '15px', letterSpacing: '0.5px' }}>{c.trackingId}</p>
                      <p style={{ color: muted, fontSize: '12px', marginTop: '3px' }}>
                        To: {c.receiverName} · {c.packageType} · {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                      {/* Payment badge */}
                      <span style={{
                        display: 'inline-block', marginTop: '6px',
                        fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px',
                        background: c.paymentStatus === 'Paid' ? (darkMode ? '#052e16' : '#f0fdf4') : (darkMode ? '#1c1400' : '#fffbeb'),
                        color: c.paymentStatus === 'Paid' ? '#16a34a' : '#d97706',
                      }}>
                        {c.paymentStatus === 'Paid' ? '✅ Paid' : '💵 COD - Pending'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <StatusBadge status={c.status} />
                      <button
                        onClick={() => navigate(`/track/${c.trackingId}`)}
                        style={{
                          background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                          color: '#fff', border: 'none', padding: '7px 14px',
                          borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                          cursor: 'pointer', whiteSpace: 'nowrap',
                        }}
                      >
                        🔍 Track Parcel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
