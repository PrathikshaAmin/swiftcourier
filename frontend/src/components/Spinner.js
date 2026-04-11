
export default function Spinner({ size = 36, color = '#4f46e5' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
      <div style={{
        width: size, height: size,
        border: `3px solid #e2e8f0`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  );
}
