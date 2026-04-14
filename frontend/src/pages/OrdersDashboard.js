import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const STATUSES = ['Pending', 'Shipped', 'Out for Delivery', 'Delivered'];

const STATUS_COLORS = {
  Pending:           { bg: '#fffbeb', color: '#d97706', dark_bg: '#1c1400' },
  Shipped:           { bg: '#eff6ff', color: '#2563eb', dark_bg: '#0c1a3a' },
  'Out for Delivery':{ bg: '#f5f3ff', color: '#7c3aed', dark_bg: '#1a0f3a' },
  Delivered:         { bg: '#f0fdf4', color: '#16a34a', dark_bg: '#052e16' },
};

export default function OrdersDashboard() {
  const { darkMode } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const prevCountRef = useRef(0);

  const bg     = darkMode ? '#0f172a' : '#f8fafc';
  const card   = darkMode ? '#1e293b' : '#ffffff';
  const border = darkMode ? '#334155' : '#e2e8f0';
  const text   = darkMode ? '#e2e8f0' : '#1e293b';
  const muted  = darkMode ? '#94a3b8' : '#64748b';
  const inputBg = darkMode ? '#0f172a' : '#f8fafc';

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const { data } = await api.get(`/orders${params}`);
      setOrders(data);
      if (!silent && prevCountRef.current > 0 && data.length > prevCountRef.current) {
        toast.success(`🆕 ${data.length - prevCountRef.current} new order(s) arrived!`);
      }
      prevCountRef.current = data.length;
    } catch {
      if (!silent) toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [search]);

  // Initial load
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Poll every 10 seconds for new orders
  useEffect(() => {
    const interval = setInterval(() => fetchOrders(true), 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const openEdit = (order) => {
    setEditModal(order);
    setNewStatus(order.status);
  };

  const saveStatus = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch(`/orders/${editModal._id}`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === data._id ? data : o));
      toast.success('Status updated!');
      setEditModal(null);
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (status) => {
    const s = STATUS_COLORS[status] || STATUS_COLORS.Pending;
    return (
      <span style={{
        padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
        background: darkMode ? s.dark_bg : s.bg, color: s.color,
      }}>{status}</span>
    );
  };

  const stats = {
    total:    orders.length,
    pending:  orders.filter(o => o.status === 'Pending').length,
    shipped:  orders.filter(o => o.status === 'Shipped').length,
    delivered:orders.filter(o => o.status === 'Delivered').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '32px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px', animation: 'fadeUp 0.4s ease' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: text }}>Orders Dashboard</h1>
          <p style={{ color: muted, marginTop: '4px' }}>All customer orders — auto-refreshes every 10s</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Orders', value: stats.total,     icon: '📦', color: '#6366f1' },
            { label: 'Pending',      value: stats.pending,   icon: '⏳', color: '#d97706' },
            { label: 'Shipped',      value: stats.shipped,   icon: '🚚', color: '#2563eb' },
            { label: 'Delivered',    value: stats.delivered, icon: '✅', color: '#16a34a' },
          ].map(({ label, value, icon, color }, i) => (
            <div key={label} style={{
              background: card, borderRadius: '16px', padding: '20px',
              border: `1px solid ${border}`, animation: `fadeUp ${0.4 + i * 0.1}s ease`,
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color }}>{value}</div>
              <div style={{ fontSize: '13px', color: muted, marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{
          background: card, borderRadius: '20px', padding: '24px',
          border: `1px solid ${border}`, animation: 'fadeUp 0.6s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: text }}>All Orders</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, phone, order ID..."
                style={{
                  padding: '10px 16px', borderRadius: '10px',
                  border: `1px solid ${border}`, background: inputBg, color: text,
                  fontSize: '13px', outline: 'none', width: '280px',
                }}
              />
              <button
                onClick={() => fetchOrders()}
                style={{
                  padding: '10px 16px', borderRadius: '10px',
                  background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                  color: '#fff', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap',
                }}
              >↻ Refresh</button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: muted }}>Loading orders...</div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: muted }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
              <p>No orders found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${border}` }}>
                    {['Order ID', 'Customer', 'Phone', 'Pickup', 'Delivery', 'Type', 'Weight', 'Status', 'Date', 'Action'].map(h => (
                      <th key={h} style={{
                        padding: '12px 10px', textAlign: 'left',
                        fontSize: '11px', fontWeight: '700', color: muted,
                        textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, i) => (
                    <tr key={o._id} style={{
                      borderBottom: `1px solid ${border}`,
                      animation: `fadeUp ${0.2 + i * 0.02}s ease`,
                    }}>
                      <td style={{ padding: '14px 10px', fontSize: '13px', fontWeight: '700', color: '#6366f1', whiteSpace: 'nowrap' }}>{o.orderId}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: text, whiteSpace: 'nowrap' }}>{o.customerName}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: muted, whiteSpace: 'nowrap' }}>{o.phone}</td>
                      <td style={{ padding: '14px 10px', fontSize: '12px', color: muted, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={o.pickupAddress}>{o.pickupAddress}</td>
                      <td style={{ padding: '14px 10px', fontSize: '12px', color: muted, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={o.deliveryAddress}>{o.deliveryAddress}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: muted }}>{o.parcelType}</td>
                      <td style={{ padding: '14px 10px', fontSize: '13px', color: muted, whiteSpace: 'nowrap' }}>{o.weight} kg</td>
                      <td style={{ padding: '14px 10px' }}>{statusBadge(o.status)}</td>
                      <td style={{ padding: '14px 10px', fontSize: '12px', color: muted, whiteSpace: 'nowrap' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 10px' }}>
                        <button
                          onClick={() => openEdit(o)}
                          style={{
                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                            color: '#fff', border: 'none', padding: '6px 14px',
                            borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                          }}
                        >Update</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Status update modal */}
      {editModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: card, borderRadius: '20px', padding: '32px',
            width: '100%', maxWidth: '420px', border: `1px solid ${border}`,
            animation: 'fadeUp 0.3s ease',
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: text, marginBottom: '4px' }}>Update Order Status</h3>
            <p style={{ color: muted, fontSize: '13px', marginBottom: '8px' }}>{editModal.orderId}</p>
            <p style={{ color: muted, fontSize: '13px', marginBottom: '24px' }}>
              Customer: <strong style={{ color: text }}>{editModal.customerName}</strong>
            </p>

            <label style={{ fontSize: '13px', fontWeight: '600', color: muted, display: 'block', marginBottom: '8px' }}>Status</label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px',
                border: `1px solid ${border}`, background: inputBg, color: text,
                fontSize: '14px', outline: 'none', marginBottom: '24px',
              }}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setEditModal(null)} style={{
                flex: 1, padding: '12px', borderRadius: '10px',
                background: darkMode ? '#334155' : '#f1f5f9',
                color: text, border: 'none', cursor: 'pointer', fontWeight: '600',
              }}>Cancel</button>
              <button onClick={saveStatus} disabled={saving} style={{
                flex: 1, padding: '12px', borderRadius: '10px',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600',
                opacity: saving ? 0.7 : 1,
              }}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
