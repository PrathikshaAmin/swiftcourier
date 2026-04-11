import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, darkMode: dark } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const bg    = dark ? '#0f172a' : '#f1f5f9';
  const card  = dark ? '#1e293b' : '#fff';
  const bdr   = dark ? '#334155' : '#e2e8f0';
  const txt   = dark ? '#f1f5f9' : '#0f172a';
  const muted = dark ? '#94a3b8' : '#64748b';
  const inp   = dark ? '#0f172a' : '#f8fafc';

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex' }}>
      {/* Branding */}
      <div className="hide-mobile" style={{
        flex: 1, background: 'linear-gradient(145deg,#4338ca 0%,#7c3aed 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', padding: 60, color: '#fff',
      }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>⚡</div>
        <h1 style={{ fontSize: 38, fontWeight: 800, marginBottom: 12 }}>SwiftCourier</h1>
        <p style={{ fontSize: 17, opacity: 0.8, textAlign: 'center', maxWidth: 300, lineHeight: 1.7 }}>
          Fast, reliable, and trackable deliveries — right to your doorstep.
        </p>
        <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280 }}>
          {['Real-time parcel tracking', 'OTP-secured delivery', 'Instant booking confirmation'].map(f => (
            <div key={f} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(255,255,255,0.13)', borderRadius: 10, padding: '11px 16px',
            }}>
              <span style={{ fontSize: 16 }}>✓</span>
              <span style={{ fontSize: 14 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420, animation: 'fadeUp 0.4s ease' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: txt, marginBottom: 6 }}>Sign in</h2>
          <p style={{ color: muted, marginBottom: 36 }}>Enter your credentials to continue</p>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { label: 'Email Address', key: 'email', type: 'email', ph: 'you@example.com' },
              { label: 'Password',      key: 'password', type: 'password', ph: '••••••••' },
            ].map(({ label, key, type, ph }) => (
              <div key={key}>
                <label style={{ fontSize: 12, fontWeight: 700, color: muted, display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</label>
                <input type={type} required value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={ph}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: 10, border: `1.5px solid ${bdr}`, background: inp, color: txt, fontSize: 15, outline: 'none' }}
                />
              </div>
            ))}
            <button type="submit" disabled={loading} style={{
              background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
              color: '#fff', border: 'none', padding: 14,
              borderRadius: 10, fontSize: 16, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1, marginTop: 4,
            }}>{loading ? 'Signing in…' : 'Sign In →'}</button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 15, color: muted }}>
            New customer?{' '}
            <Link to="/register" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
