import React from 'react';
import ProjectDots from './ProjectDots';
import { hash } from '../lib/dotColour';

/**
 * Generated blog cover: the live dot animation (components/ProjectDots) on a near-black ground, in a
 * palette picked from the post's slug, so a post without an uploaded image still has a picture
 * of its own that breathes and changes shape. The colours are free of the site palette on purpose.
 */

const GROUND = '#0c1015';

// Each palette runs from the dim end to the bright end; the glows take one colour each.
const PALETTES: string[][] = [
  ['#a8442f', '#d9694f', '#f2977c', '#f2c14e'],                  // coral
  ['#f2c14e', '#7bd389', '#58a6d8', '#c9788a', '#f0894a'],       // rainbow
  ['#1f7a6d', '#3fc1a5', '#a6f0d8', '#58a6d8'],                  // mint
  ['#5b3aa8', '#9a63e6', '#e2a8ff', '#ef4f93'],                  // violet
  ['#a8741c', '#e8a92e', '#ffe08a', '#ef6f6c'],                  // amber
  ['#2461a8', '#4ea0f0', '#b7e0ff', '#3fc1a5'],                  // ice
  ['#a3225f', '#ef4f93', '#ffb3d1', '#f2c14e'],                  // magenta
  ['#f2c14e', '#ef6f6c', '#9a63e6', '#4ea0f0', '#3fc1a5'],       // sunset to sea
];

export const BlogCover: React.FC<{ seed: string; className?: string }> = ({ seed, className = '' }) => {
  const palette = React.useMemo(() => [GROUND, ...PALETTES[hash(seed || 'cenner') % PALETTES.length]], [seed]);
  return <ProjectDots palette={palette} className={className} />;
};

export default BlogCover;
