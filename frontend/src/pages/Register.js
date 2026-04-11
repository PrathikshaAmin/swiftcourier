import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, darkMode: dark } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.user, data.token);
      toast.success('Account created! Welcome to SwiftCourier 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const bg    = dark ? '#0f172a' : '#f1f5f9';
  const bdr   = dark ? '#334155' : '#e2e8f0';
  const txt   = dark ? '#f1f5f9' : '#0f172a';
  const muted = dark ? '#94a3b8' : '#64748b';
  const inp   = dark ? '#0f172a' : '#f8fafc';

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex' }}>
      <div className="hide-mobile" style={{
        flex: 1, background: 'linear-gradient(145deg,#4338ca 0%,#7c3aed 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', padding: 60, color: '#fff',
      }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>📦</div>
        <h1 style={{ fontSize: 38, fontWeight: 800, marginBottom: 12 }}>Join SwiftCourier</h1>
        <p style={{ fontSize: 17, opacity: 0.8, textAlign: 'center', maxWidth: 300, lineHeight: 1.7 }}>
          Ship smarter. Track easier. Deliver faster.
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420, animation: 'fadeUp 0.4s ease' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: txt, marginBottom: 6 }}>Create account</h2>
          <p style={{ color: muted, marginBottom: 36 }}>Start shipping in minutes — it's free</p>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { label: 'Full Name',     key: 'name',     type: 'text',     ph: 'John Doe' },
              { label: 'Email Address', key: 'email',    type: 'email',    ph: 'you@example.com' },
              { label: 'Password',      key: 'password', type: 'password', ph: 'Min. 6 characters' },
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
            }}>{loading ? 'Creating account…' : 'Create Account →'}</button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 15, color: muted }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
