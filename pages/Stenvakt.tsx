import React from 'react';
import { ExternalLink } from 'lucide-react';
import SEO from '../components/SEO';
import { useT } from '../i18n';

const SV = 'https://stenvakt.com';

const FEATURES: { name: string; body: string }[] = [
  { name: 'Review', body: 'Scores each server for security and health and lists what to fix first. Read-only: nothing changes until you preview a fix.' },
  { name: 'Watch', body: 'Outside activity read from the servers\' own logs: failed logins, blocked ports, bots and probes, with a one-click block that never touches your own address.' },
  { name: 'Update', body: 'Patches programs one at a time, checking services, ports and containers before and after, and stops at the first regression.' },
  { name: 'Safe mode', body: 'Firewall and SSH steps arm a rollback timer on the server, and the change is kept only after a fresh login works. It covers those steps only, not every change.' },
  { name: 'AI assistants', body: 'Assistants such as Claude Code can read reports and propose changes. You approve every one; they never receive passwords or keys, and they cannot switch safe mode off.' },
];

const Stenvakt: React.FC = () => {
  const t = useT();
  return (
    <div className="pt-16 pb-24 max-w-5xl mx-auto px-4">
      <SEO
        title="Stenvakt: Server Maintenance App by Cenner"
        canonical="/stenvakt"
        description="Stenvakt is a Mac app that reviews, watches and updates the Linux servers you run yourself over SSH, with a safe mode that undoes firewall and SSH changes if access is lost. Built by Cenner."
        ogLocale="en_US"
      />

      <div className="mb-20">
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="inline-block px-4 py-1 bg-leaf/10 text-leaf text-xs font-black uppercase tracking-widest">{t('A Cenner product')}</span>
          <span className="inline-block px-4 py-1 border-2 border-ink text-ink text-xs font-black uppercase tracking-widest">{t('In active development')}</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-ink mb-6 tracking-tight">Stenvakt</h1>
        <p className="text-xl md:text-2xl text-slate leading-relaxed max-w-3xl mb-8">
          A Mac app that reviews, watches and updates the Linux servers you run yourself, over SSH. Nothing is installed on the servers: it sends a short script, shows what it found, and changes only what you approve. With safe mode on, firewall and SSH changes arm a rollback timer on the server and are kept only once a fresh login works. Built and tested on Ubuntu and Debian.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href={SV}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-3 px-8 py-4 bg-sky text-white font-black hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            stenvakt.com <ExternalLink size={16} />
          </a>
          <a
            href={`${SV}/download`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-3 px-8 py-4 border-2 border-ink text-ink font-black hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            Download <ExternalLink size={16} />
          </a>
        </div>
      </div>

      <section className="mb-20">
        <h2 className="text-3xl font-black text-ink tracking-tight mb-8">What it does</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.name} className="p-8 bg-white border-2 border-ink">
              <h3 className="text-ink font-black text-xl mb-3">{f.name}</h3>
              <p className="text-slate text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-20 grid md:grid-cols-2 gap-6">
        <div className="p-8 bg-white border-2 border-ink">
          <h2 className="text-ink font-black text-xl mb-4">Guides</h2>
          <p className="text-slate text-sm leading-relaxed">The Stenvakt website also carries a library of practical server guides, one problem per page: SSH, firewalls, exposed databases, updates and backups.</p>
          <p className="text-slate text-sm mt-6">
            <a href={`${SV}/guides`} target="_blank" rel="noopener" className="text-leaf hover:underline">stenvakt.com/guides</a>
            {' · '}
            <a href={`${SV}/scan`} target="_blank" rel="noopener" className="text-leaf hover:underline">Scanner</a>
          </p>
        </div>

        <div className="p-8 bg-white border-2 border-ink">
          <h2 className="text-ink font-black text-xl mb-4">Try it</h2>
          <p className="text-slate text-sm leading-relaxed">Free for Macs with Apple silicon and macOS 14 or newer. No limit on servers and no account. Review, Preview and safe mode stay free for good. Pro adds features such as drift detection, scheduled backups and score history, and opens later.</p>
          <p className="text-slate text-sm leading-relaxed mt-4">
            Built by Cenner.{' '}
            <a href={`${SV}/terms`} target="_blank" rel="noopener" className="text-leaf hover:underline">Terms</a>
            {' · '}
            <a href={`${SV}/refunds`} target="_blank" rel="noopener" className="text-leaf hover:underline">Refunds</a>
            {' · '}
            <a href="mailto:hello@stenvakt.com" className="text-leaf hover:underline">hello@stenvakt.com</a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Stenvakt;
