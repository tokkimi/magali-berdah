import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import LiveCard from './LiveCard';
import { getWhatnotLives, type WhatnotLive } from '../lib/whatnot';

export default function LiveRail() {
  const [lives, setLives] = useState<WhatnotLive[]>(getWhatnotLives);
  useEffect(() => {
    const refresh = () => setLives(getWhatnotLives());
    window.addEventListener('storage', refresh);
    window.addEventListener('whatnot-lives-updated', refresh);
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener('whatnot-lives-updated', refresh); };
  }, []);
  if (!lives.length) return null;
  return (
    <section style={{ padding: '1.5rem 0', background: '#1a1a1a' }}>
      <div style={{ padding: '0 1rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
        <div><p style={{ color: '#e11d48', font: '700 .58rem Helvetica Neue, Arial', letterSpacing: '.2em' }}>EN DIRECT</p><h2 style={{ color: 'white', font: '400 1.25rem Georgia, serif' }}>Lives Whatnot</h2></div>
        <Link to="/lives" style={{ color: '#c9a96e', textDecoration: 'none', display: 'flex', alignItems: 'center', font: '.7rem Helvetica Neue, Arial' }}>Tout voir <ChevronRight size={14} /></Link>
      </div>
      <div style={{ overflowX: 'auto', padding: '0 1rem', scrollbarWidth: 'none' }}>
        <div style={{ display: 'flex', gap: 12, width: 'max-content' }}>{lives.map(live => <div key={live.id} style={{ width: 300 }}><LiveCard live={live} /></div>)}</div>
      </div>
    </section>
  );
}

