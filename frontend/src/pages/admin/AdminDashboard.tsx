import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Users, Package, ShoppingBag, TrendingUp, Eye, Mail, Star, Lock, Clock, Trash2, ChevronRight, Save, CalendarDays } from 'lucide-react';
import { STATIC_ITEMS, getAllItems } from '../../lib/staticItems';

const SETTINGS_KEY = 'mb_exclusive_settings';

function getExclusiveSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return {
      open_date: s.open_date || new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date()),
      open_time: s.open_time || '09:00',
      close_time: s.close_time || '19:00',
      exclusive_ids: (s.exclusive_ids as string[]) || [],
    };
  } catch { return { open_date: new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date()), open_time: '09:00', close_time: '19:00', exclusive_ids: [] }; }
}
function saveExclusiveSettings(s: any) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}
function getParisDate() {
  return new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date());
}
function getNowParis() {
  const parts = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
  const get = (t: string) => parseInt(parts.find(p => p.type === t)?.value || '0');
  return { h: get('hour'), m: get('minute') };
}
function isNowOpen(od: string, ot: string, ct: string) {
  if (getParisDate() !== od) return false;
  const { h, m } = getNowParis();
  const [oh, om] = ot.split(':').map(Number);
  const [ch, cm] = ct.split(':').map(Number);
  const cur = h * 60 + m;
  return cur >= oh * 60 + om && cur < ch * 60 + cm;
}

