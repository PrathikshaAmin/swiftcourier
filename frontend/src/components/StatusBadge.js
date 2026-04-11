const map = {
  'Order Placed':     { bg: '#eef2ff', color: '#3730a3', dot: '#6366f1' },
  'Packaging':        { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  'In Transit':       { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  'Reached Depot':    { bg: '#fce7f3', color: '#9d174d', dot: '#ec4899' },
  'Out for Delivery': { bg: '#ede9fe', color: '#5b21b6', dot: '#8b5cf6' },
  'Delivered':        { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
};

export default function StatusBadge({ status }) {
  const c = map[status] || { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: '4px 12px', borderRadius: '20px',
      fontSize: '12px', fontWeight: '700',
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
      {status}
    </span>
  );
}
