import React from 'react';
import { ExternalLink } from 'lucide-react';
import SEO from '../components/SEO';
import { useT } from '../i18n';

const SV = 'https://stenvakt.com';

const FEATURES: { name: string; body: string }[] = [
  { name: 'Review', body: 'Scores each server for security and health and lists what to fix first. Read-only: nothing changes until you preview a fix.' },
  { name: 'Watch', body: 'Outside activity read from the servers\' own logs: failed logins, blocked ports, bots and probes, with a one-click block that never touches your own address.' },
  { name: 'Update', body: 'Patches programs one at a time, checking services, ports and containers before and after, and stops at the first regression.' },
  { name: 'Safe mode', body: 'Every risky firewall or SSH change saves the server\'s state first and rolls back by itself if the app cannot log back in.' },
  { name: 'AI assistants', body: 'Assistants such as Claude Code can read reports and propose changes. You approve every one; they never receive passwords or keys, and they cannot switch safe mode off.' },
];

const Stenvakt: React.FC = () => {
  const t = useT();
  return (
    <div className="pt-16 pb-24 max-w-5xl mx-auto px-4">
      <SEO
        title="Stenvakt: Server Maintenance App by Cenner"
        canonical="/stenvakt"
        description="Stenvakt is a Mac app that reviews, watches and updates Linux servers over SSH, with a safe mode that undoes a change if access is lost. Built and operated by Cenner, Zagreb."
        ogLocale="en_US"
      />

      <div className="mb-20">
        <div className="inline-block px-4 py-1 bg-leaf/10 text-leaf text-xs font-black uppercase tracking-widest mb-6">{t('A Cenner product')}</div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-ink mb-6 tracking-tight">Stenvakt</h1>
        <p className="text-xl md:text-2xl text-slate leading-relaxed max-w-3xl mb-8">
          A Mac app that reviews, watches and updates your Linux servers over SSH. Nothing is installed on the servers: it sends a short script, shows what it found, and changes only what you approve. Risky changes run in safe mode, which saves the server's state first and rolls the change back by itself if the app cannot get back in.
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
          </p>
        </div>

        <div className="p-8 bg-white border-2 border-ink">
          <h2 className="text-ink font-black text-xl mb-4">Try it</h2>
          <p className="text-slate text-sm leading-relaxed">Download the free version at stenvakt.com/download.</p>
          <p className="text-slate text-sm leading-relaxed mt-4">
            <a href="mailto:hello@stenvakt.com" className="text-leaf hover:underline">hello@stenvakt.com</a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Stenvakt;
