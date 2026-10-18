import React from 'react';
import { NavLink } from 'react-router-dom';
import { FileText, ShieldAlert } from 'lucide-react';

/** The admin area's screens as tabs, at the top of each (they were /blog-admin and /admin/bans,
 *  each linking to the other). Admin only, so not translated, like the screens themselves. */
const TABS = [
  { to: '/admin/blog', label: 'Blog', Icon: FileText },
  { to: '/admin/bans', label: 'Bans', Icon: ShieldAlert },
];

const AdminTabs: React.FC = () => (
  <div className="flex items-center gap-2 flex-wrap">
    <h1 className="mr-2 text-2xl font-black text-ink tracking-tighter">Admin</h1>
    <nav aria-label="Admin" className="flex items-center gap-2">
      {TABS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `inline-flex items-center gap-1.5 px-4 py-2 border text-[12px] font-black uppercase tracking-widest transition-colors ${
            isActive ? 'bg-sky text-white border-ink' : 'bg-ink/5 border-ink text-slate hover:bg-ink/10 hover:text-ink'
          }`}
        >
          <Icon size={14} /> {label}
        </NavLink>
      ))}
    </nav>
  </div>
);

export default AdminTabs;
