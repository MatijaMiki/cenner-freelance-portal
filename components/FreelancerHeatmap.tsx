import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Globe2, Maximize2, X } from 'lucide-react';
import { ServiceListing } from '../types';
import { useT } from '../i18n';
import { useAuth } from '../contexts/AuthContext';

// City → [lat, lng]. Free-text locations are matched by lowercased substring.
// City-level only — no exact addresses are ever resolved or rendered.
const CITY_COORDS: Record<string, [number, number]> = {
  // Croatia (primary market)
  zagreb: [45.81, 15.98],
  split: [43.51, 16.44],
  rijeka: [45.33, 14.44],
  osijek: [45.55, 18.69],
  zadar: [44.12, 15.23],
  pula: [44.87, 13.85],
  dubrovnik: [42.65, 18.09],
  varaždin: [46.31, 16.34],
  varazdin: [46.31, 16.34],
  // Western Balkans
  ljubljana: [46.05, 14.51],
  belgrade: [44.79, 20.45],
  beograd: [44.79, 20.45],
  sarajevo: [43.85, 18.36],
  skopje: [41.99, 21.43],
  podgorica: [42.44, 19.26],
  // Central + Western Europe
  vienna: [48.21, 16.37],
  wien: [48.21, 16.37],
  budapest: [47.5, 19.04],
  prague: [50.08, 14.44],
  praha: [50.08, 14.44],
  warsaw: [52.23, 21.01],
  warszawa: [52.23, 21.01],
  berlin: [52.52, 13.41],
  munich: [48.14, 11.58],
  hamburg: [53.55, 9.99],
  amsterdam: [52.37, 4.9],
  brussels: [50.85, 4.35],
  paris: [48.86, 2.35],
  london: [51.51, -0.13],
  manchester: [53.48, -2.24],
  dublin: [53.35, -6.26],
  madrid: [40.42, -3.7],
  barcelona: [41.39, 2.17],
  lisbon: [38.72, -9.14],
  rome: [41.9, 12.5],
  milan: [45.46, 9.19],
  zurich: [47.38, 8.54],
  geneva: [46.2, 6.14],
  copenhagen: [55.68, 12.57],
  stockholm: [59.33, 18.07],
  oslo: [59.91, 10.75],
  helsinki: [60.17, 24.94],
  athens: [37.98, 23.73],
  istanbul: [41.01, 28.98],
  bucharest: [44.43, 26.1],
  sofia: [42.7, 23.32],
  // Middle East
  'tel aviv': [32.08, 34.78],
  dubai: [25.2, 55.27],
  // Americas
  'new york': [40.71, -74.01],
  nyc: [40.71, -74.01],
  'los angeles': [34.05, -118.24],
  'san francisco': [37.77, -122.42],
  toronto: [43.65, -79.38],
  vancouver: [49.28, -123.12],
  miami: [25.76, -80.19],
  chicago: [41.88, -87.63],
  austin: [30.27, -97.74],
  'são paulo': [-23.55, -46.63],
  'sao paulo': [-23.55, -46.63],
  'buenos aires': [-34.6, -58.38],
  'mexico city': [19.43, -99.13],
  // Asia / Oceania
  tokyo: [35.68, 139.69],
  seoul: [37.57, 126.98],
  beijing: [39.9, 116.4],
  shanghai: [31.23, 121.47],
  'hong kong': [22.32, 114.17],
  singapore: [1.35, 103.82],
  bangkok: [13.76, 100.5],
  bangalore: [12.97, 77.59],
  mumbai: [19.08, 72.88],
  delhi: [28.61, 77.21],
  sydney: [-33.87, 151.21],
  melbourne: [-37.81, 144.96],
  // Africa
  cairo: [30.04, 31.24],
  lagos: [6.52, 3.38],
  nairobi: [-1.29, 36.82],
  'cape town': [-33.92, 18.42],
  johannesburg: [-26.2, 28.05],
};

