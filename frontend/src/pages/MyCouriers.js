import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function MyCouriers() {
  const { darkMode } = useAuth();
  const navigate = useNavigate();
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courier/my').then(({ data }) => {
      setCouriers(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const border  = darkMode ? '#334155' : '#e2e8f0';
  const text    = darkMode ? '#f1f5f9' : '#0f172a';
  const muted   = darkMode ? '#94a3b8' : '#64748b';

  return (
    <>
      <div className="sc-page" style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ marginBottom: 28, animation: 'fadeUp 0.35s ease' }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: text }}>My Orders</h1>
          <p style={{ color: muted, marginTop: 5, fontSize: 14 }}>All your courier bookings</p>
        </div>

        {loading ? <Spinner /> : couriers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: muted }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
            <p style={{ fontSize: '18px' }}>No orders yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {couriers.map((c, i) => (
              <div key={c._id} className="sc-card" style={{
                padding: '24px',
                animation: `fadeUp ${0.3 + i * 0.05}s ease`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <p
                      onClick={() => navigate(`/track/${c.trackingId}`)}
                      style={{ fontWeight: '800', fontSize: '18px', color: '#4f46e5', letterSpacing: '0.5px', cursor: 'pointer', textDecoration: 'underline', display: 'inline-block' }}
                    >{c.trackingId}</p>
                    <p style={{ color: muted, fontSize: '12px', marginTop: '2px' }}>{new Date(c.createdAt).toLocaleString()}</p>
                    <p style={{ color: muted, fontSize: '12px', marginTop: '3px' }}>
                      📅 Expected:{' '}
                      <span style={{ color: c.status === 'Delivered' ? '#16a34a' : '#f59e0b', fontWeight: '600' }}>
                        {c.status === 'Delivered'
                          ? 'Delivered ✅'
                          : new Date(new Date(c.createdAt).getTime() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </p>
                    <span style={{
                      display: 'inline-block', marginTop: '6px',
                      fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px',
                      background: c.paymentStatus === 'Paid' ? (darkMode ? '#052e16' : '#f0fdf4') : (darkMode ? '#1c1400' : '#fffbeb'),
                      color: c.paymentStatus === 'Paid' ? '#16a34a' : '#d97706',
                    }}>
                      {c.paymentStatus === 'Paid' ? '✅ Paid Online' : '💵 Cash on Delivery'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <StatusBadge status={c.status} />
                    <button
                      onClick={() => navigate(`/track/${c.trackingId}`)}
                      className="sc-btn"
                      style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', padding: '7px 14px', fontSize: 12 }}
                    >🔍 Track Parcel</button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { label: 'From',     value: c.senderName },
                    { label: 'To',       value: c.receiverName },
                    { label: 'Package',  value: c.packageType },
                    { label: 'Pickup',   value: c.pickupAddress },
                    { label: 'Delivery', value: c.deliveryAddress },
                    { label: 'Agent',    value: c.assignedAgent || 'Not assigned' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '8px', padding: '10px' }}>
                      <p style={{ fontSize: '11px', color: muted, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: text }}>{value}</p>
                    </div>
                  ))}
                </div>

                {c.status === 'Out for Delivery' && !c.otpVerified && (
                  <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: darkMode ? '#1c1400' : '#fffbeb', padding: '10px 14px', borderRadius: '8px', border: `1px solid ${darkMode ? '#92400e' : '#fde68a'}` }}>
                    <span>⏳</span>
                    <span style={{ fontSize: '13px', color: '#d97706', fontWeight: '600' }}>Out for delivery — agent will verify your OTP</span>
                  </div>
                )}
                {c.status === 'Delivered' && (
                  <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: darkMode ? '#052e16' : '#f0fdf4', padding: '8px 14px', borderRadius: '8px' }}>
                    <span>✅</span>
                    <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: '600' }}>Delivered successfully</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* No OTP modal here — OTP is verified by the delivery agent on the Admin Dashboard */}
    </>
  );
}
