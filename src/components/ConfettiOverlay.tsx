import React from 'react';

interface ConfettiPiece {
  id: number;
  left: string;
  color: string;
  delay: string;
  size: number;
  rotation: number;
}

const DORA_COLORS = ['#64C8FF', '#168DCE', '#FFD84D', '#F04444', '#FF85B3', '#FFFFFF'];

const CONFETTI_PIECES: ConfettiPiece[] = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 3.6 + 2) % 96}%`,
  color: DORA_COLORS[i % DORA_COLORS.length],
  delay: `${(i % 7) * 60}ms`,
  size: i % 3 === 0 ? 11 : 8,
  rotation: (i * 47) % 360,
}));

export const ConfettiOverlay: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      {CONFETTI_PIECES.map((p) => (
        <span
          key={p.id}
          style={{
            left: p.left,
            top: '-16px',
            width: `${p.size}px`,
            height: `${p.size * 1.4}px`,
            backgroundColor: p.color,
            animationDelay: p.delay,
            transform: `rotate(${p.rotation}deg)`,
          }}
          className="absolute rounded-sm border border-[#183247]/20 opacity-90 animate-bounce duration-700"
        />
      ))}
    </div>
  );
};
