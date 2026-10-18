import React from 'react';

/**
 * The homepage motif: the screen of the CRT monitor that stands in the meadow film.
 * A picture tube is a rounded rectangle whose four edges bow slightly outwards; that
 * one shape masks the hero film, every picture, the selector screen and the band
 * between the page's two halves.
 *
 * The outline is built in pixels from the element's own size (ResizeObserver), so the
 * corners stay round at any aspect ratio instead of stretching like a percentage
 * radius. Before the first measurement a CSS radius stands in.
 */

export function tubePath(w: number, h: number, round = 0.12, bow = 0.022): string {
  const m = Math.min(w, h);
  const r = Math.min(m * round, m / 2);
  const b = m * bow;
  return [
    `M${r},${b}`,
    `Q${w / 2},${-b} ${w - r},${b}`,
    `Q${w - b},${b} ${w - b},${r}`,
    `Q${w + b},${h / 2} ${w - b},${h - r}`,
    `Q${w - b},${h - b} ${w - r},${h - b}`,
    `Q${w / 2},${h + b} ${r},${h - b}`,
    `Q${b},${h - b} ${b},${h - r}`,
    `Q${-b},${h / 2} ${b},${r}`,
    `Q${b},${b} ${r},${b}`,
    'Z',
  ].join(' ');
}

type TubeProps<T extends React.ElementType> = {
  as?: T;
  /** Corner size as a share of the shorter side. */
  round?: number;
  /** How far each edge bows outwards, as a share of the shorter side. */
  bow?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className' | 'style' | 'children'>;

export function Tube<T extends React.ElementType = 'div'>({
  as, round = 0.12, bow = 0.022, className = '', style, children, ...rest
}: TubeProps<T>) {
  const Comp = (as || 'div') as React.ElementType;
  const ref = React.useRef<HTMLElement>(null);
  const [clip, setClip] = React.useState<string | null>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width && height) setClip(`path('${tubePath(width, height, round, bow)}')`);
    };
    apply();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [round, bow]);

  return (
    <Comp
      ref={ref}
      className={className}
      style={{ ...style, clipPath: clip ?? undefined, borderRadius: clip ? undefined : `${round * 100}%` }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** The motif at text size: the bullet beside list items. */
export const TubeDot: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 14 11" aria-hidden="true" className={`inline-block h-[0.62em] w-[0.8em] shrink-0 ${className}`}>
    <path d={tubePath(14, 11, 0.3, 0.06)} fill="currentColor" />
  </svg>
);

export default Tube;
