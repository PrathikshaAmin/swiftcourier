import { useEffect, useState } from 'react';

const STEPS = [
  { key: 'Pending',          icon: '📦', label: 'Booked',           sub: 'Order placed' },
  { key: 'Shipped',          icon: '🚚', label: 'Shipped',          sub: 'In transit' },
  { key: 'Out for Delivery', icon: '🛵', label: 'Out for Delivery', sub: 'On the way' },
  { key: 'Delivered',        icon: '✅', label: 'Delivered',        sub: 'Completed' },
];

export default function TrackingProgress({ status, dark }) {
  const [animated, setAnimated] = useState(false);
  const currentIdx = STEPS.findIndex(s => s.key === status);
  const pct = currentIdx < 0 ? 0 : (currentIdx / (STEPS.length - 1)) * 100;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, [status]);

  const bdr = dark ? '#334155' : '#e2e8f0';
  const muted = dark ? '#64748b' : '#94a3b8';
  const activeTxt = dark ? '#a5b4fc' : '#4f46e5';

  return (
    <div style={{ padding: '8px 0 24px' }}>
      {/* Bar */}
      <div style={{ position: 'relative', margin: '0 0 36px' }}>
        <div style={{ height: 6, background: dark ? '#1e293b' : '#e2e8f0', borderRadius: 3 }}>
          <div style={{
            height: '100%',
            width: animated ? `${pct}%` : '0%',
            background: 'linear-gradient(90deg,#4f46e5,#7c3aed)',
            borderRadius: 3,
            transition: 'width 1.1s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>

        {/* Dots */}
        <div style={{
          position: 'absolute', top: -9, left: 0, right: 0,
          display: 'flex', justifyContent: 'space-between',
        }}>
          {STEPS.map((s, i) => {
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <div key={s.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: done ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : (dark ? '#1e293b' : '#fff'),
                  border: done ? 'none' : `2px solid ${bdr}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: '#fff', fontWeight: 800,
                  transition: 'all 0.5s ease',
                  transitionDelay: `${i * 0.15}s`,
                  transform: animated && active ? 'scale(1.25)' : 'scale(1)',
                  boxShadow: active ? '0 0 0 4px rgba(79,70,229,0.2)' : 'none',
                }}>
                  {done ? '✓' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {STEPS.map((s, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          return (
            <div key={s.key} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{
                fontSize: 12, fontWeight: active ? 700 : 500,
                color: done ? activeTxt : muted,
              }}>{s.label}</div>
              <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{s.sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
