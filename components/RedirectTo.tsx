import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';

/**
 * An old URL whose page now lives on another one. vercel.json's redirects cover full page loads;
 * this covers the app's own links, which never reach the server. The visitor's query is kept
 * (merged over the target's), their #hash wins over the target's, and `:param`s in `to` are filled
 * from the old URL's.
 */
const RedirectTo: React.FC<{ to: string }> = ({ to }) => {
  const { search, hash } = useLocation();
  const params = useParams();
  const filled = to.replace(/:(\w+)/g, (_, k: string) => encodeURIComponent(params[k] ?? ''));
  const [base, targetHash = ''] = filled.split('#');
  const [path, targetQuery = ''] = base.split('?');
  const query = new URLSearchParams(targetQuery);
  new URLSearchParams(search).forEach((v, k) => query.set(k, v));
  const qs = query.toString();
  return <Navigate replace to={`${path}${qs ? `?${qs}` : ''}${hash || (targetHash ? `#${targetHash}` : '')}`} />;
};

export default RedirectTo;
