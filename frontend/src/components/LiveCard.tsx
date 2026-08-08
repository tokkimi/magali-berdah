import { ExternalLink, Radio } from 'lucide-react';
import type { WhatnotLive } from '../lib/whatnot';

export default function LiveCard({ live }: { live: WhatnotLive }) {
  const isVideo = !!live.preview_url && /\.(mp4|webm|ogg)(\?|$)/i.test(live.preview_url);
  return (
    <a href={live.show_url} target="_blank" rel="noreferrer"
      style={{ display: 'block', color: 'inherit', textDecoration: 'none', background: '#111', borderRadius: 14, overflow: 'hidden', minWidth: 0 }}>
      <div style={{ aspectRatio: '16 / 10', position: 'relative', background: 'linear-gradient(135deg,#2b201c,#050505)' }}>
        {isVideo ? (
          <video src={live.preview_url} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : live.preview_url ? (
          <img src={live.preview_url} alt={`Live de @${live.whatnot_handle}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ height: '100%', display: 'grid', placeItems: 'center' }}><Radio size={44} color="#c9a96e" /></div>
        )}
        <span style={{ position: 'absolute', top: 10, left: 10, background: '#e11d48', color: 'white', padding: '5px 9px', borderRadius: 999, font: '700 0.65rem Helvetica Neue, Arial', letterSpacing: '.12em' }}>● LIVE</span>
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ color: 'white', font: '600 .86rem Helvetica Neue, Arial', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{live.whatnot_handle} est en live</p>
          {live.live_title && <p style={{ color: '#aaa', font: '.7rem Helvetica Neue, Arial', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{live.live_title}</p>}
        </div>
        <ExternalLink size={17} color="#c9a96e" style={{ flexShrink: 0 }} />
      </div>
    </a>
  );
}
