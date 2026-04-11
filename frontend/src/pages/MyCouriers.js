import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
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
  const [otpModal, setOtpModal] = useState(null);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    api.get('/courier/my').then(({ data }) => {
      setCouriers(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const verifyOtp = async () => {
    if (!otp.trim()) return toast.error('Enter OTP');
    setVerifying(true);
    try {
      const { data } = await api.post('/courier/verify-otp', { courierId: otpModal._id, otp });
      setCouriers(prev => prev.map(c => c._id === data.courier._id ? data.courier : c));
      toast.success('Delivery confirmed!');
      setOtpModal(null);
      setOtp('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const bg = darkMode ? '#0f172a' : '#f1f5f9';
  const card = darkMode ? '#1e293b' : '#ffffff';
  const border = darkMode ? '#334155' : '#e2e8f0';
  const text = darkMode ? '#f1f5f9' : '#0f172a';
  const muted = darkMode ? '#94a3b8' : '#64748b';
  const inputBg = darkMode ? '#0f172a' : '#f8fafc';

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '40px 24px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', animation: 'fadeUp 0.4s ease' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: text }}>My Orders</h1>
          <p style={{ color: muted, marginTop: '6px' }}>All your courier bookings</p>
        </div>

        {loading ? <Spinner /> : couriers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: muted }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
            <p style={{ fontSize: '18px' }}>No orders yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {couriers.map((c, i) => (
              <div key={c._id} style={{
                background: card, borderRadius: '16px', padding: '24px',
                border: `1px solid ${border}`,
                animation: `fadeUp ${0.3 + i * 0.05}s ease`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <p style={{ fontWeight: '800', fontSize: '18px', color: '#4f46e5', letterSpacing: '0.5px' }}>{c.trackingId}</p>
                    <p style={{ color: muted, fontSize: '12px', marginTop: '2px' }}>{new Date(c.createdAt).toLocaleString()}</p>
                    {/* Payment status */}
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
                      style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >🔍 Track Parcel</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { label: 'From', value: c.senderName },
                    { label: 'To', value: c.receiverName },
                    { label: 'Package', value: c.packageType },
                    { label: 'Pickup', value: c.pickupAddress },
                    { label: 'Delivery', value: c.deliveryAddress },
                    { label: 'Agent', value: c.assignedAgent || 'Not assigned' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '8px', padding: '10px' }}>
                      <p style={{ fontSize: '11px', color: muted, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: text }}>{value}</p>
                    </div>
                  ))}
                </div>
                {c.status === 'Out for Delivery' && !c.otpVerified && (
                  <button onClick={() => setOtpModal(c)} style={{
                    marginTop: '16px',
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    color: '#fff', border: 'none', padding: '10px 20px',
                    borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                  }}>🔐 Verify OTP to Complete Delivery</button>
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

      {/* OTP Modal */}
      {otpModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(6px)',
        }}>
          <div style={{
            background: card, borderRadius: '20px', padding: '36px',
            width: '100%', maxWidth: '380px', border: `1px solid ${border}`,
            animation: 'fadeUp 0.3s ease',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔐</div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: text }}>Verify Delivery OTP</h3>
              <p style={{ color: muted, fontSize: '13px', marginTop: '6px' }}>
                Enter the OTP you received when booking <strong style={{ color: '#4f46e5' }}>{otpModal.trackingId}</strong>
              </p>
            </div>
            <input
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="Enter OTP"
              maxLength={6}
              style={{
                width: '100%', padding: '16px', borderRadius: '10px',
                border: `1.5px solid ${border}`, background: inputBg, color: text,
                fontSize: '24px', textAlign: 'center', letterSpacing: '6px',
                outline: 'none', marginBottom: '16px', boxSizing: 'border-box',
                fontFamily: 'Inter, monospace',
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setOtpModal(null); setOtp(''); }} style={{
                flex: 1, padding: '12px', borderRadius: '10px',
                background: darkMode ? '#334155' : '#f1f5f9',
                color: text, border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px',
              }}>Cancel</button>
              <button onClick={verifyOtp} disabled={verifying} style={{
                flex: 1, padding: '12px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px',
                opacity: verifying ? 0.7 : 1,
              }}>{verifying ? 'Verifying...' : 'Confirm Delivery'}</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
