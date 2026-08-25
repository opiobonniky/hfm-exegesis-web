export function ConfettiOverlay() {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-6xl animate-bounce">🎉</div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-5%`,
              backgroundColor: ["#f43f5e", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"][i % 5],
              animation: `confetti-fall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.5}s forwards`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes confetti-fall {
          to { top: 110%; transform: rotate(${720}deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
