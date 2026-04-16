import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const STEPS = [
  { key: 'Order Placed', icon: '📦', label: 'Order Placed' },
  { key: 'Packaging',    icon: '🗃️',  label: 'Packaging'   },
  { key: 'In Transit',   icon: '🚚',  label: 'In Transit'  },
  { key: 'Reached Depot',icon: '🏭',  label: 'Reached Depot'},
  { key: 'Out for Delivery', icon: '🛵', label: 'Out for Delivery' },
  { key: 'Delivered',    icon: '✅',  label: 'Delivered'   },
];

const WAYPOINTS = [
  { label: 'Warehouse',    x: 8,  y: 50 },
  { label: 'Sorting Hub',  x: 26, y: 22 },
  { label: 'City Hub',     x: 50, y: 58 },
  { label: 'Local Office', x: 74, y: 28 },
  { label: 'Destination',  x: 92, y: 52 },
];

export default function TrackCourier() {
  const { darkMode, user } = useAuth();
  const { id: urlId } = useParams();

  const [trackingId, setTrackingId] = useState(urlId || '');
  const [courier, setCourier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dotPos, setDotPos] = useState(0);
  const intervalRef = useRef(null);

  const bg     = darkMode ? '#0f172a' : '#f1f5f9';
  const card   = darkMode ? '#1e293b' : '#ffffff';
  const border = darkMode ? '#334155' : '#e2e8f0';
  const text   = darkMode ? '#f1f5f9' : '#0f172a';
  const muted  = darkMode ? '#94a3b8' : '#64748b';
  const inputBg = darkMode ? '#0f172a' : '#f8fafc';
  const mapBg  = darkMode ? '#0f172a' : '#eef2ff';

  const doTrack = async (id) => {
    const tid = (id || trackingId).trim().toUpperCase();
    if (!tid) return;
    setLoading(true);
    setCourier(null);
    clearInterval(intervalRef.current);
    try {
      // Use authenticated endpoint if logged in (includes OTP for owner/admin)
      const endpoint = user
        ? `/courier/track-auth/${tid}`
        : `/courier/track/${tid}`;
      const { data } = await api.get(endpoint);
      setCourier(data);
      startSimulation(data.status);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Tracking ID not found');
    } finally {
      setLoading(false);
    }
  };

  // Auto-load when navigated with a tracking ID in URL
  useEffect(() => {
    if (urlId) doTrack(urlId);
  }, [urlId]); // eslint-disable-line

  const handleTrack = (e) => { e.preventDefault(); doTrack(); };

  const startSimulation = (status) => {
    const stepIdx = STEPS.findIndex(s => s.key === status);
    // Map 6 steps to 5 waypoints
    const targetWp = Math.round((stepIdx / (STEPS.length - 1)) * (WAYPOINTS.length - 1));
    setDotPos(0);
    let i = 0;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (i < targetWp) {
        i += 1;
        setDotPos(i);
      } else {
        clearInterval(intervalRef.current); // stop at current position
      }
    }, 900);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const stepIndex = courier ? STEPS.findIndex(s => s.key === courier.status) : -1;
  const progressPct = stepIndex <= 0 ? 0 : (stepIndex / (STEPS.length - 1)) * 100;

  const expectedDelivery = courier
    ? new Date(new Date(courier.createdAt).getTime() + 10 * 24 * 60 * 60 * 1000)
    : null;

  return (
    <div className="sc-page">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '36px', animation: 'fadeUp 0.4s ease' }}>
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>🔍</div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: text }}>Track Your Shipment</h1>
          <p style={{ color: muted, marginTop: '8px', fontSize: '15px' }}>
            Enter your tracking ID to get live status updates
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '12px', marginBottom: '36px', animation: 'fadeUp 0.5s ease' }}>
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
            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
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

            {/* ── Header card ── */}
            <div style={{ background: card, borderRadius: '16px', padding: '24px', border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Tracking ID</p>
                  <p style={{ fontSize: '24px', fontWeight: '800', color: '#4f46e5', letterSpacing: '1px' }}>{courier.trackingId}</p>
                  {/* Expected delivery */}
                  <p style={{ fontSize: '13px', color: muted, marginTop: '6px' }}>
                    📅 Expected delivery:{' '}
                    <span style={{ fontWeight: '700', color: courier.status === 'Delivered' ? '#16a34a' : '#f59e0b' }}>
                      {courier.status === 'Delivered'
                        ? 'Delivered ✅'
                        : expectedDelivery?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      }
                    </span>
                  </p>
                </div>
                <StatusBadge status={courier.status} />
              </div>

              {/* Details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { label: 'Sender',   value: courier.senderName,      icon: '👤' },
                  { label: 'Receiver', value: courier.receiverName,     icon: '👤' },
                  { label: 'Pickup',   value: courier.pickupAddress,    icon: '📍' },
                  { label: 'Delivery', value: courier.deliveryAddress,  icon: '🏠' },
                  { label: 'Package',  value: courier.packageType,      icon: '📦' },
                  { label: 'Payment',  value: courier.paymentStatus === 'Paid' ? '✅ Paid Online' : '💵 Cash on Delivery', icon: '💳' },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '10px', padding: '12px' }}>
                    <p style={{ fontSize: '11px', color: muted, marginBottom: '3px' }}>{icon} {label}</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: text }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Agent & OTP card ── */}
            <div style={{ background: card, borderRadius: '16px', padding: '24px', border: `1px solid ${border}` }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: text, marginBottom: '16px' }}>🚴 Delivery Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Assigned Agent */}
                <div style={{
                  background: darkMode ? '#0f172a' : '#f8fafc',
                  borderRadius: '12px', padding: '16px',
                  border: `1px solid ${border}`,
                }}>
                  <p style={{ fontSize: '11px', color: muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Assigned Agent</p>
                  {courier.assignedAgent ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: '800', fontSize: '14px', flexShrink: 0,
                      }}>{courier.assignedAgent[0].toUpperCase()}</div>
                      <p style={{ fontWeight: '700', fontSize: '15px', color: text }}>{courier.assignedAgent}</p>
                    </div>
                  ) : (
                    <p style={{ fontSize: '13px', color: muted, fontStyle: 'italic' }}>Not yet assigned</p>
                  )}
                </div>

                {/* OTP */}
                <div style={{
                  background: darkMode ? '#0f172a' : '#f8fafc',
                  borderRadius: '12px', padding: '16px',
                  border: `1px solid ${border}`,
                }}>
                  <p style={{ fontSize: '11px', color: muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Delivery OTP</p>
                  {courier.otp ? (
                    <div>
                      <p style={{ fontSize: '24px', fontWeight: '800', color: '#7c3aed', letterSpacing: '6px' }}>{courier.otp}</p>
                      <p style={{ fontSize: '11px', color: muted, marginTop: '4px' }}>Share only with delivery agent</p>
                    </div>
                  ) : courier.otpVerified ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '18px' }}>✅</span>
                      <p style={{ fontSize: '13px', color: '#16a34a', fontWeight: '600' }}>OTP verified — Delivered</p>
                    </div>
                  ) : (
                    <p style={{ fontSize: '13px', color: muted, fontStyle: 'italic' }}>Sign in to view OTP</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Progress bar ── */}
            <div style={{ background: card, borderRadius: '16px', padding: '28px', border: `1px solid ${border}` }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: text, marginBottom: '32px' }}>Shipment Progress</h3>

              <div style={{ position: 'relative', marginBottom: '40px' }}>
                {/* Track */}
                <div style={{ height: '6px', background: darkMode ? '#334155' : '#e2e8f0', borderRadius: '3px' }}>
                  <div style={{
                    height: '100%', width: `${progressPct}%`,
                    background: 'linear-gradient(90deg,#4f46e5,#7c3aed)',
                    borderRadius: '3px', transition: 'width 1s ease',
                  }} />
                </div>
                {/* Step dots */}
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', top: '-11px', width: '100%' }}>
                  {STEPS.map((step, i) => {
                    const done = i <= stepIndex;
                    return (
                      <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: done ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : (darkMode ? '#334155' : '#e2e8f0'),
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
                    <div key={step.key} style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontSize: '18px', marginBottom: '4px' }}>{step.icon}</div>
                      <div style={{ fontSize: '10px', fontWeight: done ? '700' : '400', color: done ? '#4f46e5' : muted, lineHeight: '1.3' }}>
                        {step.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Timeline ── */}
            <div style={{ background: card, borderRadius: '16px', padding: '28px', border: `1px solid ${border}` }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: text, marginBottom: '24px' }}>Tracking Timeline</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {STEPS.map((step, i) => {
                  const done = i <= stepIndex;
                  const isCurrent = i === stepIndex;
                  const isLast = i === STEPS.length - 1;
                  // Find timestamp from statusHistory if available
                  const histEntry = courier.statusHistory?.find(h => h.status === step.key);
                  return (
                    <div key={step.key} style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: done ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : (darkMode ? '#334155' : '#f1f5f9'),
                          border: done ? 'none' : `2px solid ${border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '16px',
                        }}>
                          {done
                            ? <span style={{ color: '#fff', fontSize: '14px' }}>✓</span>
                            : <span style={{ opacity: 0.4 }}>{step.icon}</span>
                          }
                        </div>
                        {!isLast && (
                          <div style={{
                            width: 2, flex: 1, minHeight: 32,
                            background: done && i < stepIndex ? '#4f46e5' : (darkMode ? '#334155' : '#e2e8f0'),
                            margin: '4px 0',
                          }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: isLast ? 0 : '20px', paddingTop: '6px' }}>
                        <p style={{ fontSize: '14px', fontWeight: done ? '700' : '500', color: done ? text : muted }}>
                          {step.icon} {step.label}
                          {isCurrent && (
                            <span style={{ marginLeft: '8px', fontSize: '11px', background: '#4f46e5', color: '#fff', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>
                              Current
                            </span>
                          )}
                        </p>
                        <p style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>
                          {histEntry
                            ? new Date(histEntry.timestamp).toLocaleString()
                            : done ? 'Completed' : 'Pending'
                          }
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Live map simulation ── */}
            <div style={{ background: card, borderRadius: '16px', padding: '28px', border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: text }}>Live Tracking Simulation</h3>
                <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                  LIVE
                </span>
              </div>
              <div style={{ background: mapBg, borderRadius: '12px', padding: '16px' }}>
                <svg viewBox="0 0 100 80" style={{ width: '100%', height: '180px' }}>
                  {WAYPOINTS.slice(0, -1).map((wp, i) => (
                    <line key={i}
                      x1={wp.x} y1={wp.y} x2={WAYPOINTS[i + 1].x} y2={WAYPOINTS[i + 1].y}
                      stroke={darkMode ? '#334155' : '#c7d2fe'} strokeWidth="1.5" strokeDasharray="2,2"
                    />
                  ))}
                  {WAYPOINTS.map((wp, i) => (
                    <g key={i}>
                      <circle cx={wp.x} cy={wp.y} r="2.5" fill={darkMode ? '#475569' : '#a5b4fc'} />
                      <text x={wp.x} y={wp.y - 4} textAnchor="middle" fontSize="3.5" fill={muted}>{wp.label}</text>
                    </g>
                  ))}
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
    </div>
  );
}
