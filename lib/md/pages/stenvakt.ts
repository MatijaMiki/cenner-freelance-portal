/** /stenvakt as markdown. Keep in step with pages/Stenvakt.tsx. */
import { blocks, h2, h3, link, t, type PageModule } from '../format';

const SV = 'https://stenvakt.com';

const FEATURES: { name: string; body: string }[] = [
  { name: 'Review', body: 'Scores each server for security and health and lists what to fix first. Read-only: nothing changes until you preview a fix.' },
  { name: 'Watch', body: 'Outside activity read from the servers\' own logs: failed logins, blocked ports, bots and probes, with a one-click block that never touches your own address.' },
  { name: 'Update', body: 'Patches programs one at a time, checking services, ports and containers before and after, and stops at the first regression.' },
  { name: 'Safe mode', body: 'Firewall and SSH steps arm a rollback timer on the server, and the change is kept only after a fresh login works. It covers those steps only, not every change.' },
  { name: 'AI assistants', body: 'Assistants such as Claude Code can read reports and propose changes. You approve every one; they never receive passwords or keys, and they cannot switch safe mode off.' },
];

export const render: PageModule['render'] = () => ({
  title: 'Stenvakt',
  summary:
    'Stenvakt is a Mac app that reviews, watches and updates the Linux servers you run yourself over SSH, with a safe mode that undoes firewall and SSH changes if access is lost. Built by Cenner.',
  path: '/stenvakt',
  body: blocks(
    `${t('A Cenner product')} · ${t('In active development')}`,
    'A Mac app that reviews, watches and updates the Linux servers you run yourself, over SSH. Nothing is installed on the servers: it sends a short script, shows what it found, and changes only what you approve. With safe mode on, firewall and SSH changes arm a rollback timer on the server and are kept only once a fresh login works. Built and tested on Ubuntu and Debian.',
    `${link('stenvakt.com', SV)} · ${link('Download', `${SV}/download`)}`,
    h2('What it does'),
    ...FEATURES.map((f) => blocks(h3(f.name), f.body)),
    h2('Guides'),
    'The Stenvakt website also carries a library of practical server guides, one problem per page: SSH, firewalls, exposed databases, updates and backups.',
    `${link('stenvakt.com/guides', `${SV}/guides`)} · ${link('Scanner', `${SV}/scan`)}`,
    h2('Try it'),
    'Free for Macs with Apple silicon and macOS 14 or newer. No limit on servers and no account. Review, Preview and safe mode stay free for good. Pro adds features such as drift detection, scheduled backups and score history, and opens later.',
    `Built by Cenner. ${link('Terms', `${SV}/terms`)} · ${link('Refunds', `${SV}/refunds`)} · hello@stenvakt.com`,
  ),
  related: [
    { text: 'stenvakt.com', href: SV },
    { text: t('About Cenner'), href: '/about' },
  ],
});
