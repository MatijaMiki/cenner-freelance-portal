import React from 'react';
import { useLanguage } from '../i18n';
import { hrDate, priceItem } from '../lib/cjenik.js';

type Item = ReturnType<typeof priceItem>;

/** €750 · €10.000 (HR) / €10,000 (EN) · €12.50: thousands grouped, cents only when there are any */
export function eurAmount(price: number, lang = 'HR'): string {
  const n = new Intl.NumberFormat(lang === 'HR' ? 'hr-HR' : 'en-GB', {
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(price);
  return `€${n}`;
}

/** €19 / mj. · €120 / god. · 5% · od €800 · od €50 / mj. · €250, in the site's own price style */
export function formatPrice(price: number, unit: Item['unit'], t: (k: string) => string, lang = 'HR'): string {
  const eur = eurAmount(price, lang);
  if (unit === 'percent') return `${price}%`;
  if (unit === 'month') return `${eur} / ${t('mo')}`;
  if (unit === 'year') return `${eur} / ${t('yr')}`;
  if (unit === 'from-month') return `${t('from (price)')} ${eur} / ${t('mo')}`;
  if (unit === 'fixed') return eur;
  return `${t('from (price)')} ${eur}`;
}

/** "10.9.2026." in Croatian, "10.9.2026" in English */
export function anchorDate(iso: string, lang: string): string {
  const d = hrDate(iso);
  return lang === 'HR' ? d : d.slice(0, -1);
}

/**
 * The "dodatna cijena" (sidrena cijena) for one or more of Cenner's own prices: the price on the
 * reference date, shown in the same place as the price itself (lib/cjenik.js has the why). The
 * ministry recommends labelling it with the date alone: "Cijena na 10.9.2026.".
 */
const AnchorPrice: React.FC<{ ids: (string | [id: string, label: string])[]; className?: string }> = ({ ids, className = '' }) => {
  const { lang, t } = useLanguage();
  // items sharing a reference date read as one line: "Cijena na 10.9.2026.: €19 / mj. · naknada platforme 10%"
  const byDate = new Map<string, { it: Item; label?: string }[]>();
  for (const entry of ids) {
    const [id, label] = typeof entry === 'string' ? [entry] : entry;
    const it = priceItem(id);
    byDate.set(it.anchor.date, [...(byDate.get(it.anchor.date) || []), { it, label }]);
  }
  return (
    <p className={`text-[13px] leading-snug ${className}`}>
      {[...byDate].map(([date, group]) => (
        <span key={date} className="block">
          {t('Price on')} {anchorDate(date, lang)}: {group.map(({ it, label }) => `${label ? `${t(label)} ` : ''}${formatPrice(it.anchor.price, it.unit, t, lang)}`).join(' · ')}
        </span>
      ))}
    </p>
  );
};

export default AnchorPrice;