function ExclusiveWidget() {
  const [settings, setSettings] = useState(getExclusiveSettings);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(() => isNowOpen(getExclusiveSettings().open_date, getExclusiveSettings().open_time, getExclusiveSettings().close_time));
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const today = getParisDate();

  useEffect(() => {
    const iv = setInterval(() => setOpen(isNowOpen(settings.open_date, settings.open_time, settings.close_time)), 30000);
    return () => clearInterval(iv);
  }, [settings]);

  const save = () => {
    saveExclusiveSettings(settings);
    setSaved(true);
    setOpen(isNowOpen(settings.open_date, settings.open_time, settings.close_time));
    setTimeout(() => setSaved(false), 2500);
  };

  const removeItem = (id: string) => {
    const next = { ...settings, exclusive_ids: settings.exclusive_ids.filter(x => x !== id) };
    setSettings(next);
    saveExclusiveSettings(next);
  };

  const addItem = (id: string) => {
    if (settings.exclusive_ids.includes(id)) return;
    const next = { ...settings, exclusive_ids: [...settings.exclusive_ids, id] };
    setSettings(next);
    saveExclusiveSettings(next);
    setSearch('');
    setShowSearch(false);
  };

  const allItems = getAllItems();
  const exclusiveItems = allItems.filter((i: any) => settings.exclusive_ids.includes(i.id));

  const filtered = search.length > 1
    ? allItems.filter((i: any) =>
        !settings.exclusive_ids.includes(i.id) &&
        (`${i.title} ${i.brand}`).toLowerCase().includes(search.toLowerCase())
      ).slice(0, 6)
    : [];

  const statusColor = open ? '#2e7d32' : settings.open_date < today ? '#cc0000' : '#856404';
  const statusBg = open ? '#d4edda' : settings.open_date < today ? '#f8d7da' : '#fff3cd';
  const statusLabel = open ? `OUVERTE · ferme à ${settings.close_time}` : settings.open_date < today ? 'Session terminée' : `Programmée le ${settings.open_date === today ? 'aujourd\'hui' : new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(new Date(settings.open_date + 'T12:00'))} à ${settings.open_time}`;

  const inp: React.CSSProperties = { border: '1px solid rgba(201,169,110,0.4)', padding: '8px 10px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', backgroundColor: 'rgba(255,255,255,0.08)', color: 'white', borderRadius: '4px', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ backgroundColor: '#0f0f0f', border: '1px solid rgba(201,169,110,0.25)', borderRadius: '12px', marginBottom: '1.5rem', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.25rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={14} color="#c9a96e" fill="#c9a96e" />
          <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.62rem', letterSpacing: '0.2em', color: '#c9a96e' }}>VENTE EXCLUSIVE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: statusBg, padding: '3px 10px', borderRadius: '20px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusColor }} />
          <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.58rem', color: statusColor, letterSpacing: '0.1em' }}>{statusLabel.toUpperCase()}</span>
        </div>
      </div>

      {/* Horaires */}
      <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.55rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Clock size={10} color="rgba(255,255,255,0.4)" /> HORAIRES (HEURE DE PARIS)
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.5rem', color: 'rgba(255,255,255,0.35)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <CalendarDays size={9} /> DATE
            </p>
            <input type="date" value={settings.open_date} min={today}
              onChange={e => setSettings(s => ({ ...s, open_date: e.target.value }))}
              style={{ ...inp, colorScheme: 'dark' }} />
          </div>
          <div>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.5rem', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>OUVERTURE</p>
            <input type="time" value={settings.open_time}
              onChange={e => setSettings(s => ({ ...s, open_time: e.target.value }))}
              style={{ ...inp, colorScheme: 'dark' }} />
          </div>
          <div>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.5rem', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>FERMETURE</p>
            <input type="time" value={settings.close_time}
              onChange={e => setSettings(s => ({ ...s, close_time: e.target.value }))}
              style={{ ...inp, colorScheme: 'dark' }} />
          </div>
        </div>
        <button onClick={save} style={{ marginTop: '10px', width: '100%', padding: '9px', backgroundColor: '#c9a96e', border: 'none', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', letterSpacing: '0.1em', color: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Save size={13} /> {saved ? '✓ ENREGISTRÉ' : 'ENREGISTRER LES HORAIRES'}
        </button>
      </div>

      {/* Articles dans la sélection */}
      <div style={{ padding: '0.875rem 1.25rem', borderBottom: showSearch ? '1px solid rgba(255,255,255,0.07)' : undefined }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.55rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>
            SÉLECTION ({exclusiveItems.length} article{exclusiveItems.length !== 1 ? 's' : ''})
          </p>
          <button onClick={() => setShowSearch(s => !s)} style={{ background: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: '20px', padding: '4px 12px', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.62rem', color: '#c9a96e', display: 'flex', alignItems: 'center', gap: '4px' }}>
            + Ajouter un article
          </button>
        </div>

        {exclusiveItems.length === 0 && !showSearch && (
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '0.75rem 0' }}>Aucun article dans la sélection</p>
        )}

        {exclusiveItems.map((item: any) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {(item.photos?.[0] || item.image || item.images?.[0]) && (
              <img src={item.photos?.[0] || item.image || item.images?.[0]} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: 'white', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#c9a96e' }}>{item.brand}</p>
            </div>
            <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px', flexShrink: 0 }}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* Recherche ajout article */}
      {showSearch && (
        <div style={{ padding: '0.875rem 1.25rem' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par titre ou marque..."
            autoFocus
            style={{ ...inp, marginBottom: '6px' }}
          />
          {filtered.map((item: any) => (
            <div key={item.id} onClick={() => addItem(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: '4px' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(201,169,110,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)')}
            >
              {(item.photos?.[0] || item.image || item.images?.[0]) && (
                <img src={item.photos?.[0] || item.image || item.images?.[0]} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.63rem', color: '#c9a96e' }}>{item.brand}</p>
              </div>
              <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', color: '#c9a96e', flexShrink: 0 }}>+ Ajouter</span>
            </div>
          ))}
          {search.length > 1 && filtered.length === 0 && (
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '0.5rem' }}>Aucun résultat</p>
          )}
          <Link to="/admin/articles/nouveau" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '10px', textDecoration: 'none', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: 'rgba(201,169,110,0.6)' }}>
            Créer un nouvel article <ChevronRight size={12} />
          </Link>
        </div>
      )}
    </div>
  );
}

const STATIC_STATS = {
  totalUsers: 0, totalPros: 0, activeItems: STATIC_ITEMS.length,
  totalItems: STATIC_ITEMS.length, totalOrders: 0, pendingPayments: 0,
  totalRevenue: 0, todayVisitors: 0, weekVisitors: 0, newsletterSubs: 0,
  topItems: STATIC_ITEMS.slice(0, 8).map(i => ({ id: i.id, title: i.title, brand: i.brand, views: i.views || 0 })),
  recentOrders: [],
  dailyVisitors: Array.from({ length: 30 }, (_, k) => ({ day: `J-${30 - k}`, count: 0 })),
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(STATIC_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const n = (v: any, fallback = 0) => v ?? fallback;

  const cards = [
    { label: 'Utilisateurs', value: n(stats.totalUsers), sub: `${n(stats.totalPros)} vendeurs historiques`, icon: Users, color: '#c9a96e' },
    { label: 'Articles actifs', value: n(stats.activeItems, STATIC_ITEMS.length), sub: `${n(stats.totalItems, STATIC_ITEMS.length)} total`, icon: Package, color: '#1976d2' },
    { label: 'Commandes', value: n(stats.totalOrders), sub: `${n(stats.pendingPayments)} en attente`, icon: ShoppingBag, color: '#ff9800' },
    { label: 'Revenus (commissions)', value: `${(n(stats.totalRevenue)).toFixed(0)} €`, icon: TrendingUp, color: '#2e7d32' },
    { label: "Visiteurs aujourd'hui", value: n(stats.todayVisitors), sub: `${n(stats.weekVisitors)} cette semaine`, icon: Eye, color: '#9c27b0' },
    { label: 'Newsletter', value: n(stats.newsletterSubs), sub: 'abonnés actifs', icon: Mail, color: '#c9a96e' },
  ];

  const payLabels: Record<string, string> = { pending: 'En attente', paid: 'Payé', failed: 'Échoué' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a' }}>Tableau de bord</h1>
        {loading && <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#c9a96e' }}>Chargement...</span>}
      </div>

      {/* Vente Exclusive en premier */}
      <ExclusiveWidget />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {cards.map(c => (
          <div key={c.label} style={{ backgroundColor: 'white', padding: '1.25rem', border: '1px solid #e8d5b7', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.1em', color: '#9e8e7e', marginBottom: '0.5rem' }}>{c.label.toUpperCase()}</p>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', color: c.color }}>{c.value}</p>
                {c.sub && <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e', marginTop: '2px' }}>{c.sub}</p>}
              </div>
              <c.icon size={20} color={c.color} style={{ opacity: 0.5 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Top items */}
        <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem', borderRadius: '8px' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 400, marginBottom: '1rem', color: '#1a1a1a' }}>Articles les plus vus</h2>
          {(stats.topItems || []).slice(0, 8).map((item: any) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0ece6' }}>
              <div style={{ minWidth: 0, flex: 1, marginRight: '8px' }}>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#c9a96e' }}>{item.brand}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <Eye size={12} color="#9e8e7e" />
                <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e' }}>{item.views ?? 0}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent orders */}
        <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem', borderRadius: '8px' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 400, marginBottom: '1rem', color: '#1a1a1a' }}>Dernières commandes</h2>
          {(stats.recentOrders || []).length === 0 ? (
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#9e8e7e', textAlign: 'center', padding: '1.5rem 0' }}>Aucune commande</p>
          ) : (stats.recentOrders || []).slice(0, 8).map((o: any) => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0ece6' }}>
              <div>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1a1a1a' }}>{o.item_title}</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#9e8e7e' }}>{o.buyer_name}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.85rem', color: '#1a1a1a' }}>{o.amount?.toLocaleString('fr-FR')} €</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: o.payment_status === 'paid' ? '#2e7d32' : '#ff9800' }}>
                  {payLabels[o.payment_status] || o.payment_status}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Visitor chart */}
        <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem', borderRadius: '8px', gridColumn: 'span 2' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 400, marginBottom: '1rem', color: '#1a1a1a' }}>Visiteurs — 30 derniers jours</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100px' }}>
            {(stats.dailyVisitors || []).slice(-30).map((d: any, i: number) => {
              const max = Math.max(...(stats.dailyVisitors || []).map((x: any) => x.count), 1);
              const h = max > 0 ? Math.max(4, (d.count / max) * 100) : 4;
              return (
                <div key={i} title={`${d.day}: ${d.count} visiteurs`}
                  style={{ flex: 1, backgroundColor: '#c9a96e', height: `${h}%`, minWidth: '6px', opacity: 0.4 + 0.6 * (d.count / Math.max(max, 1)), borderRadius: '2px 2px 0 0' }} />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
