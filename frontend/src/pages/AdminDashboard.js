import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];
const STATUSES = ['Pending', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function AdminDashboard() {
  const { darkMode } = useAuth();
  const [couriers, setCouriers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', assignedAgent: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/couriers/all'),
      api.get('/courier/stats'),
    ]).then(([c, s]) => {
      setCouriers(c.data);
      // Map stats fields from /courier/stats to what the dashboard expects
      const raw = s.data;
      setStats({
        total:         raw.total,
        delivered:     raw.delivered,
        pending:       raw.orderPlaced,
        outForDelivery:raw.outForDelivery,
        shipped:       raw.inTransit,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const openEdit = (c) => {
    setEditModal(c);
    setEditForm({ status: c.status, assignedAgent: c.assignedAgent || '' });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/courier/update/${editModal._id}`, editForm);
      setCouriers(prev => prev.map(c => c._id === data._id ? data : c));
      setStats(prev => {
        const updated = { ...prev };
        // Recalculate from updated list
        return prev;
      });
      toast.success('Courier updated!');
      setEditModal(null);
      // Refresh stats
      const { data: raw } = await api.get('/courier/stats');
      setStats({
        total:         raw.total,
        delivered:     raw.delivered,
        pending:       raw.orderPlaced,
        outForDelivery:raw.outForDelivery,
        shipped:       raw.inTransit,
      });
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const bg = darkMode ? '#0f172a' : '#f8fafc';
  const card = darkMode ? '#1e293b' : '#ffffff';
  const border = darkMode ? '#334155' : '#e2e8f0';
  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const muted = darkMode ? '#94a3b8' : '#64748b';
  const inputBg = darkMode ? '#0f172a' : '#f8fafc';

  const statCards = stats ? [
    { label: 'Total Orders', value: stats.total, icon: '📦', color: '#6366f1' },
    { label: 'Delivered', value: stats.delivered, icon: '✅', color: '#10b981' },
    { label: 'Pending', value: stats.pending, icon: '⏳', color: '#f59e0b' },
    { label: 'Out for Delivery', value: stats.outForDelivery, icon: '🛵', color: '#8b5cf6' },
  ] : [];

  const pieData = stats ? [
    { name: 'Pending', value: stats.pending },
    { name: 'Shipped', value: stats.shipped },
    { name: 'Out for Delivery', value: stats.outForDelivery },
    { name: 'Delivered', value: stats.delivered },
  ] : [];

  const barData = stats ? [
    { name: 'Pending', count: stats.pending },
    { name: 'Shipped', count: stats.shipped },
    { name: 'Out for Delivery', count: stats.outForDelivery },
    { name: 'Delivered', count: stats.delivered },
  ] : [];

  const filtered = couriers.filter(c =>
    c.trackingId.toLowerCase().includes(search.toLowerCase()) ||
    c.senderName.toLowerCase().includes(search.toLowerCase()) ||
    c.receiverName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '32px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', animation: 'fadeUp 0.4s ease' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: text }}>Admin Dashboard</h1>
          <p style={{ color: muted, marginTop: '4px' }}>Manage all courier operations</p>
        </div>

        {loading ? <Spinner /> : (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              {statCards.map(({ label, value, icon, color }, i) => (
                <div key={label} style={{
                  background: card, borderRadius: '16px', padding: '20px',
                  border: `1px solid ${border}`,
                  animation: `fadeUp ${0.4 + i * 0.1}s ease`,
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
                  <div style={{ fontSize: '32px', fontWeight: '800', color }}>{value}</div>
                  <div style={{ fontSize: '13px', color: muted, marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              <div style={{
                background: card, borderRadius: '20px', padding: '24px',
                border: `1px solid ${border}`, animation: 'fadeUp 0.6s ease',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: text, marginBottom: '20px' }}>Status Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: card, border: `1px solid ${border}`, borderRadius: '8px', color: text }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{
                background: card, borderRadius: '20px', padding: '24px',
                border: `1px solid ${border}`, animation: 'fadeUp 0.7s ease',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: text, marginBottom: '20px' }}>Orders by Status</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: muted }} />
                    <YAxis tick={{ fontSize: 11, fill: muted }} />
                    <Tooltip contentStyle={{ background: card, border: `1px solid ${border}`, borderRadius: '8px', color: text }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {barData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Couriers table */}
            <div style={{
              background: card, borderRadius: '20px', padding: '24px',
              border: `1px solid ${border}`, animation: 'fadeUp 0.8s ease',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: text }}>All Couriers</h3>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by ID, sender, receiver..."
                  style={{
                    padding: '10px 16px', borderRadius: '10px',
                    border: `1px solid ${border}`, background: inputBg, color: text,
                    fontSize: '13px', outline: 'none', width: '280px',
                  }}
                />
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      {['Tracking ID', 'Sender', 'Receiver', 'Package', 'Status', 'Agent', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c, i) => (
                      <tr key={c._id} style={{
                        borderBottom: `1px solid ${border}`,
                        animation: `fadeUp ${0.3 + i * 0.03}s ease`,
                      }}>
                        <td style={{ padding: '14px 8px', fontSize: '13px', fontWeight: '600', color: '#6366f1' }}>{c.trackingId}</td>
                        <td style={{ padding: '14px 8px', fontSize: '13px', color: text }}>{c.senderName}</td>
                        <td style={{ padding: '14px 8px', fontSize: '13px', color: text }}>{c.receiverName}</td>
                        <td style={{ padding: '14px 8px', fontSize: '13px', color: muted }}>{c.packageType}</td>
                        <td style={{ padding: '14px 8px' }}><StatusBadge status={c.status} /></td>
                        <td style={{ padding: '14px 8px', fontSize: '13px', color: muted }}>{c.assignedAgent || '—'}</td>
                        <td style={{ padding: '14px 8px' }}>
                          <button onClick={() => openEdit(c)} style={{
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: '#fff', border: 'none', padding: '6px 14px',
                            borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                          }}>Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: muted }}>No couriers found</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
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
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: text, marginBottom: '4px' }}>Update Courier</h3>
            <p style={{ color: muted, fontSize: '13px', marginBottom: '24px' }}>{editModal.trackingId}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: muted, display: 'block', marginBottom: '6px' }}>Status</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${border}`, background: inputBg, color: text, fontSize: '14px', outline: 'none' }}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: muted, display: 'block', marginBottom: '6px' }}>Assigned Agent</label>
                <input
                  value={editForm.assignedAgent}
                  onChange={e => setEditForm({ ...editForm, assignedAgent: e.target.value })}
                  placeholder="Agent name"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${border}`, background: inputBg, color: text, fontSize: '14px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setEditModal(null)} style={{
                flex: 1, padding: '12px', borderRadius: '10px',
                background: darkMode ? '#334155' : '#f1f5f9',
                color: text, border: 'none', cursor: 'pointer', fontWeight: '600',
              }}>Cancel</button>
              <button onClick={saveEdit} disabled={saving} style={{
                flex: 1, padding: '12px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600',
                opacity: saving ? 0.7 : 1,
              }}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
