import React, { useMemo } from 'react';
import { dotGradient } from '../lib/dotColour';

/**
 * Cenner's own picture, drawn in dots: a mandala of concentric rings, every ring a little bigger
 * and brighter than the one inside it, on the near-black ground the blog covers use. Pure SVG.
 */
const GROUND = '#0c1015';

export const DotAvatar: React.FC<{ className?: string; hue?: number }> = ({ className = '', hue = 262 }) => {
  const rings = useMemo(() => {
    const grad = dotGradient('cenner-mandala', GROUND, true, hue);
    const RINGS = 5;
    return Array.from({ length: RINGS }, (_, i) => {
      const k = i + 1, n = 6 * k, rad = k * 8.6, v = 0.35 + 0.65 * (k / RINGS);
      return {
        k, c: grad(v), r: 1.5 + v * 2.1,
        pts: Array.from({ length: n }, (_, j) => { const a = (j / n) * Math.PI * 2 + (k % 2 ? 0 : Math.PI / n); return [50 + Math.cos(a) * rad, 50 + Math.sin(a) * rad] as const; }),
      };
    });
  }, [hue]);
  const core = dotGradient('cenner-mandala', GROUND, true, hue)(1);

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className} style={{ background: GROUND }}>
      <rect width="100" height="100" fill={GROUND} />
      <circle cx="50" cy="50" r="3.4" fill={core} />
      {/* the rings turn slowly, neighbours in opposite directions, each at its own speed */}
      {rings.map(ring => (
        <g key={ring.k}>
          <animateTransform attributeName="transform" type="rotate" from={`0 50 50`} to={`${ring.k % 2 ? 360 : -360} 50 50`} dur={`${60 - ring.k * 6}s`} repeatCount="indefinite" />
          {ring.pts.map(([x, y], i) => <circle key={i} cx={x.toFixed(2)} cy={y.toFixed(2)} r={ring.r.toFixed(2)} fill={ring.c} />)}
        </g>
      ))}
    </svg>
  );
};

export default DotAvatar;
