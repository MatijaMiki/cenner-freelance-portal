
import React, { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;         // px, used for both width and height
  className?: string;
}

/**
 * Avatar — shows the image if available, falls back to a pixel head-and-shoulders
 * placeholder (see the grid below) on error or missing src.
 */
// The placeholder is drawn on a 10 x 10 pixel grid like the logo: a full square tile with a pixel head
// and shoulders, in shades of grey. The shade is picked from the name so a list of people is not one grey.
const SHADES: { tile: string; figure: string }[] = [
  { tile: '#2f343b', figure: '#e2e5ea' },
  { tile: '#454b54', figure: '#e2e5ea' },
  { tile: '#5a616c', figure: '#eef0f3' },
  { tile: '#868d99', figure: '#2a2e34' },
  { tile: '#aab0ba', figure: '#2f343b' },
  { tile: '#c9cdd4', figure: '#454b54' },
];
const FIGURE_PX = [
  { y: 2, from: 4, to: 5 }, { y: 3, from: 3, to: 6 }, { y: 4, from: 3, to: 6 }, { y: 5, from: 4, to: 5 },   // head
  { y: 7, from: 2, to: 7 }, { y: 8, from: 1, to: 8 }, { y: 9, from: 1, to: 8 },                           // shoulders
].flatMap(r => Array.from({ length: r.to - r.from + 1 }, (_, k) => ({ x: r.from + k, y: r.y })));

const shadeFor = (name?: string | null) => {
  let h = 0;
  for (const ch of name || '') h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return SHADES[h % SHADES.length];
};

const Avatar: React.FC<AvatarProps> = ({ src, name, size = 40, className = '' }) => {
  const [error, setError] = useState(false);

  const showPlaceholder = !src || error;

  if (showPlaceholder) {
    const shade = shadeFor(name);
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 10 10"
        shapeRendering="crispEdges"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label={name || 'User avatar'}
      >
        <rect width="10" height="10" fill={shade.tile} />
        {FIGURE_PX.map(p => <rect key={`f${p.x}-${p.y}`} x={p.x} y={p.y} width="1.02" height="1.02" fill={shade.figure} />)}
      </svg>
    );
  }

  return (
    <img
      src={src}
      alt={name || 'User avatar'}
      width={size}
      height={size}
      // square by default: the picture fills its square, cropped rather than stretched
      className={`object-cover ${className}`}
      onError={() => setError(true)}
    />
  );
};

export default Avatar;
