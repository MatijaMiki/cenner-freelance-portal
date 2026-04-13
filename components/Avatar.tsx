
import React, { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;         // px, used for both width and height
  className?: string;
}

/**
 * Avatar — shows the image if available, falls back to a classic
 * head-and-shoulders silhouette placeholder on error or missing src.
 */
const Avatar: React.FC<AvatarProps> = ({ src, name, size = 40, className = '' }) => {
  const [error, setError] = useState(false);

  const showPlaceholder = !src || error;

  if (showPlaceholder) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label={name || 'User avatar'}
      >
        {/* Background circle */}
        <circle cx="20" cy="20" r="20" fill="#1e1e1e" />
        {/* Head */}
        <circle cx="20" cy="15" r="7" fill="#2a4a35" />
        {/* Shoulders / body */}
        <path
          d="M6 36 C6 27 34 27 34 36"
          fill="#2a4a35"
        />
        {/* Subtle green ring */}
        <circle cx="20" cy="20" r="19" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.4" fill="none" />
      </svg>
    );
  }

  return (
    <img
      src={src}
      alt={name || 'User avatar'}
      width={size}
      height={size}
      className={className}
      onError={() => setError(true)}
    />
  );
};

export default Avatar;
