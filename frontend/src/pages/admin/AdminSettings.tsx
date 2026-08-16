import { useEffect, useState } from 'react';
import { Clock, Star, Save, Trash2 } from 'lucide-react';
import { getAllItems } from '../../lib/staticItems';

const SETTINGS_KEY = 'mb_exclusive_settings';

function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch { return {}; }
}

function saveSettings(s: any) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export default function AdminSettings() {
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('19:00');
  const [exclusiveIds, setExclusiveIds] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');

  const allItems = getAllItems();
  const auctionItems = allItems.filter((i: any) => i.type === 'auction' || i.auction_enabled);

  useEffect(() => {
    const s = getSettings();
    if (s.open_time) setOpenTime(s.open_time);
    if (s.close_time) setCloseTime(s.close_time);
    if (s.exclusive_ids) setExclusiveIds(s.exclusive_ids);
  }, []);

  const save = () => {
    saveSettings({ open_time: openTime, close_time: closeTime, exclusive_ids: exclusiveIds });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleItem = (id: string) => {
    setExclusiveIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filtered = auctionItems.filter((i: any) =>
    i.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.brand?.toLowerCase().includes(search.toLowerCase())
  );

  // Current window status
  const now = new Date();
  const [oh, om] = openTime.split(':').map(Number);
  const [ch, cm] = closeTime.split(':').map(Number);
  const openMinutes = oh * 60 + om;
  const closeMinutes = ch * 60 + cm;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  const sectionLabel: React.CSSProperties = { fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#9e8e7e', marginBottom: '1rem', display: 'block' };
  const inputStyle: React.CSSProperties = { border: '1px solid #e8d5b7', padding: '8px 12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box', outline: 'none', backgroundColor: 'white' };

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '0.5rem' }}>Paramètres</h1>
      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#9e8e7e', marginBottom: '2rem' }}>
        Configuration de la vente exclusive quotidienne et des horaires d'ouverture.
      </p>

      {/* Statut en cours */}
      <div style={{ marginBottom: '1.5rem', padding: '12px 16px', backgroundColor: isOpen ? '#d4edda' : '#fff3cd', border: `1px solid ${isOpen ? '#c3e6cb' : '#ffc107'}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOpen ? '#2e7d32' : '#856404', flexShrink: 0 }} />
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: isOpen ? '#2e7d32' : '#856404' }}>
          {isOpen
            ? `Vente exclusive OUVERTE — ferme à ${closeTime}`
            : `Vente exclusive FERMÉE — ouvre à ${openTime}`
          }
        </p>
      </div>

      {/* Horaires */}
      <section style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <span style={sectionLabel}><Clock size={12} style={{ display: 'inline', marginRight: '6px' }} />HORAIRES D'OUVERTURE</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ ...sectionLabel, marginBottom: '4px' }}>OUVERTURE</label>
            <input type="time" value={openTime} onChange={e => setOpenTime(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ ...sectionLabel, marginBottom: '4px' }}>FERMETURE</label>
            <input type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)} style={inputStyle} />
          </div>
        </div>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#9e8e7e', marginTop: '0.75rem' }}>
          En dehors de ces horaires, un compte à rebours de suspense s'affiche sur la page vente exclusive.
        </p>
      </section>

      {/* Sélection des articles */}
      <section style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <span style={sectionLabel}><Star size={12} style={{ display: 'inline', marginRight: '6px' }} />ARTICLES EN VENTE EXCLUSIVE ({exclusiveIds.length} sélectionnés)</span>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', marginBottom: '1rem' }}>
          Ces articles apparaissent uniquement pendant la fenêtre horaire définie ci-dessus.
        </p>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un article d'enchère..."
          style={{ ...inputStyle, marginBottom: '1rem' }}
        />
        <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid #f0ece6' }}>
          {filtered.length === 0 && (
            <p style={{ padding: '2rem', textAlign: 'center', color: '#9e8e7e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem' }}>
              Aucun article d'enchère trouvé. Ajoutez des articles de type "Enchère" dans la gestion des articles.
            </p>
          )}
          {filtered.map((item: any) => (
            <div key={item.id}
              onClick={() => toggleItem(item.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderBottom: '1px solid #f8f4ef', cursor: 'pointer', backgroundColor: exclusiveIds.includes(item.id) ? '#fdf9f4' : 'white' }}>
              <div style={{ width: '18px', height: '18px', border: `2px solid ${exclusiveIds.includes(item.id) ? '#c9a96e' : '#e8d5b7'}`, borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: exclusiveIds.includes(item.id) ? '#c9a96e' : 'white' }}>
                {exclusiveIds.includes(item.id) && <span style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>✓</span>}
              </div>
              {(item.image || item.images?.[0]) && (
                <img src={item.image || item.images[0]} alt="" style={{ width: '42px', height: '42px', objectFit: 'cover', flexShrink: 0, borderRadius: '2px' }} />
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#1a1a1a', fontWeight: exclusiveIds.includes(item.id) ? 700 : 400 }}>{item.title}</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e' }}>
                  {item.brand} · Départ : {(item.auction_start_price || item.current_bid || 0).toLocaleString('fr-FR')} €
                </p>
              </div>
              {exclusiveIds.includes(item.id) && (
                <button onClick={e => { e.stopPropagation(); toggleItem(item.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cc0000', padding: '4px' }}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={save} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
          <Save size={14} /> ENREGISTRER LES PARAMÈTRES
        </button>
        {saved && <span style={{ color: '#2e7d32', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem' }}>✓ Paramètres enregistrés</span>}
      </div>
    </div>
  );
}
