import { useEffect, useState } from 'react';
import { Clock, Star, Save, Trash2, CalendarDays, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { getAllItems } from '../../lib/staticItems';

const SETTINGS_KEY = 'mb_exclusive_settings';

function getSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); }
  catch { return {}; }
}
function saveSettings(s: any) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

// Heure Paris → "HH:MM" string
function getParisClock() {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const h = parts.find(p => p.type === 'hour')?.value ?? '00';
  const m = parts.find(p => p.type === 'minute')?.value ?? '00';
  return { h: parseInt(h), m: parseInt(m), str: `${h}:${m}` };
}

// Date Paris → "YYYY-MM-DD"
function getParisDate() {
  return new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date());
}

function isNowOpen(openDate: string, openTime: string, closeTime: string) {
  const today = getParisDate();
  if (today !== openDate) return false;
  const { h, m } = getParisClock();
  const [oh, om] = openTime.split(':').map(Number);
  const [ch, cm] = closeTime.split(':').map(Number);
  const cur = h * 60 + m;
  return cur >= oh * 60 + om && cur < ch * 60 + cm;
}

function getStatus(openDate: string, openTime: string, closeTime: string) {
  const today = getParisDate();
  if (today === openDate && isNowOpen(openDate, openTime, closeTime)) return 'open';
  if (today > openDate) return 'past';
  return 'scheduled';
}

