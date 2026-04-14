import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const PARCEL_TYPES = ['Document', 'Package', 'Fragile', 'Electronics', 'Clothing', 'Food', 'Other'];

const EMPTY = {
  customerName: '', phone: '', pickupAddress: '',
  deliveryAddress: '', parcelType: 'Document',
  weight: '', description: '',
};

export default function PlaceOrder() {
  const { darkMode } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const bg     = darkMode ? '#0f172a' : '#f1f5f9';
  const card   = darkMode ? '#1e293b' : '#ffffff';
  const border = darkMode ? '#334155' : '#e2e8f0';
  const text   = darkMode ? '#f1f5f9' : '#0f172a';
  const muted  = darkMode ? '#94a3b8' : '#64748b';
  const inputBg = darkMode ? '#0f172a' : '#f8fafc';

  const inp = {
    width: '100%', padding: '12px 16px', borderRadius: '10px',
    border: `1.5px solid ${border}`, background: inputBg, color: text,
    fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box',
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.phone || !form.pickupAddress || !form.deliveryAddress || !form.weight)
      return toast.error('Please fill all required fields');
    if (isNaN(form.weight) || Number(form.weight) <= 0)
      return toast.error('Weight must be a positive number');

    setLoading(true);
    try {
      const { data } = await api.post('/orders', { ...form, weight: Number(form.weight) });
      setSuccess(data);
      setForm(EMPTY);
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '40px 24px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        <div style={{ marginBottom: '32px', animation: 'fadeUp 0.4s ease' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: text }}>Place an Order</h1>
          <p style={{ color: muted, marginTop: '6px' }}>Fill in your parcel details below</p>
        </div>

        {/* Success card */}
        {success && (
          <div style={{
            background: darkMode ? '#052e16' : '#f0fdf4',
            border: `1px solid ${darkMode ? '#166534' : '#bbf7d0'}`,
            borderRadius: '16px', padding: '24px', marginBottom: '28px',
            animation: 'fadeUp 0.3s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '36px' }}>🎉</span>
              <div>
                <h3 style={{ color: darkMode ? '#4ade80' : '#16a34a', fontWeight: '800', fontSize: '18px' }}>
                  Order Placed Successfully!
                </h3>
                <p style={{ color: muted, fontSize: '13px' }}>Your order is now visible in the admin dashboard</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Order ID', value: success.orderId },
                { label: 'Status', value: success.status },
                { label: 'Customer', value: success.customerName },
                { label: 'Parcel Type', value: success.parcelType },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: card, borderRadius: '10px', padding: '14px' }}>
                  <p style={{ fontSize: '10px', color: muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>{label}</p>
                  <p style={{ fontWeight: '700', fontSize: '15px', color: '#4f46e5' }}>{value}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSuccess(null)}
              style={{
                marginTop: '16px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                color: '#fff', border: 'none', padding: '10px 20px',
                borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              }}
            >Place Another Order</button>
          </div>
        )}

        <div style={{ background: card, borderRadius: '20px', padding: '32px', border: `1px solid ${border}`, animation: 'fadeUp 0.5s ease' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Customer Name + Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: muted, display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Customer Name *
                </label>
                <input required value={form.customerName} onChange={set('customerName')} placeholder="John Doe" style={inp} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: muted, display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Phone Number *
                </label>
                <input required value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" style={inp} />
              </div>
            </div>

            {/* Pickup Address */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: muted, display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Pickup Address *
              </label>
              <input required value={form.pickupAddress} onChange={set('pickupAddress')} placeholder="123 Main St, Mumbai" style={inp} />
            </div>

            {/* Delivery Address */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: muted, display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Delivery Address *
              </label>
              <input required value={form.deliveryAddress} onChange={set('deliveryAddress')} placeholder="456 Park Ave, Delhi" style={inp} />
            </div>

            {/* Parcel Type + Weight */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: muted, display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Parcel Type *
                </label>
                <select value={form.parcelType} onChange={set('parcelType')} style={{ ...inp, cursor: 'pointer' }}>
                  {PARCEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: muted, display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Weight (kg) *
                </label>
                <input
                  required type="number" min="0.1" step="0.1"
                  value={form.weight} onChange={set('weight')}
                  placeholder="e.g. 2.5" style={inp}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: muted, display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Description (optional)
              </label>
              <textarea
                value={form.description} onChange={set('description')}
                placeholder="Any special instructions or notes..."
                rows={3}
                style={{ ...inp, resize: 'vertical', lineHeight: '1.5' }}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#fff', border: 'none', padding: '14px',
                borderRadius: '10px', fontSize: '16px', fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Placing Order...' : '🚀 Place Order'}
            </button>
          </form>
        </div>
      </div>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
