export function Background() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        className="absolute rounded-full"
        style={{ width: 320, height: 320, background: '#1a4fc4', filter: 'blur(60px)', opacity: 0.35, top: -80, left: -60 }}
      />
      <div
        className="absolute rounded-full"
        style={{ width: 250, height: 250, background: '#0f3a8a', filter: 'blur(60px)', opacity: 0.35, bottom: -40, right: 60 }}
      />
      <div
        className="absolute rounded-full"
        style={{ width: 180, height: 180, background: '#2563eb', filter: 'blur(60px)', opacity: 0.35, top: '50%', left: '60%', transform: 'translate(-50%, -50%)' }}
      />
    </div>
  );
}
