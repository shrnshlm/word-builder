import { useEffect, useState } from 'react';
import { CONFETTI_COLORS } from '../utils/constants';

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export default function Confetti({ trigger }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const newPieces = Array.from({ length: 60 }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      duration: randomBetween(1.5, 3.5),
      delay: Math.random() * 0.5,
      size: randomBetween(8, 18),
      isCircle: Math.random() > 0.5,
    }));

    setPieces(newPieces);
    const timer = setTimeout(() => setPieces([]), 4000);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (pieces.length === 0) return null;

  return (
    <div className="confetti-container">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}vw`,
            background: p.color,
            width: p.size,
            height: p.size,
            borderRadius: p.isCircle ? '50%' : '3px',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
