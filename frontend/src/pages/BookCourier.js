import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const PACKAGE_TYPES = ['Document', 'Parcel', 'Fragile', 'Electronics', 'Clothing', 'Food'];

export default function BookCourier() {
  const { darkMode } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    senderName: '', receiverName: '',
    pickupAddress: '', deliveryAddress: '',
    packageType: 'Document', paymentMethod: 'COD',
  });
  const [loading, setLoading]         = useState(false);
  const [payLoading, setPayLoading]   = useState(false);
  const [result, setResult]           = useState(null);
  const [payStep, setPayStep]         = useState(false); // show simulated payment UI

  const handleSubmit = async (e) => {
    e.preventDefault();
    // If online payment, show payment simulation first
    if (form.paymentMethod === 'Online') {
      setPayStep(true);
      return;
    }
    await doBook();
  };

  const doBook = async (method = form.paymentMethod) => {
    setLoading(true);
    try {
      const { data } = await api.post('/courier/create', { ...form, paymentMethod: method });
      setResult(data);
      setPayStep(false);
      toast.success('Courier booked successfully!');
      setForm({ senderName: '', receiverName: '', pickupAddress: '', deliveryAddress: '', packageType: 'Document', paymentMethod: 'COD' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const simulatePay = async () => {
    setPayLoading(true);
    // Simulate payment gateway delay
    await new Promise(r => setTimeout(r, 2000));
    setPayLoading(false);
    toast.success('Payment successful! 💳');
    await doBook('Online');
  };

  const bg      = darkMode ? '#0f172a' : '#f1f5f9';
  const card    = darkMode ? '#1e293b' : '#ffffff';
  const border  = darkMode ? '#334155' : '#e2e8f0';
  const text    = darkMode ? '#f1f5f9' : '#0f172a';
  const muted   = darkMode ? '#94a3b8' : '#64748b';
  const inputBg = darkMode ? '#0f172a' : '#f8fafc';

  const inp = {
    width: '100%', padding: '12px 16px', borderRadius: '10px',
    border: `1.5px solid ${border}`, background: inputBg, color: text,
    fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  };

  // ── Simulated payment screen ─────────────────────────────────────────────
  if (payStep) {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: card, borderRadius: '20px', padding: '40px', maxWidth: '420px', width: '100%', border: `1px solid ${border}`, animation: 'fadeUp 0.3s ease', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: text, marginBottom: '8px' }}>Secure Payment</h2>
          <p style={{ color: muted, fontSize: '14px', marginBottom: '28px' }}>Simulated payment gateway — no real charges</p>

          <div style={{ background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: muted, fontSize: '13px' }}>Package Type</span>
              <span style={{ color: text, fontWeight: '600', fontSize: '13px' }}>{form.packageType}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: muted, fontSize: '13px' }}>Delivery To</span>
              <span style={{ color: text, fontWeight: '600', fontSize: '13px' }}>{form.receiverName}</span>
            </div>
            <div style={{ borderTop: `1px solid ${border}`, paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: text, fontWeight: '700' }}>Total</span>
              <span style={{ color: '#4f46e5', fontWeight: '800', fontSize: '18px' }}>₹149.00</span>
            </div>
          </div>

          {/* Fake card input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', textAlign: 'left' }}>
            <input readOnly value="4242 4242 4242 4242" style={{ ...inp, letterSpacing: '2px', color: muted }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input readOnly value="12/28" style={inp} />
              <input readOnly value="•••" style={inp} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setPayStep(false)} style={{ flex: 1, padding: '13px', borderRadius: '10px', background: darkMode ? '#334155' : '#f1f5f9', color: text, border: 'none', cursor: 'pointer', fontWeight: '600' }}>
              Cancel
            </button>
            <button onClick={simulatePay} disabled={payLoading} style={{
              flex: 2, padding: '13px', borderRadius: '10px',
              background: payLoading ? '#a5b4fc' : 'linear-gradient(135deg,#4f46e5,#7c3aed)',
              color: '#fff', border: 'none', cursor: payLoading ? 'not-allowed' : 'pointer',
              fontWeight: '700', fontSize: '15px',
            }}>
              {payLoading ? '⏳ Processing...' : '💳 Pay ₹149.00'}
            </button>
          </div>
        </div>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
      </div>
    );
  }

  return (
    <div className="sc-page">
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', animation: 'fadeUp 0.4s ease' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: text }}>Book a Courier</h1>
          <p style={{ color: muted, marginTop: '6px', fontSize: 14 }}>Fill in the shipment details below</p>
        </div>

        {/* Booking confirmation */}
        {result && (
          <div style={{
            background: darkMode ? '#052e16' : '#f0fdf4',
            border: `1px solid ${darkMode ? '#166534' : '#bbf7d0'}`,
            borderRadius: '16px', padding: '24px', marginBottom: '28px', animation: 'fadeUp 0.3s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '36px' }}>🎉</span>
              <div>
                <h3 style={{ color: darkMode ? '#4ade80' : '#16a34a', fontWeight: '800', fontSize: '18px' }}>Booking Confirmed!</h3>
                <p style={{ color: muted, fontSize: '13px' }}>Save your tracking ID and OTP safely</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div style={{ background: card, borderRadius: '10px', padding: '14px' }}>
                <p style={{ fontSize: '10px', color: muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Tracking ID</p>
                <p style={{ fontWeight: '800', fontSize: '16px', color: '#4f46e5', letterSpacing: '0.5px' }}>{result.trackingId}</p>
              </div>
              <div style={{ background: card, borderRadius: '10px', padding: '14px' }}>
                <p style={{ fontSize: '10px', color: muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Delivery OTP</p>
                <p style={{ fontWeight: '800', fontSize: '16px', color: '#7c3aed', letterSpacing: '4px' }}>{result.otp}</p>
              </div>
              <div style={{ background: card, borderRadius: '10px', padding: '14px' }}>
                <p style={{ fontSize: '10px', color: muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Payment</p>
                <p style={{ fontWeight: '700', fontSize: '14px', color: result.paymentStatus === 'Paid' ? '#22c55e' : '#f59e0b' }}>
                  {result.paymentStatus === 'Paid' ? '✅ Paid' : '💵 COD'}
                </p>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: muted, marginTop: '12px' }}>⚠️ Share the OTP only with the delivery agent at the time of delivery</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button onClick={() => navigate('/my-couriers')} style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                View My Orders →
              </button>
              <button onClick={() => navigate(`/track/${result.trackingId}`)} style={{ background: darkMode ? '#334155' : '#f1f5f9', color: text, border: `1px solid ${border}`, padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                🔍 Track Parcel
              </button>
            </div>
          </div>
        )}

        <div className="sc-card" style={{ padding: '32px', animation: 'fadeUp 0.5s ease' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: muted, display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sender Name</label>
                <input required value={form.senderName} onChange={e => setForm({ ...form, senderName: e.target.value })} placeholder="John Doe" style={inp} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: muted, display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Receiver Name</label>
                <input required value={form.receiverName} onChange={e => setForm({ ...form, receiverName: e.target.value })} placeholder="Jane Smith" style={inp} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: muted, display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pickup Address</label>
              <input required value={form.pickupAddress} onChange={e => setForm({ ...form, pickupAddress: e.target.value })} placeholder="123 Main St, Mumbai" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: muted, display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery Address</label>
              <input required value={form.deliveryAddress} onChange={e => setForm({ ...form, deliveryAddress: e.target.value })} placeholder="456 Park Ave, Delhi" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: muted, display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Package Type</label>
              <select value={form.packageType} onChange={e => setForm({ ...form, packageType: e.target.value })} style={{ ...inp, cursor: 'pointer' }}>
                {PACKAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Payment method */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: muted, display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { value: 'COD', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when delivered' },
                  { value: 'Online', label: 'Online Payment', icon: '💳', desc: 'Pay now — instant' },
                ].map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => setForm({ ...form, paymentMethod: opt.value })}
                    style={{
                      padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                      border: `2px solid ${form.paymentMethod === opt.value ? '#4f46e5' : border}`,
                      background: form.paymentMethod === opt.value ? (darkMode ? '#1e1b4b' : '#eef2ff') : inputBg,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>{opt.icon}</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: form.paymentMethod === opt.value ? '#4f46e5' : text }}>{opt.label}</div>
                    <div style={{ fontSize: '11px', color: muted, marginTop: '2px' }}>{opt.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: '#fff', border: 'none', padding: '14px',
              borderRadius: '10px', fontSize: '16px', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Booking...' : form.paymentMethod === 'Online' ? '💳 Proceed to Payment' : '🚀 Book Courier'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