// Browser locale code → fallback city when no profile location is set.
const LOCALE_TO_CITY: Record<string, string> = {
  hr: 'zagreb', 'hr-hr': 'zagreb',
  sl: 'ljubljana', 'sl-si': 'ljubljana',
  sr: 'belgrade', 'sr-rs': 'belgrade',
  bs: 'sarajevo', 'bs-ba': 'sarajevo',
  de: 'berlin', 'de-de': 'berlin', 'de-at': 'vienna', 'de-ch': 'zurich',
  fr: 'paris', 'fr-fr': 'paris',
  es: 'madrid', 'es-es': 'madrid',
  it: 'rome', 'it-it': 'rome',
  pt: 'lisbon', 'pt-pt': 'lisbon', 'pt-br': 'sao paulo',
  nl: 'amsterdam', 'nl-nl': 'amsterdam',
  pl: 'warsaw',
  cs: 'prague',
  hu: 'budapest',
  ro: 'bucharest',
  bg: 'sofia',
  el: 'athens',
  tr: 'istanbul',
  sv: 'stockholm',
  da: 'copenhagen',
  no: 'oslo', nb: 'oslo',
  fi: 'helsinki',
  ja: 'tokyo', 'ja-jp': 'tokyo',
  ko: 'seoul', 'ko-kr': 'seoul',
  zh: 'shanghai', 'zh-cn': 'shanghai', 'zh-hk': 'hong kong',
  th: 'bangkok',
  hi: 'mumbai', 'hi-in': 'mumbai',
  ar: 'dubai',
  he: 'tel aviv',
  'en-gb': 'london', 'en-ie': 'dublin', 'en-au': 'sydney', 'en-nz': 'sydney',
  'en-us': 'new york', 'en-ca': 'toronto', en: 'new york',
};

// The background image (public/world-map-dark.png, 1692×929) is NOT a plain 2:1
// equirectangular map: Antarctica is cropped and it is stretched ~1.23× taller
// than a true equirectangular, so the old ±180/±85 formula placed every dot too
// far north (e.g. Zagreb landed in Finland). Meridians and parallels are still
// straight lines, so lat/lng map linearly to image pixels. The coefficients
// below were fit to detected coastal extremes (Cape Horn, Cape Agulhas, North
// Cape, S. Greenland, New Zealand, Tasmania) and reproduce known city positions
// to within a few pixels worldwide.
//
// The SVG viewBox matches the image's aspect ratio (1692/929) so the overlay and
// the object-cover <img> are sliced identically and dots stay pinned to the map.
const MAP_W = 1000;
const MAP_H = 549; // 1000 × 929/1692 — matches the image aspect ratio

const project = (lat: number, lng: number): [number, number] => {
  const x = ((4.4623 * lng + 779.505) / 1692) * MAP_W;
  const y = ((-5.4862 * lat + 587.343) / 929) * MAP_H;
  return [x, y];
};

interface CityCluster {
  city: string;
  count: number;
  x: number;
  y: number;
}

interface AuthUserLocation {
  location?: string | null;
}

const resolveOriginCity = (userLocation?: string | null): string | null => {
  if (userLocation) {
    const loc = userLocation.toLowerCase().trim();
    for (const city of Object.keys(CITY_COORDS)) {
      if (loc.includes(city)) return city;
    }
  }
  if (typeof navigator !== 'undefined') {
    const lang = (navigator.language || '').toLowerCase();
    if (LOCALE_TO_CITY[lang]) return LOCALE_TO_CITY[lang];
    const base = lang.split('-')[0];
    if (LOCALE_TO_CITY[base]) return LOCALE_TO_CITY[base];
  }
  return 'zagreb';
};

interface MapCanvasProps {
  clusters: CityCluster[];
  maxCount: number;
  centerCity: string | null;
  zoom: number;
  showLabels?: boolean;
  hoveredCity?: string | null;
  onHoverCity?: (city: string | null) => void;
}

