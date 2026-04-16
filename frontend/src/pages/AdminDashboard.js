import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];

export default function AdminDashboard() {
  const { darkMode } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courier/stats').then(({ data: raw }) => {
      setStats({
        total:          raw.total,
        delivered:      raw.delivered,
        pending:        raw.orderPlaced,
        outForDelivery: raw.outForDelivery,
        shipped:        raw.inTransit,
        packaging:      raw.packaging,
        reachedDepot:   raw.reachedDepot,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const dark   = darkMode;
  const card   = dark ? '#1e293b' : '#ffffff';
  const border = dark ? '#334155' : '#e2e8f0';
  const text   = dark ? '#e2e8f0' : '#1e293b';
  const muted  = dark ? '#94a3b8' : '#64748b';

  const statCards = stats ? [
    { label: 'Total Orders',     value: stats.total,          icon: '📦', color: '#4f46e5' },
    { label: 'Delivered',        value: stats.delivered,      icon: '✅', color: '#10b981' },
    { label: 'Pending',          value: stats.pending,        icon: '⏳', color: '#f59e0b' },
    { label: 'Out for Delivery', value: stats.outForDelivery, icon: '🛵', color: '#8b5cf6' },
  ] : [];

  const pieData = stats ? [
    { name: 'Order Placed',      value: stats.pending        },
    { name: 'In Transit',        value: stats.shipped        },
    { name: 'Out for Delivery',  value: stats.outForDelivery },
    { name: 'Delivered',         value: stats.delivered      },
  ] : [];

  const barData = stats ? [
    { name: 'Order Placed',     count: stats.pending        },
    { name: 'Packaging',        count: stats.packaging || 0 },
    { name: 'In Transit',       count: stats.shipped        },
    { name: 'Reached Depot',    count: stats.reachedDepot || 0 },
    { name: 'Out for Delivery', count: stats.outForDelivery },
    { name: 'Delivered',        count: stats.delivered      },
  ] : [];

  const ttStyle = { background: card, border: `1px solid ${border}`, borderRadius: 8, color: text, fontSize: 13 };

  return (
    <div className="sc-page" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28, animation: 'fadeUp 0.35s ease' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: text }}>Overview</h1>
        <p style={{ color: muted, marginTop: 4, fontSize: 14 }}>Courier operations at a glance</p>
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }} className="sc-grid-4">
            {statCards.map(({ label, value, icon, color }, i) => (
              <div
                key={label}
                className="sc-stat"
                style={{ animation: `fadeUp ${0.3 + i * 0.07}s ease`, cursor: 'pointer' }}
                onClick={() => navigate('/admin/orders')}
              >
                <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontSize: 30, fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: 13, color: muted, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }} className="sc-grid-2">
            <div className="sc-card" style={{ padding: 24, animation: 'fadeUp 0.45s ease' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: text, marginBottom: 20 }}>Status Distribution</h3>
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={ttStyle} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="sc-card" style={{ padding: 24, animation: 'fadeUp 0.5s ease' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: text, marginBottom: 20 }}>Orders by Stage</h3>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={barData} barSize={22}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: muted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={ttStyle} cursor={{ fill: dark ? '#1e293b' : '#f1f5f9' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {barData.map((_, i) => <Cell key={i} fill={['#6366f1','#f59e0b','#3b82f6','#ec4899','#8b5cf6','#10b981'][i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick link to orders */}
          <div className="sc-card" style={{ padding: 24, animation: 'fadeUp 0.55s ease', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: text, marginBottom: 4 }}>Manage All Orders</h3>
              <p style={{ fontSize: 13, color: muted }}>View, filter by stage, update status and verify OTP deliveries</p>
            </div>
            <button
              className="sc-btn"
              onClick={() => navigate('/admin/orders')}
              style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', padding: '11px 24px', fontSize: 14 }}
            >
              View All Orders →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