export default function AdminSettings() {
  const today = getParisDate();
  const [openDate, setOpenDate] = useState(today);
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('19:00');
  const [exclusiveIds, setExclusiveIds] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');
  const [tick, setTick] = useState(0);

  const allItems = getAllItems();
  const auctionItems = allItems.filter((i: any) => i.type === 'auction' || i.auction_enabled);

  useEffect(() => {
    const s = getSettings();
    if (s.open_date) setOpenDate(s.open_date);
    if (s.open_time) setOpenTime(s.open_time);
    if (s.close_time) setCloseTime(s.close_time);
    if (s.exclusive_ids) setExclusiveIds(s.exclusive_ids);
    const iv = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(iv);
  }, []);

  const save = () => {
    saveSettings({ open_date: openDate, open_time: openTime, close_time: closeTime, exclusive_ids: exclusiveIds });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const reset = () => {
    if (!confirm('Supprimer cette sélection exclusive ?')) return;
    const newDate = getParisDate();
    setOpenDate(newDate);
    setOpenTime('09:00');
    setCloseTime('19:00');
    setExclusiveIds([]);
    saveSettings({ open_date: newDate, open_time: '09:00', close_time: '19:00', exclusive_ids: [] });
  };

  const toggleItem = (id: string) => {
    setExclusiveIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filtered = auctionItems.filter((i: any) =>
    i.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const status = getStatus(openDate, openTime, closeTime);
  void tick; // force re-render for status

  const statusColors = {
    open: { bg: '#d4edda', border: '#c3e6cb', dot: '#2e7d32', text: '#2e7d32' },
    scheduled: { bg: '#fff3cd', border: '#ffc107', dot: '#856404', text: '#856404' },
    past: { bg: '#f8d7da', border: '#f5c6cb', dot: '#721c24', text: '#721c24' },
  }[status];

  const statusLabel = {
    open: `OUVERTE — ferme à ${closeTime} (heure de Paris)`,
    scheduled: `Programmée le ${new Intl.DateTimeFormat('fr-FR').format(new Date(openDate + 'T12:00'))} à ${openTime}`,
    past: 'Session terminée — programmez une nouvelle date',
  }[status];

  const sl: React.CSSProperties = { fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#9e8e7e', marginBottom: '6px', display: 'block' };
  const inp: React.CSSProperties = { border: '1px solid #e8d5b7', padding: '8px 12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box', outline: 'none', backgroundColor: 'white' };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '0.25rem' }}>Vente Exclusive</h1>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#9e8e7e' }}>
            Programmez la sélection du jour et les horaires. Tout se base sur l'heure de Paris.
          </p>
        </div>
        <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #e8d5b7', padding: '8px 12px', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e', flexShrink: 0, marginTop: '4px' }}>
          <RotateCcw size={12} /> Réinitialiser
        </button>
      </div>

      {/* Statut */}
      <div style={{ marginBottom: '1.5rem', padding: '12px 16px', backgroundColor: statusColors.bg, border: `1px solid ${statusColors.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColors.dot, flexShrink: 0 }} />
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: statusColors.text }}>
          {statusLabel}
        </p>
        {status === 'open' && (
          <Eye size={14} color={statusColors.text} style={{ marginLeft: 'auto', flexShrink: 0 }} />
        )}
        {status !== 'open' && (
          <EyeOff size={14} color={statusColors.dot} style={{ marginLeft: 'auto', flexShrink: 0, opacity: 0.5 }} />
        )}
      </div>

      {/* Programmation */}
      <section style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <span style={sl}><CalendarDays size={12} style={{ display: 'inline', marginRight: '6px' }} />PROGRAMMATION DE LA VENTE</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ ...sl, marginBottom: '4px' }}>DATE D'OUVERTURE</label>
            <input type="date" value={openDate} min={today} onChange={e => setOpenDate(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={{ ...sl, marginBottom: '4px' }}>HEURE D'OUVERTURE</label>
            <input type="time" value={openTime} onChange={e => setOpenTime(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={{ ...sl, marginBottom: '4px' }}>HEURE DE FERMETURE</label>
            <input type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)} style={inp} />
          </div>
        </div>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#9e8e7e', marginTop: '0.75rem' }}>
          <Clock size={11} style={{ display: 'inline', marginRight: '4px' }} />
          Tous les horaires sont en heure de Paris (Europe/Paris). Le compte à rebours s'affiche automatiquement sur le site jusqu'à l'ouverture.
        </p>
      </section>

      {/* Sélection des articles */}
      <section style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ ...sl, marginBottom: 0 }}><Star size={12} style={{ display: 'inline', marginRight: '6px' }} />SÉLECTION ({exclusiveIds.length} article{exclusiveIds.length > 1 ? 's' : ''})</span>
          {exclusiveIds.length > 0 && (
            <button onClick={() => setExclusiveIds([])} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#cc0000', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Trash2 size={11} /> Tout retirer
            </button>
          )}
        </div>

        {/* Articles sélectionnés en haut */}
        {exclusiveIds.length > 0 && (
          <div style={{ marginBottom: '1rem', padding: '10px', backgroundColor: '#fdf9f4', border: '1px solid #e8d5b7' }}>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#c9a96e', marginBottom: '8px' }}>DANS LA SÉLECTION</p>
            {exclusiveIds.map(id => {
              const item = allItems.find((i: any) => i.id === id);
              if (!item) return null;
              return (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid #f5f0ea' }}>
                  {(item.image || item.images?.[0]) && (
                    <img src={item.image || item.images[0]} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1a1a1a', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#9e8e7e' }}>{item.brand}</p>
                  </div>
                  <button onClick={() => toggleItem(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cc0000', padding: '4px', flexShrink: 0 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un article à ajouter..."
          style={{ ...inp, marginBottom: '0.75rem' }}
        />
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #f0ece6' }}>
          {filtered.length === 0 && (
            <p style={{ padding: '2rem', textAlign: 'center', color: '#9e8e7e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem' }}>
              Aucun article d'enchère trouvé.
            </p>
          )}
          {filtered.filter((i: any) => !exclusiveIds.includes(i.id)).map((item: any) => (
            <div key={item.id}
              onClick={() => toggleItem(item.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderBottom: '1px solid #f8f4ef', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fdf9f4')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
            >
              <div style={{ width: '18px', height: '18px', border: '2px solid #e8d5b7', borderRadius: '3px', flexShrink: 0, backgroundColor: 'white' }} />
              {(item.image || item.images?.[0]) && (
                <img src={item.image || item.images[0]} alt="" style={{ width: '42px', height: '42px', objectFit: 'cover', flexShrink: 0, borderRadius: '2px' }} />
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#1a1a1a' }}>{item.title}</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e' }}>
                  {item.brand} · {(item.auction_start_price || item.current_bid || 0).toLocaleString('fr-FR')} €
                </p>
              </div>
              <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#c9a96e' }}>+ Ajouter</span>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={save} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
          <Save size={14} /> ENREGISTRER
        </button>
        {saved && <span style={{ color: '#2e7d32', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem' }}>✓ Enregistré</span>}
      </div>
    </div>
  );
}
