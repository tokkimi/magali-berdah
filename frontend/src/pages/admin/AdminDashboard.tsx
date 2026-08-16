import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Users, Package, ShoppingBag, TrendingUp, Eye, Mail, Star, Clock, Trash2, ChevronRight, Save, CalendarDays, Search, X } from 'lucide-react';
import { STATIC_ITEMS, getAllItems } from '../../lib/staticItems';
import { getSharedItems } from '../../lib/marketplace';

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

function ArticlePickerModal({ exclusiveIds, onAdd, onClose }: { exclusiveIds: string[]; onAdd: (id: string) => void; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const local = getAllItems();
    setItems(local);
    getSharedItems({ limit: 50 }).then(remote => {
      const merged = [...new Map([...local, ...remote].map(i => [i.id, i])).values()];
      setItems(merged);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i =>
    !exclusiveIds.includes(i.id) &&
    (!search || `${i.title} ${i.brand}`.toLowerCase().includes(search.toLowerCase()))
  );

  const photo = (i: any) => i.photos?.[0] || i.image || i.images?.[0];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: '100%', maxHeight: '85vh', backgroundColor: '#0f0f0f', borderRadius: '16px 16px 0 0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: 'white', fontWeight: 400 }}>Ajouter à la sélection</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: '4px' }}><X size={20} /></button>
        </div>
        {/* Search */}
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px' }}>
            <Search size={15} color="rgba(255,255,255,0.4)" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
              autoFocus
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '16px' }} />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}><X size={14} /></button>}
          </div>
        </div>
        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
          {loading && <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', padding: '2rem' }}>Chargement...</p>}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', marginBottom: '1rem' }}>Aucun article trouvé</p>
              <Link to="/admin/articles/nouveau" onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.3)', padding: '8px 16px', borderRadius: '20px' }}>
                + Créer un nouvel article
              </Link>
            </div>
          )}
          {filtered.map((item: any) => (
            <div key={item.id} onClick={() => { onAdd(item.id); }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
              onTouchStart={e => (e.currentTarget.style.backgroundColor = 'rgba(201,169,110,0.08)')}
              onTouchEnd={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(201,169,110,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {photo(item) ? (
                <img src={photo(item)} alt="" style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '52px', height: '52px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: 'white', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#c9a96e', marginTop: '2px' }}>{item.brand}</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>
                  {item.auction_enabled ? 'Enchère' : 'Vente directe'} · {(item.fixed_price || item.auction_start_price || 0).toLocaleString('fr-FR')} €
                </p>
              </div>
              <div style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid rgba(201,169,110,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#c9a96e', fontSize: '1rem', lineHeight: 1 }}>+</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <Link to="/admin/articles/nouveau" onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', backgroundColor: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.25)', borderRadius: '8px', padding: '11px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#c9a96e' }}>
            <ChevronRight size={14} /> Créer un nouvel article
          </Link>
        </div>
      </div>
    </div>
  );
}

function ExclusiveWidget() {
  const [settings, setSettings] = useState(getExclusiveSettings);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(() => isNowOpen(getExclusiveSettings().open_date, getExclusiveSettings().open_time, getExclusiveSettings().close_time));
  const [showModal, setShowModal] = useState(false);
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
  };

  const allItems = getAllItems();
  const exclusiveItems = allItems.filter((i: any) => settings.exclusive_ids.includes(i.id));

  const statusColor = open ? '#2e7d32' : settings.open_date < today ? '#cc0000' : '#856404';
  const statusBg = open ? '#d4edda' : settings.open_date < today ? '#f8d7da' : '#fff3cd';
  const statusLabel = open
    ? `Ouverte · ferme à ${settings.close_time}`
    : settings.open_date < today
      ? 'Session terminée'
      : `${settings.open_date === today ? 'Aujourd\'hui' : new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(new Date(settings.open_date + 'T12:00'))} à ${settings.open_time}`;

  const inp: React.CSSProperties = { border: '1px solid rgba(201,169,110,0.35)', padding: '10px 12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '16px', backgroundColor: 'rgba(255,255,255,0.06)', color: 'white', borderRadius: '8px', width: '100%', boxSizing: 'border-box', colorScheme: 'dark' as any };

  return (
    <>
      {showModal && <ArticlePickerModal exclusiveIds={settings.exclusive_ids} onAdd={addItem} onClose={() => setShowModal(false)} />}

      <div style={{ backgroundColor: '#0f0f0f', border: '1px solid rgba(201,169,110,0.25)', borderRadius: '12px', marginBottom: '1.5rem', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={13} color="#c9a96e" fill="#c9a96e" />
            <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#c9a96e' }}>VENTE EXCLUSIVE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: statusBg, padding: '4px 10px', borderRadius: '20px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusColor, flexShrink: 0 }} />
            <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.58rem', color: statusColor }}>{statusLabel}</span>
          </div>
        </div>

        {/* Horaires — vertical sur mobile */}
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.55rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={10} /> HORAIRES (HEURE DE PARIS)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}><CalendarDays size={11} /> Date</span>
              <input type="date" value={settings.open_date} min={today} onChange={e => setSettings(s => ({ ...s, open_date: e.target.value }))} style={inp} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>Ouverture</span>
              <input type="time" value={settings.open_time} onChange={e => setSettings(s => ({ ...s, open_time: e.target.value }))} style={inp} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>Fermeture</span>
              <input type="time" value={settings.close_time} onChange={e => setSettings(s => ({ ...s, close_time: e.target.value }))} style={inp} />
            </div>
          </div>
          <button onClick={save} style={{ marginTop: '12px', width: '100%', padding: '11px', backgroundColor: saved ? '#2e7d32' : '#c9a96e', border: 'none', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background 0.3s' }}>
            <Save size={14} /> {saved ? '✓ ENREGISTRÉ' : 'ENREGISTRER LES HORAIRES'}
          </button>
        </div>

        {/* Articles sélection */}
        <div style={{ padding: '0.875rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.55rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)' }}>
              SÉLECTION · {exclusiveItems.length} article{exclusiveItems.length !== 1 ? 's' : ''}
            </p>
            <button onClick={() => setShowModal(true)} style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: '20px', padding: '6px 14px', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#c9a96e' }}>
              + Ajouter
            </button>
          </div>
          {exclusiveItems.length === 0 && (
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '0.75rem 0' }}>Aucun article</p>
          )}
          {exclusiveItems.map((item: any) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {(item.photos?.[0] || item.image) && (
                <img src={item.photos?.[0] || item.image} alt="" style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#c9a96e' }}>{item.brand}</p>
              </div>
              <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', padding: '6px', flexShrink: 0 }}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
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
