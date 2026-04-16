import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ALL_STATUSES = ['Order Placed', 'Packaging', 'In Transit', 'Reached Depot', 'Out for Delivery', 'Delivered'];

const STAGE_TABS = [
  { key: 'All',              label: 'All',              icon: '📦' },
  { key: 'Order Placed',     label: 'Order Placed',     icon: '🆕' },
  { key: 'Packaging',        label: 'Packaging',        icon: '🗃️'  },
  { key: 'In Transit',       label: 'In Transit',       icon: '🚚' },
  { key: 'Reached Depot',    label: 'Reached Depot',    icon: '🏭' },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: '🛵' },
  { key: 'Delivered',        label: 'Delivered',        icon: '✅' },
];

export default function OrdersDashboard() {
  const { darkMode } = useAuth();
  const [couriers, setCouriers]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [activeTab, setActiveTab] = useState('All');

  // Edit modal
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm]   = useState({ status: '', assignedAgent: '' });
  const [saving, setSaving]       = useState(false);

  // OTP modal
  const [otpModal, setOtpModal]   = useState(null);
  const [otpInput, setOtpInput]   = useState('');
  const [verifying, setVerifying] = useState(false);

  const prevCountRef = useRef(0);

  const dark   = darkMode;
  const border = dark ? '#334155' : '#e2e8f0';
  const text   = dark ? '#e2e8f0' : '#1e293b';
  const muted  = dark ? '#94a3b8' : '#64748b';

  const fetchCouriers = useCallback(async (silent = false) => {
    try {
      const { data } = await api.get('/couriers/all');
      setCouriers(data);
      if (!silent && prevCountRef.current > 0 && data.length > prevCountRef.current)
        toast.success(`🆕 ${data.length - prevCountRef.current} new order(s) arrived!`);
      prevCountRef.current = data.length;
    } catch {
      if (!silent) toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCouriers(); }, [fetchCouriers]);
  useEffect(() => {
    const t = setInterval(() => fetchCouriers(true), 10000);
    return () => clearInterval(t);
  }, [fetchCouriers]);

  const saveEdit = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/courier/update/${editModal._id}`, editForm);
      setCouriers(prev => prev.map(c => c._id === data._id ? data : c));
      toast.success('Order updated!');
      setEditModal(null);
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const verifyOtp = async () => {
    if (!otpInput.trim()) return toast.error('Enter the OTP from the customer');
    setVerifying(true);
    try {
      const { data } = await api.post('/courier/verify-otp', { courierId: otpModal._id, otp: otpInput });
      setCouriers(prev => prev.map(c => c._id === data.courier._id ? data.courier : c));
      toast.success('✅ Delivery confirmed!');
      setOtpModal(null); setOtpInput('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    } finally { setVerifying(false); }
  };

  // Filter by tab + search
  const filtered = couriers
    .filter(c => activeTab === 'All' || c.status === activeTab)
    .filter(c =>
      c.trackingId?.toLowerCase().includes(search.toLowerCase()) ||
      c.senderName?.toLowerCase().includes(search.toLowerCase()) ||
      c.receiverName?.toLowerCase().includes(search.toLowerCase())
    );

  // Count per tab
  const countFor = key => key === 'All' ? couriers.length : couriers.filter(c => c.status === key).length;

  return (
    <>
      <div className="sc-page" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 24, animation: 'fadeUp 0.35s ease' }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: text }}>All Orders</h1>
          <p style={{ color: muted, marginTop: 4, fontSize: 14 }}>Filter by delivery stage · auto-refreshes every 10s</p>
        </div>

        {/* Stage filter tabs */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap',
          animation: 'fadeUp 0.4s ease',
        }}>
          {STAGE_TABS.map(({ key, label, icon }) => {
            const active = activeTab === key;
            const count  = countFor(key);
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 10, fontSize: 13,
                  fontWeight: active ? 700 : 500, cursor: 'pointer',
                  border: `1.5px solid ${active ? '#4f46e5' : border}`,
                  background: active ? (dark ? '#1e1b4b' : '#eef2ff') : (dark ? '#1e293b' : '#ffffff'),
                  color: active ? '#4f46e5' : muted,
                  transition: 'all 0.15s',
                  boxShadow: active ? '0 2px 8px rgba(79,70,229,0.15)' : 'none',
                }}
              >
                <span>{icon}</span>
                {label}
                <span style={{
                  background: active ? '#4f46e5' : (dark ? '#334155' : '#f1f5f9'),
                  color: active ? '#fff' : muted,
                  borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 700,
                }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Table card */}
        <div className="sc-card" style={{ padding: 24, animation: 'fadeUp 0.45s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: text }}>
              {activeTab === 'All' ? 'All Couriers' : activeTab}
              <span style={{ marginLeft: 8, fontSize: 13, color: muted, fontWeight: 500 }}>({filtered.length})</span>
            </h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search tracking ID, sender, receiver..."
                className="sc-input" style={{ width: 280 }}
              />
              <button onClick={() => fetchCouriers()} className="sc-btn"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', padding: '10px 16px', fontSize: 13 }}>
                ↻
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: muted }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: muted }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
              <p>{search ? 'No results match your search' : `No orders in "${activeTab}"`}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="sc-table">
                <thead>
                  <tr>
                    {['Tracking ID', 'Sender', 'Receiver', 'Package', 'Pickup', 'Delivery', 'Agent', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 700, color: '#6366f1', whiteSpace: 'nowrap' }}>{c.trackingId}</td>
                      <td style={{ color: text, whiteSpace: 'nowrap' }}>{c.senderName}</td>
                      <td style={{ color: text, whiteSpace: 'nowrap' }}>{c.receiverName}</td>
                      <td style={{ color: muted }}>{c.packageType}</td>
                      <td style={{ color: muted, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.pickupAddress}>{c.pickupAddress}</td>
                      <td style={{ color: muted, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.deliveryAddress}>{c.deliveryAddress}</td>
                      <td style={{ color: muted }}>{c.assignedAgent || '—'}</td>
                      <td>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: c.paymentStatus === 'Paid' ? (dark ? '#052e16' : '#f0fdf4') : (dark ? '#1c1400' : '#fffbeb'),
                          color: c.paymentStatus === 'Paid' ? '#16a34a' : '#d97706',
                        }}>
                          {c.paymentStatus === 'Paid' ? '✅ Paid' : '💵 COD'}
                        </span>
                      </td>
                      <td><StatusBadge status={c.status} /></td>
                      <td style={{ color: muted, whiteSpace: 'nowrap' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => { setEditModal(c); setEditForm({ status: c.status, assignedAgent: c.assignedAgent || '' }); }}
                            className="sc-btn"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', padding: '5px 12px', fontSize: 12 }}
                          >Edit</button>
                          {c.status === 'Out for Delivery' && !c.otpVerified && (
                            <button
                              onClick={() => { setOtpModal(c); setOtpInput(''); }}
                              className="sc-btn"
                              style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', padding: '5px 12px', fontSize: 12 }}
                            >🔐 OTP</button>
                          )}
                          {c.otpVerified && (
                            <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center' }}>✅</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editModal && (
        <div className="sc-overlay">
          <div className="sc-modal">
            <h3 style={{ fontSize: 18, fontWeight: 700, color: text, marginBottom: 4 }}>Update Order</h3>
            <p style={{ color: '#6366f1', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>{editModal.trackingId}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: muted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="sc-input">
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: muted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Agent</label>
                <input value={editForm.assignedAgent} onChange={e => setEditForm({ ...editForm, assignedAgent: e.target.value })} placeholder="Agent name" className="sc-input" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setEditModal(null)} className="sc-btn"
                style={{ flex: 1, background: dark ? '#334155' : '#f1f5f9', color: text, border: `1px solid ${border}` }}>
                Cancel
              </button>
              <button onClick={saveEdit} disabled={saving} className="sc-btn"
                style={{ flex: 1, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP modal */}
      {otpModal && (
        <div className="sc-overlay">
          <div className="sc-modal" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🔐</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: text, marginBottom: 6 }}>Verify Delivery OTP</h3>
            <p style={{ color: '#6366f1', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{otpModal.trackingId}</p>
            <p style={{ color: muted, fontSize: 13, marginBottom: 16 }}>
              Receiver: <strong style={{ color: text }}>{otpModal.receiverName}</strong>
            </p>
            <div style={{ background: dark ? '#0f172a' : '#f8fafc', border: `1px solid ${border}`, borderRadius: 10, padding: '10px 14px', marginBottom: 18, textAlign: 'left' }}>
              <p style={{ fontSize: 12, color: muted, lineHeight: 1.6 }}>
                Ask the customer for their OTP and enter it below. The order will be marked <strong style={{ color: '#16a34a' }}>Delivered</strong>.
              </p>
            </div>
            <input
              value={otpInput} onChange={e => setOtpInput(e.target.value)}
              placeholder="Enter OTP" maxLength={8}
              className="sc-input"
              style={{ fontSize: 22, textAlign: 'center', letterSpacing: 8, marginBottom: 20 }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => { setOtpModal(null); setOtpInput(''); }} className="sc-btn"
                style={{ flex: 1, background: dark ? '#334155' : '#f1f5f9', color: text, border: `1px solid ${border}` }}>
                Cancel
              </button>
              <button onClick={verifyOtp} disabled={verifying} className="sc-btn"
                style={{ flex: 1, background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', opacity: verifying ? 0.7 : 1 }}>
                {verifying ? 'Verifying...' : '✅ Confirm Delivery'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
