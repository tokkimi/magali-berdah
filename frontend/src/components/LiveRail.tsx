import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import LiveCard from './LiveCard';
import { getWhatnotLives, subscribeToWhatnotLives, type WhatnotLive } from '../lib/whatnot';

export default function LiveRail() {
  const [lives, setLives] = useState<WhatnotLive[]>([]);
  const refresh = useCallback(() => { getWhatnotLives().then(setLives).catch(() => setLives([])); }, []);
  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToWhatnotLives(refresh);
    const timer = window.setInterval(refresh, 30000);
    return () => { unsubscribe(); window.clearInterval(timer); };
  }, [refresh]);
  if (!lives.length) return null;
  return (
    <section style={{ padding: '1.5rem 0', background: '#1a1a1a' }}>
      <div style={{ padding: '0 1rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
        <div><p style={{ color: '#e11d48', font: '700 .58rem Helvetica Neue, Arial', letterSpacing: '.2em' }}>EN DIRECT</p><h2 style={{ color: 'white', font: '400 1.25rem Georgia, serif' }}>Lives Whatnot</h2></div>
        <Link to="/lives" style={{ color: '#c9a96e', textDecoration: 'none', display: 'flex', alignItems: 'center', font: '.7rem Helvetica Neue, Arial' }}>Tout voir <ChevronRight size={14} /></Link>
      </div>
      <div style={{ overflowX: 'auto', padding: '0 1rem', scrollbarWidth: 'none' }}>
        <div style={{ display: 'flex', gap: 12, width: 'max-content' }}>{lives.map(live => <div key={live.email} style={{ width: 300 }}><LiveCard live={live} /></div>)}</div>
      </div>
    </section>
  );
}
