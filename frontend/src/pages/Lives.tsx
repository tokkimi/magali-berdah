import { useCallback, useEffect, useState } from 'react';
import { Radio } from 'lucide-react';
import LiveCard from '../components/LiveCard';
import {
  getWhatnotLives,
  subscribeToWhatnotLives,
  type WhatnotLive,
} from '../lib/whatnot';

export default function Lives() {
  const [lives, setLives] = useState<WhatnotLive[]>([]);

  const refresh = useCallback(() => {
    getWhatnotLives().then(setLives).catch(() => setLives([]));
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToWhatnotLives(refresh);
    const timer = window.setInterval(refresh, 30000);
    return () => {
      unsubscribe();
      window.clearInterval(timer);
    };
  }, [refresh]);

  return (
    <div style={{ background: '#faf7f4', minHeight: '70vh', padding: '3rem 1rem 7rem' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <p style={{ color: '#e11d48', font: '700 .62rem Helvetica Neue, Arial', letterSpacing: '.22em' }}>
          WHATNOT · EN DIRECT
        </p>
        <h1 style={{ font: '400 2.2rem Georgia, serif', margin: '.4rem 0 2rem' }}>
          Les lives en cours
        </h1>

        {lives.length ? (
          <div
            className="live-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 16 }}
          >
            {lives.map(live => <LiveCard key={live.email} live={live} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', color: '#9e8e7e' }}>
            <Radio size={42} style={{ margin: '0 auto 1rem' }} />
            <p style={{ font: '1rem Georgia, serif' }}>Aucun live en cours pour le moment.</p>
          </div>
        )}
      </div>
      <style>{`@media(max-width:1000px){.live-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}@media(max-width:600px){.live-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