const MapCanvas: React.FC<MapCanvasProps> = ({
  clusters,
  maxCount,
  centerCity,
  zoom,
  showLabels = false,
  hoveredCity,
  onHoverCity,
}) => {
  const center = centerCity && CITY_COORDS[centerCity]
    ? project(CITY_COORDS[centerCity][0], CITY_COORDS[centerCity][1])
    : [MAP_W / 2, MAP_H / 2];

  const txPct = ((MAP_W / 2 - center[0]) / MAP_W) * 100;
  const tyPct = ((MAP_H / 2 - center[1]) / MAP_H) * 100;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 transition-transform duration-700 ease-out"
        style={{ transform: `scale(${zoom}) translate(${txPct}%, ${tyPct}%)`, transformOrigin: 'center' }}
      >
        <img
          src="/world-map-dark.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-90"
          draggable={false}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="cenner-heat-blob" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#22C55E" stopOpacity="0.55" />
              <stop offset="70%" stopColor="#16A34A" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#16A34A" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g style={{ mixBlendMode: 'screen' }}>
            {clusters.map(({ city, count, x, y }) => {
              const intensity = count / maxCount;
              const radius = (28 + intensity * 42) / Math.max(1, zoom * 0.6);
              return (
                <g
                  key={city}
                  style={onHoverCity ? { cursor: 'pointer' } : undefined}
                  onMouseEnter={onHoverCity ? () => onHoverCity(city) : undefined}
                  onMouseLeave={onHoverCity ? () => onHoverCity(null) : undefined}
                >
                  <circle cx={x} cy={y} r={radius} fill="url(#cenner-heat-blob)" />
                  <circle cx={x} cy={y} r={2 / Math.max(1, zoom * 0.3)} fill="#86EFAC" opacity={0.95} />
                </g>
              );
            })}
          </g>

          {showLabels && clusters.map(({ city, count, x, y }) => (
            <g key={`lbl-${city}`} style={{ pointerEvents: 'none' }}>
              <text
                x={x}
                y={y - 14}
                textAnchor="middle"
                fontSize={hoveredCity === city ? 11 : 9}
                fontWeight={700}
                fill={hoveredCity === city ? '#86EFAC' : 'rgba(255,255,255,0.55)'}
                style={{ textTransform: 'capitalize', transition: 'all .15s' }}
              >
                {city} · {count}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

interface Props {
  listings: ServiceListing[];
}

const FreelancerHeatmap: React.FC<Props> = ({ listings }) => {
  const t = useT();
  const { user } = useAuth() as { user: (AuthUserLocation & { id?: string }) | null };
  const [expanded, setExpanded] = useState(false);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const cityClusters = useMemo<CityCluster[]>(() => {
    const seenFreelancers = new Set<string>();
    const counts = new Map<string, number>();

    for (const listing of listings) {
      if (!listing.freelancerId || seenFreelancers.has(listing.freelancerId)) continue;
      seenFreelancers.add(listing.freelancerId);
      const loc = (listing.freelancerLocation || '').toLowerCase().trim();
      if (!loc) continue;
      for (const city of Object.keys(CITY_COORDS)) {
        if (loc.includes(city)) {
          counts.set(city, (counts.get(city) || 0) + 1);
          break;
        }
      }
    }

    return Array.from(counts.entries()).map(([city, count]) => {
      const [lat, lng] = CITY_COORDS[city];
      const [x, y] = project(lat, lng);
      return { city, count, x, y };
    });
  }, [listings]);

  const maxCount = cityClusters.reduce((m, c) => Math.max(m, c.count), 1);
  const totalMapped = cityClusters.reduce((s, c) => s + c.count, 0);
  const originCity = useMemo(() => resolveOriginCity(user?.location), [user?.location]);

  const handleClose = useCallback(() => setExpanded(false), []);
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [expanded, handleClose]);

  return (
    <>
      <div className="bg-brand-grey/40 border border-white/10 rounded-[1.75rem] p-5 backdrop-blur-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Globe2 size={13} className="text-brand-green" />
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
              {t('Talent Density')}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-brand-green uppercase tracking-widest">
              {totalMapped} {t('mapped')}
            </span>
            <button
              onClick={() => setExpanded(true)}
              aria-label={t('Expand map')}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-brand-green transition-colors"
            >
              <Maximize2 size={12} />
            </button>
          </div>
        </div>

        <div className="relative aspect-[2/1] w-full rounded-xl overflow-hidden bg-gradient-to-br from-black via-[#0a0e14] to-[#08120a] border border-white/5">
          <MapCanvas
            clusters={cityClusters}
            maxCount={maxCount}
            centerCity={originCity}
            zoom={2.6}
          />
          {cityClusters.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest">
                {t('No mapped freelancers yet')}
              </p>
            </div>
          )}
        </div>

        <p className="mt-3 text-[9px] text-gray-500 font-medium leading-relaxed">
          {t('Approximate city-level density. Exact locations are never shown.')}
        </p>
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-[300] animate-in fade-in duration-300"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-xl"
            onClick={handleClose}
          />
          <div className="absolute inset-4 md:inset-8 flex flex-col bg-brand-grey/60 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Globe2 size={18} className="text-brand-green" />
                <div>
                  <h2 className="text-base md:text-lg font-black text-white tracking-tight">
                    {t('Talent Density')}
                  </h2>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-0.5">
                    {totalMapped} {t('freelancers across')} {cityClusters.length} {t('cities')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                aria-label={t('Close')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative flex-grow bg-black overflow-hidden">
              <MapCanvas
                clusters={cityClusters}
                maxCount={maxCount}
                centerCity={null}
                zoom={1}
                showLabels
                hoveredCity={hoveredCity}
                onHoverCity={setHoveredCity}
              />
              {cityClusters.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
                    {t('No mapped freelancers yet')}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 md:px-10 py-4 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-500 font-medium uppercase tracking-widest">
              <span>{t('Approximate city-level density. Exact locations are never shown.')}</span>
              <span className="hidden md:block">{t('Press ESC to close')}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FreelancerHeatmap;
