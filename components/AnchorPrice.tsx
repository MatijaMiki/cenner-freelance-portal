import React from 'react';
import { useLanguage } from '../i18n';
import { hrDate, priceItem } from '../lib/cjenik.js';

type Item = ReturnType<typeof priceItem>;

/** €19 / mj. · €120 / god. · 5% · od €800, in the site's own price style */
export function formatPrice(price: number, unit: Item['unit'], t: (k: string) => string): string {
  const eur = `€${Number.isInteger(price) ? price : price.toFixed(2)}`;
  if (unit === 'percent') return `${price}%`;
  if (unit === 'month') return `${eur} / ${t('mo')}`;
  if (unit === 'year') return `${eur} / ${t('yr')}`;
  return `${t('from (price)')} ${eur}`;
}

/** The label the bazna cijena carries: "Bazna cijena (10. 9. 2026.)", in English "Base price (bazna cijena, 10. 9. 2026.)" */
export function baseLabel(iso: string, lang: string): string {
  return lang === 'HR' ? `Bazna cijena (${hrDate(iso)})` : `Base price (bazna cijena, ${hrDate(iso)})`;
}

/**
 * The "bazna cijena" (sidrena cijena) for one or more of Cenner's own prices: the price on the
 * reference date, shown in the same place as the price itself, also when it equals the current
 * price (lib/cjenik.js has the why).
 */
const AnchorPrice: React.FC<{ ids: (string | [id: string, label: string])[]; className?: string }> = ({ ids, className = '' }) => {
  const { lang, t } = useLanguage();
  // items sharing a reference date read as one line: "Bazna cijena (10. 9. 2026.): €19 / mj. · naknada platforme 10%"
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
          {baseLabel(date, lang)}: {group.map(({ it, label }) => `${label ? `${t(label)} ` : ''}${formatPrice(it.anchor.price, it.unit, t)}`).join(' · ')}
        </span>
      ))}
    </p>
  );
};

export default AnchorPrice;
