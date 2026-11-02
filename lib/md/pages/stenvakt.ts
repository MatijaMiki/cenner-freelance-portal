/** /stenvakt as markdown. Keep in step with pages/Stenvakt.tsx. */
import { blocks, h2, h3, link, t, type PageModule } from '../format';

const SV = 'https://stenvakt.com';

const FEATURES: { name: string; body: string }[] = [
  { name: 'Review', body: 'Scores each server for security and health and lists what to fix first. Read-only: nothing changes until you preview a fix.' },
  { name: 'Watch', body: 'Outside activity read from the servers\' own logs: failed logins, blocked ports, bots and probes, with a one-click block that never touches your own address.' },
  { name: 'Update', body: 'Patches programs one at a time, checking services, ports and containers before and after, and stops at the first regression.' },
  { name: 'Safe mode', body: 'Every risky firewall or SSH change saves the server\'s state first and rolls back by itself if the app cannot log back in.' },
  { name: 'AI assistants', body: 'Assistants such as Claude Code can read reports and propose changes. You approve every one; they never receive passwords or keys, and they cannot switch safe mode off.' },
];

export const render: PageModule['render'] = () => ({
  title: 'Stenvakt',
  summary:
    'Stenvakt is a Mac app that reviews, watches and updates Linux servers over SSH, with a safe mode that undoes a change if access is lost. Built and operated by Cenner, Zagreb.',
  path: '/stenvakt',
  body: blocks(
    t('A Cenner product'),
    'A Mac app that reviews, watches and updates your Linux servers over SSH. Nothing is installed on the servers: it sends a short script, shows what it found, and changes only what you approve. Risky changes run in safe mode, which saves the server\'s state first and rolls the change back by itself if the app cannot get back in.',
    `${link('stenvakt.com', SV)} · ${link('Download', `${SV}/download`)}`,
    h2('What it does'),
    ...FEATURES.map((f) => blocks(h3(f.name), f.body)),
    h2('Guides'),
    'The Stenvakt website also carries a library of practical server guides, one problem per page: SSH, firewalls, exposed databases, updates and backups.',
    link('stenvakt.com/guides', `${SV}/guides`),
    h2('Try it'),
    'Download the free version at stenvakt.com/download.',
    'hello@stenvakt.com',
  ),
  related: [
    { text: 'stenvakt.com', href: SV },
    { text: t('About Cenner'), href: '/about' },
  ],
});
