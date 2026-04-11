import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const STEPS = ['Pending', 'Shipped', 'Out for Delivery', 'Delivered'];
const STEP_ICONS = ['📦', '🚚', '🛵', '✅'];
const STEP_LABELS = ['Order Placed', 'In Transit', 'Out for Delivery', 'Delivered'];

// Fake city waypoints for simulation
const WAYPOINTS = [
  { label: 'Warehouse', x: 10, y: 50 },
  { label: 'Sorting Hub', x: 30, y: 25 },
  { label: 'City Hub', x: 55, y: 60 },
  { label: 'Local Office', x: 75, y: 30 },
  { label: 'Destination', x: 92, y: 55 },
];

export default function TrackCourier() {
  const { darkMode } = useAuth();
  const [trackingId, setTrackingId] = useState('');
  const [courier, setCourier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dotPos, setDotPos] = useState(0);
  const intervalRef = useRef(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setLoading(true);
    setCourier(null);
    clearInterval(intervalRef.current);
    try {
      const { data } = await api.get(`/courier/track/${trackingId.trim().toUpperCase()}`);
      setCourier(data);
      startSimulation(data.status);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Tracking ID not found');
    } finally {
      setLoading(false);
    }
  };

  const startSimulation = (status) => {
    const stepIdx = STEPS.indexOf(status);
    const maxWp = Math.min(stepIdx + 1, WAYPOINTS.length - 1);
    setDotPos(0);
    let i = 0;
    intervalRef.current = setInterval(() => {
      i = (i + 1) % (maxWp + 1);
      setDotPos(i);
    }, 1800);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const stepIndex = courier ? STEPS.indexOf(courier.status) : -1;
  const progressPct = stepIndex === -1 ? 0 : (stepIndex / (STEPS.length - 1)) * 100;

  const bg = darkMode ? '#0f172a' : '#f1f5f9';
  const card = darkMode ? '#1e293b' : '#ffffff';
  const border = darkMode ? '#334155' : '#e2e8f0';
  const text = darkMode ? '#f1f5f9' : '#0f172a';
  const muted = darkMode ? '#94a3b8' : '#64748b';
  const inputBg = darkMode ? '#0f172a' : '#f8fafc';
  const mapBg = darkMode ? '#0f172a' : '#eef2ff';

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '40px 24px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeUp 0.4s ease' }}>
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>🔍</div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: text }}>Track Your Shipment</h1>
          <p style={{ color: muted, marginTop: '8px', fontSize: '16px' }}>
            Enter your tracking ID to get live status updates
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '12px', marginBottom: '40px', animation: 'fadeUp 0.5s ease' }}>
          <input
            value={trackingId}
            onChange={e => setTrackingId(e.target.value)}
            placeholder="e.g. TRK123456789"
            style={{
              flex: 1, padding: '16px 20px', borderRadius: '12px',
              border: `1.5px solid ${border}`, background: inputBg, color: text,
              fontSize: '16px', outline: 'none', fontFamily: 'Inter, sans-serif',
            }}
          />
          <button type="submit" disabled={loading} style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: '#fff', border: 'none', padding: '16px 32px',
            borderRadius: '12px', fontSize: '16px', fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? '...' : 'Track →'}
          </button>
        </form>

        {courier && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeUp 0.4s ease' }}>

            {/* Header card */}
            <div style={{ background: card, borderRadius: '16px', padding: '24px', border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Tracking ID</p>
                  <p style={{ fontSize: '24px', fontWeight: '800', color: '#4f46e5', letterSpacing: '1px' }}>{courier.trackingId}</p>
                </div>
                <StatusBadge status={courier.status} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
                {[
                  { label: 'From', value: courier.senderName, icon: '👤' },
                  { label: 'To', value: courier.receiverName, icon: '👤' },
                  { label: 'Pickup', value: courier.pickupAddress, icon: '📍' },
                  { label: 'Delivery', value: courier.deliveryAddress, icon: '🏠' },
                  { label: 'Package', value: courier.packageType, icon: '📦' },
                  { label: 'Agent', value: courier.assignedAgent || 'Not assigned', icon: '🚴' },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '10px', padding: '12px' }}>
                    <p style={{ fontSize: '11px', color: muted, marginBottom: '3px' }}>{icon} {label}</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: text }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress steps */}
            <div style={{ background: card, borderRadius: '16px', padding: '28px', border: `1px solid ${border}` }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: text, marginBottom: '28px' }}>Shipment Progress</h3>

              {/* Bar */}
              <div style={{ position: 'relative', marginBottom: '36px' }}>
                <div style={{ height: '6px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '3px' }}>
                  <div style={{
                    height: '100%', width: `${progressPct}%`,
                    background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                    borderRadius: '3px', transition: 'width 1s ease',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', top: '-10px', width: '100%' }}>
                  {STEPS.map((step, i) => {
                    const done = i <= stepIndex;
                    return (
                      <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%',
                          background: done ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : (darkMode ? '#334155' : '#e2e8f0'),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', color: done ? '#fff' : muted,
                          boxShadow: done ? '0 0 0 4px rgba(79,70,229,0.2)' : 'none',
                          transition: 'all 0.5s ease',
                        }}>
                          {done ? '✓' : i + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {STEPS.map((step, i) => {
                  const done = i <= stepIndex;
                  return (
                    <div key={step} style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: '22px', marginBottom: '4px' }}>{STEP_ICONS[i]}</div>
                      <div style={{ fontSize: '11px', fontWeight: done ? '700' : '400', color: done ? '#4f46e5' : muted }}>
                        {STEP_LABELS[i]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline */}
            <div style={{ background: card, borderRadius: '16px', padding: '28px', border: `1px solid ${border}` }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: text, marginBottom: '24px' }}>Tracking Timeline</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {STEPS.map((step, i) => {
                  const done = i <= stepIndex;
                  const isLast = i === STEPS.length - 1;
                  return (
                    <div key={step} style={{ display: 'flex', gap: '16px' }}>
                      {/* Line + dot */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: done ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : (darkMode ? '#334155' : '#f1f5f9'),
                          border: done ? 'none' : `2px solid ${border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '16px',
                        }}>
                          {done ? <span style={{ color: '#fff', fontSize: '14px' }}>✓</span> : <span style={{ opacity: 0.4 }}>{STEP_ICONS[i]}</span>}
                        </div>
                        {!isLast && (
                          <div style={{ width: 2, flex: 1, minHeight: 32, background: done && i < stepIndex ? '#4f46e5' : (darkMode ? '#334155' : '#e2e8f0'), margin: '4px 0' }} />
                        )}
                      </div>
                      {/* Content */}
                      <div style={{ paddingBottom: isLast ? 0 : '20px', paddingTop: '6px' }}>
                        <p style={{ fontSize: '14px', fontWeight: done ? '700' : '500', color: done ? text : muted }}>{STEP_ICONS[i]} {step}</p>
                        <p style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>
                          {done ? (i === stepIndex ? 'Current status' : 'Completed') : 'Pending'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fake live tracking map */}
            <div style={{ background: card, borderRadius: '16px', padding: '28px', border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: text }}>Live Tracking Simulation</h3>
                <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                  LIVE
                </span>
              </div>

              {/* SVG map */}
              <div style={{ background: mapBg, borderRadius: '12px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
                <svg viewBox="0 0 100 80" style={{ width: '100%', height: '180px' }}>
                  {/* Road lines */}
                  {WAYPOINTS.slice(0, -1).map((wp, i) => (
                    <line key={i}
                      x1={wp.x} y1={wp.y}
                      x2={WAYPOINTS[i + 1].x} y2={WAYPOINTS[i + 1].y}
                      stroke={darkMode ? '#334155' : '#c7d2fe'} strokeWidth="1.5" strokeDasharray="2,2"
                    />
                  ))}
                  {/* Waypoint dots */}
                  {WAYPOINTS.map((wp, i) => (
                    <g key={i}>
                      <circle cx={wp.x} cy={wp.y} r="2.5" fill={darkMode ? '#475569' : '#a5b4fc'} />
                      <text x={wp.x} y={wp.y - 4} textAnchor="middle" fontSize="3.5" fill={muted}>{wp.label}</text>
                    </g>
                  ))}
                  {/* Moving courier dot */}
                  {WAYPOINTS[dotPos] && (
                    <g>
                      <circle cx={WAYPOINTS[dotPos].x} cy={WAYPOINTS[dotPos].y} r="5" fill="#4f46e5" opacity="0.3" />
                      <circle cx={WAYPOINTS[dotPos].x} cy={WAYPOINTS[dotPos].y} r="3" fill="#4f46e5" />
                      <text x={WAYPOINTS[dotPos].x} y={WAYPOINTS[dotPos].y - 7} textAnchor="middle" fontSize="4">🚚</text>
                    </g>
                  )}
                </svg>
                <p style={{ textAlign: 'center', fontSize: '12px', color: muted, marginTop: '8px' }}>
                  📍 Currently at: <strong style={{ color: text }}>{WAYPOINTS[dotPos]?.label}</strong>
                </p>
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: '12px', color: muted }}>
              Last updated: {new Date(courier.updatedAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
      `}</style>
    </div>
  );
}
