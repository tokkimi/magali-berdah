import { useEffect, useRef, useState } from 'react';
import { useStore, useT } from '../lib/store';
import { api } from '../lib/api';
import {
  User, Package, Gavel, Heart, Truck, ExternalLink, Send,
  ShoppingBag, Wallet, CheckCircle, CreditCard, Building2, Plus, Minus, Radio, Camera, Lock,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllItems } from '../lib/staticItems';
import ItemCard from '../components/ItemCard';
import WhatnotProfilePanel from '../components/WhatnotProfilePanel';
import { getSavedWhatnotToken } from '../lib/whatnot';
import { getMyAuctionWins } from '../lib/marketplace';
import { supabase } from '../lib/supabase';
import { uploadFile } from '../lib/api';

function isAmbassador(email: string): boolean {
  try { return (JSON.parse(localStorage.getItem('mb_ambassadors') || '[]') as string[]).includes(email); } catch { return false; }
}
function getWhatnotUsername(email: string): string {
  return localStorage.getItem(`mb_whatnot_${email}`) || '';
}
function saveWhatnotUsername(email: string, username: string) {
  localStorage.setItem(`mb_whatnot_${email}`, username);
}
function getLives(): any[] {
  try { return JSON.parse(localStorage.getItem('mb_lives') || '[]'); } catch { return []; }
}
function saveLives(lives: any[]) {
  localStorage.setItem('mb_lives', JSON.stringify(lives));
}

function loadMyOrders(userId: string, userEmail: string): any[] {
  try {
    const all = JSON.parse(localStorage.getItem('mb_orders') || '[]');
    return all.filter((o: any) => o.buyer_id === userId || o.buyer_email === userEmail);
  } catch { return []; }
}

function getWallet(email: string) {
  try {
    const w = JSON.parse(localStorage.getItem('mb_wallet') || '{}');
    return w[email] || { pending: 0, available: 0, transactions: [] };
  } catch { return { pending: 0, available: 0, transactions: [] }; }
}
function saveWallet(email: string, data: any) {
  try {
    const w = JSON.parse(localStorage.getItem('mb_wallet') || '{}');
    w[email] = data;
    localStorage.setItem('mb_wallet', JSON.stringify(w));
  } catch {}
}

function getPaymentMethod(email: string) {
  try { return JSON.parse(localStorage.getItem(`mb_pm_${email}`) || 'null'); } catch { return null; }
}
function getBankDetails(email: string) {
  try { return JSON.parse(localStorage.getItem(`mb_bank_${email}`) || 'null'); } catch { return null; }
}

export default function Profile() {
  const t = useT();
  const { user, updateUser, favIds } = useStore();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(() => searchParams.get('onglet') === 'live' ? 'live' : 'profile');
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    address: user?.address || '', city: user?.city || '',
    country: user?.country || 'FR', dob: user?.dob || '',
    avatar: user?.avatar || (user ? localStorage.getItem(`mb_avatar_${user.email}`) || '' : ''),
  });
  const [saved, setSaved] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email change
  const [emailEdit, setEmailEdit] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Password change
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>({ pending: 0, available: 0, transactions: [] });
  const [auctionWins, setAuctionWins] = useState<any[]>([]);

  // Payment method state
  const [pm, setPm] = useState<any>(null);
  const [pmForm, setPmForm] = useState({ number: '', expiry: '', holder: '' });
  const [pmEdit, setPmEdit] = useState(false);
  const [pmSaved, setPmSaved] = useState(false);

  // Bank details state
  const [bank, setBank] = useState<any>(null);
  const [bankForm, setBankForm] = useState({ iban: '', bic: '', holder: '' });
  const [bankEdit, setBankEdit] = useState(false);
  const [bankSaved, setBankSaved] = useState(false);

  // Wallet top-up state
  const [topupAmount, setTopupAmount] = useState('');
  const [topupDone, setTopupDone] = useState(false);
  const [transferDone, setTransferDone] = useState(false);

  // Whatnot
  const [whatnotInput, setWhatnotInput] = useState(() => user ? getWhatnotUsername(user.email) : '');
  const [whatnotSaved, setWhatnotSaved] = useState(false);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (tab === 'orders') {
      const local = loadMyOrders(user.id, user.email);
      setOrders(local);
      api.get('/orders/mine').then(d => {
        if (d.orders?.length) setOrders(d.orders);
      }).catch(() => {});
    }
    if (tab === 'wallet' || tab === 'profile') {
      setWallet(getWallet(user.email));
    }
    if (tab === 'profile') {
      setPm(getPaymentMethod(user.email));
      setBank(getBankDetails(user.email));
    }
    if (tab === 'bids') getMyAuctionWins().then(setAuctionWins).catch(() => setAuctionWins([]));
  }, [tab, user]);

  // Always load wallet for header display
  useEffect(() => {
    if (user) setWallet(getWallet(user.email));
  }, [user]);

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      // Try backend upload first
      const url = await uploadFile(file);
      setForm(x => ({ ...x, avatar: url }));
      updateUser({ avatar: url });
    } catch {
      // Fallback: store as base64 in localStorage (cap at 500KB to avoid quota errors)
      if (file.size > 500 * 1024) {
        setAvatarUploading(false);
        return;
      }
      const reader = new FileReader();
      reader.onload = ev => {
        const b64 = ev.target?.result as string;
        setForm(x => ({ ...x, avatar: b64 }));
        updateUser({ avatar: b64 });
        try { localStorage.setItem(`mb_avatar_${user?.email}`, b64); } catch {}
      };
      reader.readAsDataURL(file);
    } finally {
      setAvatarUploading(false);
    }
  };

  const saveProfile = async () => {
    try {
      const data = await api.put('/auth/me', form);
      updateUser(data.user);
    } catch { updateUser(form); }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const changeEmail = async () => {
    if (!newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) { setEmailError('Email invalide'); return; }
    setEmailError('');
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
      setEmailSaved(true);
      setEmailEdit(false);
      setTimeout(() => setEmailSaved(false), 5000);
    } catch (e: any) {
      setEmailError(e.message || 'Erreur lors du changement d\'email');
    }
  };

  const changePassword = async () => {
    setPwError('');
    if (!pwForm.current) { setPwError('Veuillez saisir votre mot de passe actuel'); return; }
    if (!pwForm.next || pwForm.next.length < 8) { setPwError('Le nouveau mot de passe doit faire au moins 8 caractères'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError('Les mots de passe ne correspondent pas'); return; }
    setPwLoading(true);
    try {
      // Reauthenticate with current password first
      const { error: reAuthError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: pwForm.current,
      });
      if (reAuthError) { setPwError('Mot de passe actuel incorrect'); setPwLoading(false); return; }
      const { error } = await supabase.auth.updateUser({ password: pwForm.next });
      if (error) throw error;
      setPwSaved(true);
      setPwForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setPwSaved(false), 4000);
    } catch (e: any) {
      setPwError(e.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setPwLoading(false);
    }
  };

  const savePaymentMethod = () => {
    if (!user || !pmForm.number || !pmForm.expiry || !pmForm.holder) return;
    const last4 = pmForm.number.replace(/\s/g, '').slice(-4);
    const saved = { last4, expiry: pmForm.expiry, holder: pmForm.holder };
    localStorage.setItem(`mb_pm_${user.email}`, JSON.stringify(saved));
    setPm(saved);
    setPmEdit(false);
    setPmSaved(true);
    setTimeout(() => setPmSaved(false), 3000);
  };

  const saveBankDetails = () => {
    if (!user || !bankForm.iban || !bankForm.holder) return;
    const data = { iban: bankForm.iban.trim().toUpperCase(), bic: bankForm.bic.trim().toUpperCase(), holder: bankForm.holder.trim() };
    localStorage.setItem(`mb_bank_${user.email}`, JSON.stringify(data));
    setBank(data);
    setBankEdit(false);
    setBankSaved(true);
    setTimeout(() => setBankSaved(false), 3000);
  };

  const confirmReceived = (order: any) => {
    const all = JSON.parse(localStorage.getItem('mb_orders') || '[]');
    const updated = all.map((o: any) => o.id === order.id
      ? { ...o, shipping_status: 'delivered', buyer_confirmed: true, wallet_credited: true }
      : o
    );
    localStorage.setItem('mb_orders', JSON.stringify(updated));
    setOrders(prev => prev.map(o => o.id === order.id
      ? { ...o, shipping_status: 'delivered', buyer_confirmed: true }
      : o
    ));
    if (order.seller_email && order.seller_payout && !order.wallet_credited) {
      const w = getWallet(order.seller_email);
      w.pending = Math.max(0, (w.pending || 0) - order.seller_payout);
      w.available = (w.available || 0) + order.seller_payout;
      w.transactions = (w.transactions || []).map((tx: any) =>
        tx.order_id === order.id ? { ...tx, status: 'available' } : tx
      );
      saveWallet(order.seller_email, w);
      if (order.seller_email === user?.email) setWallet({ ...w });
    }
  };

  const topUp = () => {
    if (!user) return;
    const amount = parseFloat(topupAmount);
    if (isNaN(amount) || amount <= 0) return;
    const w = getWallet(user.email);
    w.available = (w.available || 0) + amount;
    w.transactions = [...(w.transactions || []), {
      id: `tx-${Date.now()}`, item_title: 'Rechargement cagnotte',
      amount, type: 'topup', status: 'available', date: new Date().toISOString(),
    }];
    saveWallet(user.email, w);
    setWallet({ ...w });
    setTopupAmount('');
    setTopupDone(true);
    setTimeout(() => setTopupDone(false), 3000);
  };

  const requestTransfer = () => {
    if (!user || wallet.available <= 0) return;
    const w = { ...wallet };
    const amount = w.available;
    w.transactions = [...(w.transactions || []), {
      id: `tx-${Date.now()}`, item_title: 'Virement demandé',
      amount, type: 'transfer', status: 'requested', date: new Date().toISOString(),
    }];
    w.available = 0;
    saveWallet(user.email, w);
    setWallet(w);
    setTransferDone(true);
    setTimeout(() => setTransferDone(false), 5000);
  };

  const favItems = getAllItems().filter((item: any) => favIds.has(item.id));
  const mySellerItems = user ? getAllItems().filter((item: any) => item.seller_email === user.email) : [];
  const totalBalance = (wallet.available || 0) + (wallet.pending || 0);
  const userIsAmbassador = user ? (user.role === 'admin' || isAmbassador(user.email)) : false;

  useEffect(() => {
    if (!user) return;
    const lives = getLives();
    setIsLive(lives.some((l: any) => l.user_email === user.email && l.is_live));
  }, [user]);

  const saveWhatnot = () => {
    if (!user) return;
    saveWhatnotUsername(user.email, whatnotInput.trim().replace('@', ''));
    setWhatnotSaved(true);
    setTimeout(() => setWhatnotSaved(false), 3000);
  };

  const goLive = () => {
    if (!user) return;
    const username = getWhatnotUsername(user.email);
    if (!username) { alert('Entrez d\'abord votre pseudo Whatnot.'); return; }
    const lives = getLives();
    const existing = lives.find((l: any) => l.user_email === user.email);
    if (existing) {
      existing.is_live = true;
      existing.started_at = new Date().toISOString();
    } else {
      lives.push({ id: `live_${Date.now()}`, user_email: user.email, whatnot_username: username, display_name: user.name, started_at: new Date().toISOString(), is_live: true, avatar: user.avatar || null });
    }
    saveLives(lives);
    setIsLive(true);
    window.open(`https://www.whatnot.com/${username}`, '_blank');
  };

  const stopLive = () => {
    if (!user) return;
    const lives = getLives().map((l: any) => l.user_email === user.email ? { ...l, is_live: false } : l);
    saveLives(lives);
    setIsLive(false);
  };

  const tabs = [
    { id: 'profile', label: 'Mon profil', icon: User },
    { id: 'live', label: 'Live Whatnot', icon: Radio },
    { id: 'orders', label: 'Mes achats', icon: Package },
    { id: 'bids', label: 'Mes enchères', icon: Gavel },
    { id: 'wallet', label: 'Cagnotte', icon: Wallet },
    ...(mySellerItems.length > 0 ? [{ id: 'my-items', label: 'Mes articles', icon: ShoppingBag }] : []),
    { id: 'submissions', label: 'Soumissions', icon: Send },
    { id: 'favorites', label: 'Favoris', icon: Heart },
  ];

  if (!user) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem 5rem' }}>
      <style>{`
        .profile-tabs { display: flex; flex-direction: column; gap: 0; width: 190px; flex-shrink: 0; }
        .profile-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 700px) {
          .profile-layout { flex-direction: column !important; }
          .profile-tabs { flex-direction: row !important; width: 100% !important; overflow-x: auto; border-bottom: 1px solid #e8d5b7; margin-bottom: 1rem; padding-bottom: 0; gap: 0 !important; }
          .profile-tab-btn { border-left: none !important; border-bottom: 2px solid transparent; flex-shrink: 0; padding: 10px 10px !important; }
          .profile-tab-btn.active { border-left: none !important; border-bottom: 2px solid #c9a96e !important; }
          .profile-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e8d5b7', paddingBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ width: '60px', height: '60px', backgroundColor: '#f8f4ef', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #c9a96e', flexShrink: 0, overflow: 'hidden' }}>
          {form.avatar ? (
            <img src={form.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#c9a96e' }}>{user.name[0]?.toUpperCase()}</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 400, color: '#1a1a1a' }}>{user.name}</h1>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#9e8e7e' }}>{user.email}</p>
          {user.verified && <span style={{ color: '#2e7d32', fontSize: '0.72rem', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>✓ Compte vérifié</span>}
        </div>
        {/* Wallet balance badge — toujours visible */}
        <button onClick={() => setTab('wallet')}
          style={{ background: totalBalance > 0 ? 'linear-gradient(135deg, #c9a96e, #a8834a)' : '#f8f4ef', border: totalBalance > 0 ? 'none' : '1px solid #e8d5b7', padding: '10px 16px', cursor: 'pointer', textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.55rem', letterSpacing: '0.15em', color: totalBalance > 0 ? 'rgba(255,255,255,0.8)' : '#9e8e7e', marginBottom: '2px' }}>MA CAGNOTTE</p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', color: totalBalance > 0 ? 'white' : '#1a1a1a', lineHeight: 1 }}>
            {totalBalance.toLocaleString('fr-FR')} €
          </p>
          {wallet.available > 0 && (
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.55rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
              {wallet.available.toLocaleString('fr-FR')} € disponible
            </p>
          )}
        </button>
      </div>

      <div className="profile-layout" style={{ display: 'flex', gap: '2rem' }}>
        {/* Tab nav */}
        <nav className="profile-tabs">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`profile-tab-btn${tab === id ? ' active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderLeft: tab === id ? '2px solid #c9a96e' : '2px solid transparent', color: tab === id ? '#c9a96e' : '#1a1a1a', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', marginBottom: '4px', whiteSpace: 'nowrap' }}>
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        <div style={{ flex: 1, minWidth: 0 }}>

          {tab === 'live' && <WhatnotProfilePanel />}

          {/* ── MON PROFIL ── */}
          {tab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Informations personnelles */}
              <section style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem' }}>
                <p style={sectionLabel}>INFORMATIONS PERSONNELLES</p>
                {/* Avatar upload */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: '2px solid #c9a96e', overflow: 'hidden', backgroundColor: '#f8f4ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {form.avatar ? (
                        <img src={form.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', color: '#c9a96e' }}>{user.name[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} disabled={avatarUploading}
                      style={{ position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#1a1a1a', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Camera size={12} color="#c9a96e" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarFile} />
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#1a1a1a', fontWeight: 500 }}>{user.name}</p>
                    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#9e8e7e', marginTop: '2px' }}>{user.email}</p>
                    {avatarUploading && <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#c9a96e', marginTop: '4px' }}>Chargement…</p>}
                  </div>
                </div>

                <div className="profile-form-grid" style={{ gap: '1rem' }}>
                  {[
                    { label: 'Nom complet', key: 'name', type: 'text' },
                    { label: 'Téléphone', key: 'phone', type: 'tel' },
                    { label: 'Date de naissance', key: 'dob', type: 'date' },
                    { label: 'Adresse', key: 'address', type: 'text' },
                    { label: 'Ville', key: 'city', type: 'text' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={labelStyle}>{f.label.toUpperCase()}</label>
                      <input type={f.type} value={(form as any)[f.key]}
                        onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                        style={inputStyle} />
                    </div>
                  ))}
                  <div>
                    <label style={labelStyle}>PAYS</label>
                    <select value={form.country} onChange={e => setForm(x => ({ ...x, country: e.target.value }))} style={{ ...inputStyle, backgroundColor: 'white' }}>
                      {[['FR','France'],['BE','Belgique'],['CH','Suisse'],['LU','Luxembourg'],['MC','Monaco'],['GB','Royaume-Uni'],['US','États-Unis'],['AE','Émirats Arabes Unis']].map(([v,l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button onClick={saveProfile} className="btn-gold" style={{ fontSize: '0.78rem' }}>ENREGISTRER</button>
                  {saved && <span style={{ color: '#2e7d32', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem' }}>✓ Enregistré</span>}
                </div>
              </section>

              {/* Email */}
              <section style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <p style={sectionLabel}>ADRESSE EMAIL</p>
                  {!emailEdit && (
                    <button onClick={() => { setEmailEdit(true); setNewEmail(user.email); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#c9a96e' }}>
                      Modifier
                    </button>
                  )}
                </div>
                {emailEdit ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={labelStyle}>NOUVEL EMAIL</label>
                      <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={inputStyle} />
                    </div>
                    {emailError && <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#cc0000' }}>{emailError}</p>}
                    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.68rem', color: '#9e8e7e' }}>
                      Un email de confirmation sera envoyé à la nouvelle adresse.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button onClick={changeEmail} className="btn-gold" style={{ fontSize: '0.75rem' }}>CONFIRMER</button>
                      <button onClick={() => setEmailEdit(false)} style={{ background: 'none', border: '1px solid #e8d5b7', padding: '8px 16px', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e' }}>ANNULER</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.88rem', color: '#1a1a1a' }}>{user.email}</p>
                    {emailSaved && <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#2e7d32', marginTop: '6px' }}>✓ Email de confirmation envoyé à {newEmail}</p>}
                  </div>
                )}
              </section>

              {/* Mot de passe */}
              <section style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                  <Lock size={14} color="#c9a96e" />
                  <p style={sectionLabel}>MOT DE PASSE</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={labelStyle}>NOUVEAU MOT DE PASSE</label>
                    <input type="password" value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                      placeholder="8 caractères minimum" autoComplete="new-password" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>CONFIRMER LE MOT DE PASSE</label>
                    <input type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                      autoComplete="new-password" style={inputStyle} />
                  </div>
                  {pwError && <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#cc0000' }}>{pwError}</p>}
                  {pwSaved && <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#2e7d32' }}>✓ Mot de passe mis à jour</p>}
                  <button onClick={changePassword} disabled={pwLoading || !pwForm.next} className="btn-gold" style={{ fontSize: '0.75rem', opacity: (!pwForm.next || pwLoading) ? 0.5 : 1 }}>
                    {pwLoading ? 'ENREGISTREMENT…' : 'CHANGER LE MOT DE PASSE'}
                  </button>
                </div>
              </section>

              {/* Compte Whatnot */}
              <section style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem' }}>
                <p style={sectionLabel}>COMPTE WHATNOT</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '.75rem', color: '#666', marginBottom: '1rem' }}>
                  {getSavedWhatnotToken(user?.email) ? 'Votre accès Whatnot est enregistré sur cet appareil.' : 'Après validation par l’administration, connectez votre accès une seule fois.'}
                </p>
                <button onClick={() => setTab('live')} className="btn-gold" style={{ display: 'inline-block', fontSize: '.75rem' }}>
                  {getSavedWhatnotToken(user?.email) ? 'PASSER EN LIVE' : 'CONNECTER WHATNOT'}
                </button>
              </section>

              {/* Moyen de paiement */}
              <section style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <p style={sectionLabel}>MOYEN DE PAIEMENT</p>
                  {pm && !pmEdit && (
                    <button onClick={() => { setPmEdit(true); setPmForm({ number: '', expiry: pm.expiry, holder: pm.holder }); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#c9a96e' }}>
                      Modifier
                    </button>
                  )}
                </div>
                {pm && !pmEdit ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '32px', backgroundColor: '#1a1a2e', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard size={20} color="white" />
                    </div>
                    <div>
                      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.88rem', color: '#1a1a1a' }}>•••• •••• •••• {pm.last4}</p>
                      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#9e8e7e' }}>{pm.holder} · Expire {pm.expiry}</p>
                    </div>
                    {pmSaved && <span style={{ color: '#2e7d32', fontSize: '0.75rem', fontFamily: 'Helvetica Neue, Arial, sans-serif', marginLeft: 'auto' }}>✓ Enregistré</span>}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={labelStyle}>NUMÉRO DE CARTE</label>
                      <input value={pmForm.number} onChange={e => setPmForm(f => ({ ...f, number: e.target.value }))}
                        placeholder="1234 5678 9012 3456" maxLength={19} style={inputStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={labelStyle}>DATE D'EXPIRATION</label>
                        <input value={pmForm.expiry} onChange={e => setPmForm(f => ({ ...f, expiry: e.target.value }))}
                          placeholder="MM/AA" maxLength={5} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>TITULAIRE</label>
                        <input value={pmForm.holder} onChange={e => setPmForm(f => ({ ...f, holder: e.target.value }))}
                          placeholder="Prénom Nom" style={inputStyle} />
                      </div>
                    </div>
                    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#9e8e7e' }}>
                      🔒 Vos données sont stockées de façon sécurisée
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button onClick={savePaymentMethod} className="btn-gold" style={{ fontSize: '0.75rem' }}>ENREGISTRER LA CARTE</button>
                      {pm && <button onClick={() => setPmEdit(false)} style={{ background: 'none', border: '1px solid #e8d5b7', padding: '8px 16px', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e' }}>ANNULER</button>}
                    </div>
                  </div>
                )}
              </section>

              {/* Coordonnées bancaires */}
              <section style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <p style={sectionLabel}>COORDONNÉES BANCAIRES (virement cagnotte)</p>
                  {bank && !bankEdit && (
                    <button onClick={() => { setBankEdit(true); setBankForm({ iban: bank.iban, bic: bank.bic, holder: bank.holder }); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#c9a96e' }}>
                      Modifier
                    </button>
                  )}
                </div>
                {bank && !bankEdit ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Building2 size={28} color="#c9a96e" />
                    <div>
                      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#1a1a1a' }}>{bank.iban}</p>
                      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#9e8e7e' }}>{bank.holder} {bank.bic ? `· BIC : ${bank.bic}` : ''}</p>
                    </div>
                    {bankSaved && <span style={{ color: '#2e7d32', fontSize: '0.75rem', fontFamily: 'Helvetica Neue, Arial, sans-serif', marginLeft: 'auto' }}>✓ Enregistré</span>}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={labelStyle}>IBAN *</label>
                      <input value={bankForm.iban} onChange={e => setBankForm(f => ({ ...f, iban: e.target.value }))}
                        placeholder="FR76 3000 6000 0112 3456 7890 189" style={inputStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={labelStyle}>BIC / SWIFT</label>
                        <input value={bankForm.bic} onChange={e => setBankForm(f => ({ ...f, bic: e.target.value }))}
                          placeholder="BNPAFRPP" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>TITULAIRE DU COMPTE *</label>
                        <input value={bankForm.holder} onChange={e => setBankForm(f => ({ ...f, holder: e.target.value }))}
                          placeholder="Prénom Nom" style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button onClick={saveBankDetails} className="btn-gold" style={{ fontSize: '0.75rem' }}>ENREGISTRER</button>
                      {bank && <button onClick={() => setBankEdit(false)} style={{ background: 'none', border: '1px solid #e8d5b7', padding: '8px 16px', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e' }}>ANNULER</button>}
                    </div>
                  </div>
                )}
              </section>

              {/* Whatnot — ambassador only */}
              {userIsAmbassador && (
                <section style={{ backgroundColor: 'white', border: '1px solid #e53935', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                    <Radio size={16} color="#e53935" />
                    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#e53935', fontWeight: 700 }}>COMPTE WHATNOT · AMBASSADEUR</p>
                  </div>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', marginBottom: '1rem' }}>
                    Connectez votre compte Whatnot pour apparaître en direct sur le site lors de vos lives.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <label style={labelStyle}>PSEUDO WHATNOT</label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e8d5b7' }}>
                        <span style={{ padding: '8px 10px', backgroundColor: '#f8f4ef', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#9e8e7e', borderRight: '1px solid #e8d5b7' }}>@</span>
                        <input value={whatnotInput} onChange={e => setWhatnotInput(e.target.value.replace('@', ''))}
                          placeholder="votre_pseudo" style={{ ...inputStyle, border: 'none', borderRadius: 0 }} />
                      </div>
                    </div>
                    <button onClick={saveWhatnot} style={{ backgroundColor: '#1a1a1a', color: 'white', border: 'none', padding: '9px 18px', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', letterSpacing: '0.1em', marginTop: '16px' }}>
                      ENREGISTRER
                    </button>
                    {whatnotSaved && <span style={{ color: '#2e7d32', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', marginTop: '16px' }}>✓ Enregistré</span>}
                  </div>
                  {getWhatnotUsername(user.email) && (
                    <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {isLive ? (
                        <button onClick={stopLive}
                          style={{ backgroundColor: '#cc0000', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', letterSpacing: '0.1em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          ⏹ ARRÊTER LE LIVE
                        </button>
                      ) : (
                        <button onClick={goLive}
                          style={{ backgroundColor: '#e53935', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', letterSpacing: '0.1em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Radio size={14} /> PASSER EN LIVE
                        </button>
                      )}
                      <a href={`https://www.whatnot.com/${getWhatnotUsername(user.email)}`} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', padding: '10px 0' }}>
                        Voir mon profil Whatnot <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}

          {/* ── MES ACHATS ── */}
          {tab === 'orders' && (
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 400, marginBottom: '1.25rem', color: '#1a1a1a' }}>Mes achats</h2>
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9e8e7e' }}>
                  <Package size={40} color="#e8d5b7" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem' }}>Aucun achat pour le moment</p>
                </div>
              ) : orders.map(o => (
                <div key={o.id} style={{ border: `1px solid ${o.buyer_confirmed ? '#c3e6cb' : o.shipping_status === 'shipped' ? '#bee5eb' : '#e8d5b7'}`, marginBottom: '1rem', overflow: 'hidden' }}>
                  <div style={{ padding: '6px 14px', backgroundColor: o.buyer_confirmed ? '#d4edda' : o.shipping_status === 'shipped' ? '#d1ecf1' : o.payment_status === 'paid' ? '#fff3cd' : '#f8f4ef', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {o.buyer_confirmed
                      ? <><CheckCircle size={13} color="#2e7d32" /><span style={{ color: '#2e7d32', fontSize: '0.72rem', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontWeight: 700 }}>REÇU — MERCI !</span></>
                      : o.shipping_status === 'shipped'
                      ? <><Truck size={13} color="#1976d2" /><span style={{ color: '#1976d2', fontSize: '0.72rem', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontWeight: 700 }}>EN COURS DE LIVRAISON</span></>
                      : o.payment_status === 'paid'
                      ? <span style={{ color: '#856404', fontSize: '0.72rem', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontWeight: 700 }}>✓ PAYÉ — PRÉPARATION EN COURS</span>
                      : <span style={{ color: '#9e8e7e', fontSize: '0.72rem', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>PAIEMENT EN ATTENTE</span>
                    }
                    {o.payment_via_wallet && (
                      <span style={{ marginLeft: 'auto', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#c9a96e' }}>
                        💰 Payé par cagnotte
                      </span>
                    )}
                  </div>

                  <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#1a1a1a', marginBottom: '4px' }}>{o.item_title}</p>
                      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e' }}>
                        {new Date(o.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#1a1a1a' }}>
                      {(o.amount || 0).toLocaleString('fr-FR')} €
                    </p>
                  </div>

                  {o.tracking_number && (
                    <div style={{ margin: '0 1.25rem 1rem', padding: '12px 14px', backgroundColor: '#f0f7ff', borderLeft: '3px solid #1976d2' }}>
                      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#1976d2', marginBottom: '6px' }}>SUIVI D'ENVOI</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1a1a1a' }}>
                          {o.carrier_label} · <strong>{o.tracking_number}</strong>
                        </p>
                        {o.tracking_url && (
                          <a href={o.tracking_url} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px', backgroundColor: '#1976d2', color: 'white', textDecoration: 'none', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', borderRadius: '4px', marginLeft: 'auto' }}>
                            <Truck size={13} /> SUIVRE MON COLIS <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div style={{ padding: '0 1.25rem 1rem', display: 'flex', alignItems: 'center' }}>
                    {[
                      { label: 'Commandé', done: true },
                      { label: 'Payé', done: o.payment_status === 'paid' },
                      { label: 'Expédié', done: o.shipping_status === 'shipped' || o.buyer_confirmed },
                      { label: 'Reçu', done: !!o.buyer_confirmed },
                    ].map((step, i, arr) => (
                      <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: i < arr.length - 1 ? 1 : 0 }}>
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: step.done ? '#c9a96e' : '#e8d5b7', margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {step.done && <span style={{ color: 'white', fontSize: '11px' }}>✓</span>}
                          </div>
                          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.55rem', color: step.done ? '#c9a96e' : '#bbb', whiteSpace: 'nowrap' }}>{step.label}</p>
                        </div>
                        {i < arr.length - 1 && <div style={{ flex: 1, height: '2px', backgroundColor: step.done ? '#c9a96e' : '#e8d5b7', margin: '0 4px 14px' }} />}
                      </div>
                    ))}
                  </div>

                  {o.shipping_status === 'shipped' && !o.buyer_confirmed && (
                    <div style={{ padding: '0 1.25rem 1.25rem' }}>
                      <button onClick={() => confirmReceived(o)} className="btn-gold"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', fontSize: '0.78rem', padding: '12px' }}>
                        <CheckCircle size={16} /> J'AI BIEN REÇU MON COLIS
                      </button>
                      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#9e8e7e', textAlign: 'center', marginTop: '6px' }}>
                        Confirmez la réception pour valider la transaction
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── MES ENCHÈRES ── */}
          {tab === 'bids' && (
            <div>
              {auctionWins.map(win => (
                <div key={win.id} style={{ border: '2px solid #c9a96e', background: '#fff8e6', padding: '1.25rem', marginBottom: '1rem' }}>
                  <p style={{ color: '#2e7d32', fontWeight: 700, marginBottom: 6 }}>FÉLICITATIONS, VOUS AVEZ GAGNÉ L’ENCHÈRE !</p>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.05rem' }}>{win.auction_items?.title}</p>
                  <p style={{ marginTop: 6 }}>Montant gagnant : <strong>{Number(win.winning_amount).toLocaleString('fr-FR')} €</strong></p>
                  <p style={{ marginTop: 6, color: '#9e8e7e', fontSize: '.78rem' }}>Paiement : {win.payment_status === 'paid' ? 'payé' : 'en attente de paiement sécurisé'}</p>
                </div>
              ))}
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 400, marginBottom: '1.25rem', color: '#1a1a1a' }}>Mes enchères</h2>
              {(() => {
                try {
                  const bids: any[] = JSON.parse(localStorage.getItem('mb_bids') || '[]')
                    .filter((b: any) => b.user_id === user?.id || b.user_email === user?.email);
                  if (!bids.length) return (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9e8e7e' }}>
                      <Gavel size={40} color="#e8d5b7" style={{ margin: '0 auto 1rem' }} />
                      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem' }}>Vous n'avez pas encore participé à une enchère</p>
                    </div>
                  );
                  return bids.map(b => (
                    <div key={b.id} style={{ border: '1px solid #e8d5b7', padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#1a1a1a', marginBottom: '4px' }}>{b.item_title}</p>
                        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e' }}>
                          Votre enchère : <strong style={{ color: '#c9a96e' }}>{(b.amount || 0).toLocaleString('fr-FR')} €</strong>
                        </p>
                      </div>
                      <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: b.is_winning ? '#2e7d32' : '#ff9800' }}>
                        {b.is_winning ? '✓ Meilleure offre' : '↑ Surenchère possible'}
                      </span>
                    </div>
                  ));
                } catch { return null; }
              })()}
            </div>
          )}

          {/* ── CAGNOTTE ── */}
          {tab === 'wallet' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 400, color: '#1a1a1a' }}>Ma cagnotte</h2>

              {/* Solde */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ backgroundColor: wallet.available > 0 ? '#fff8e6' : 'white', border: `2px solid ${wallet.available > 0 ? '#c9a96e' : '#e8d5b7'}`, padding: '1.5rem', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#9e8e7e', marginBottom: '8px' }}>DISPONIBLE</p>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', color: wallet.available > 0 ? '#c9a96e' : '#1a1a1a' }}>
                    {(wallet.available || 0).toLocaleString('fr-FR')} €
                  </p>
                  {wallet.available > 0 && <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#a8834a', marginTop: '4px' }}>✓ Achat & virement possibles</p>}
                </div>
                <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#9e8e7e', marginBottom: '8px' }}>EN ATTENTE</p>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', color: '#9e8e7e' }}>{(wallet.pending || 0).toLocaleString('fr-FR')} €</p>
                  {wallet.pending > 0 && <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#9e8e7e', marginTop: '4px' }}>En attente réception acheteur</p>}
                </div>
              </div>

              {/* Recharger */}
              <section style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem' }}>
                <p style={sectionLabel}>RECHARGER MA CAGNOTTE</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', marginBottom: '1rem' }}>
                  Ajoutez des fonds pour acheter ou enchérir directement avec votre cagnotte
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {[50, 100, 200, 500].map(preset => (
                    <button key={preset} onClick={() => setTopupAmount(String(preset))}
                      style={{ padding: '8px 16px', border: `1px solid ${topupAmount === String(preset) ? '#c9a96e' : '#e8d5b7'}`, background: topupAmount === String(preset) ? '#fff8e6' : 'white', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: topupAmount === String(preset) ? '#a8834a' : '#1a1a1a' }}>
                      {preset} €
                    </button>
                  ))}
                  <input value={topupAmount} onChange={e => setTopupAmount(e.target.value)}
                    type="number" min="1" placeholder="Autre montant"
                    style={{ flex: 1, minWidth: '120px', ...inputStyle }} />
                </div>
                {!pm && (
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#ff9800', marginBottom: '8px' }}>
                    ⚠️ Ajoutez une carte de paiement dans Mon profil pour recharger
                  </p>
                )}
                <button onClick={topUp} disabled={!topupAmount || parseFloat(topupAmount) <= 0 || !pm}
                  className="btn-gold"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', opacity: (!topupAmount || parseFloat(topupAmount) <= 0 || !pm) ? 0.5 : 1 }}>
                  <Plus size={15} /> RECHARGER {topupAmount ? `${parseFloat(topupAmount).toLocaleString('fr-FR')} €` : ''}
                </button>
                {topupDone && (
                  <p style={{ color: '#2e7d32', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', marginTop: '8px' }}>
                    ✓ Cagnotte rechargée avec succès !
                  </p>
                )}
              </section>

              {/* Virement */}
              <section style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem' }}>
                <p style={sectionLabel}>DEMANDER UN VIREMENT</p>
                {!bank && (
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#ff9800', marginBottom: '1rem' }}>
                    ⚠️ Ajoutez vos coordonnées bancaires dans Mon profil pour demander un virement
                  </p>
                )}
                <button onClick={requestTransfer} disabled={wallet.available <= 0 || !bank}
                  className="btn-gold"
                  style={{ width: '100%', padding: '12px', fontSize: '0.78rem', letterSpacing: '0.1em', opacity: (wallet.available > 0 && bank) ? 1 : 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Minus size={15} /> VIRER {wallet.available > 0 ? `${wallet.available.toLocaleString('fr-FR')} €` : ''} SUR MON COMPTE
                </button>
                {wallet.available <= 0 && <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#9e8e7e', textAlign: 'center', marginTop: '6px' }}>Solde disponible insuffisant</p>}
                {transferDone && (
                  <div style={{ marginTop: '1rem', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', padding: '1rem', textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#2e7d32', fontWeight: 700 }}>✓ Demande envoyée !</p>
                    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#2e7d32', marginTop: '4px' }}>L'équipe vous contactera sous 2-3 jours ouvrés</p>
                  </div>
                )}
              </section>

              {/* Historique */}
              {wallet.transactions?.length > 0 && (
                <section style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem' }}>
                  <p style={sectionLabel}>HISTORIQUE</p>
                  {[...(wallet.transactions || [])].reverse().map((tx: any) => (
                    <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f0ece6' }}>
                      <div>
                        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#1a1a1a' }}>{tx.item_title}</p>
                        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#9e8e7e' }}>
                          {new Date(tx.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} ·{' '}
                          <span style={{ color: tx.status === 'available' ? '#2e7d32' : tx.status === 'requested' ? '#1976d2' : '#b45309' }}>
                            {tx.type === 'topup' ? 'Rechargement' : tx.type === 'transfer' ? 'Virement demandé' : tx.status === 'available' ? 'Disponible' : 'En attente'}
                          </span>
                        </p>
                      </div>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: tx.type === 'transfer' ? '#cc0000' : '#2e7d32', flexShrink: 0, marginLeft: '1rem' }}>
                        {tx.type === 'transfer' ? '-' : '+'}{tx.amount.toLocaleString('fr-FR')} €
                      </p>
                    </div>
                  ))}
                </section>
              )}
            </div>
          )}

          {/* ── MES ARTICLES (si vendeur) ── */}
          {tab === 'my-items' && (
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 400, marginBottom: '0.5rem', color: '#1a1a1a' }}>Mes articles en vente</h2>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', marginBottom: '1.5rem' }}>
                Articles mis en vente par Magali Berdah à partir de vos pièces
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {mySellerItems.map((item: any) => {
                  const isAuction = item.auction_enabled === 1;
                  const auctionEnded = isAuction && item.auction_end_time && new Date(item.auction_end_time) < new Date();
                  const isSold = item.status === 'sold';
                  return (
                    <div key={item.id} style={{ backgroundColor: 'white', border: `1px solid ${isSold || auctionEnded ? '#c3e6cb' : '#e8d5b7'}`, overflow: 'hidden' }}>
                      <div style={{ padding: '8px 16px', backgroundColor: isSold || auctionEnded ? '#d4edda' : isAuction ? '#fff8e6' : '#f8f4ef', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: isSold || auctionEnded ? '#2e7d32' : isAuction ? '#a8834a' : '#9e8e7e' }}>
                          {isSold ? 'VENDU' : auctionEnded ? 'ENCHÈRE TERMINÉE' : isAuction ? 'ENCHÈRE EN COURS' : 'EN VENTE'}
                        </span>
                        {item.seller_payout && (
                          <span style={{ marginLeft: 'auto', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#c9a96e', fontWeight: 700 }}>
                            Cagnotte : {item.seller_payout.toLocaleString('fr-FR')} €
                          </span>
                        )}
                      </div>
                      <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        {item.photos?.[0] && (
                          <img src={item.photos[0]} alt={item.title} style={{ width: '70px', height: '90px', objectFit: 'cover', flexShrink: 0 }}
                            onError={e => (e.currentTarget.style.display = 'none')} />
                        )}
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#c9a96e', marginBottom: '3px' }}>{item.brand?.toUpperCase()}</p>
                          <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#1a1a1a', marginBottom: '6px' }}>{item.title}</p>
                          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <div>
                              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', color: '#9e8e7e', letterSpacing: '0.1em' }}>{isAuction ? (auctionEnded ? 'PRIX FINAL' : 'OFFRE EN COURS') : 'PRIX'}</p>
                              <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#1a1a1a' }}>
                                {isAuction ? (item.current_bid || item.auction_start_price || 0).toLocaleString('fr-FR') : (item.fixed_price || 0).toLocaleString('fr-FR')} €
                              </p>
                            </div>
                            {item.seller_payout && (
                              <div>
                                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', color: '#9e8e7e', letterSpacing: '0.1em' }}>VOTRE CAGNOTTE</p>
                                <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: '#c9a96e' }}>{item.seller_payout.toLocaleString('fr-FR')} €</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <Link to={`/article/${item.id}`} style={{ flexShrink: 0, fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#c9a96e', textDecoration: 'none', marginTop: '4px' }}>
                          Voir →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── SOUMISSIONS ── */}
          {tab === 'submissions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 400, color: '#1a1a1a' }}>Mes soumissions</h2>
                <Link to="/mes-soumissions" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#c9a96e', textDecoration: 'none' }}>Voir tout →</Link>
              </div>
              {(() => {
                try {
                  const mine = (JSON.parse(localStorage.getItem('mb_submissions') || '[]') as any[]).filter((s: any) => s.email === user?.email);
                  if (!mine.length) return (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#9e8e7e' }}>
                      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', marginBottom: '1rem' }}>Aucune soumission</p>
                      <Link to="/soumettre" className="btn-gold" style={{ fontSize: '0.72rem', textDecoration: 'none' }}>SOUMETTRE UN ARTICLE</Link>
                    </div>
                  );
                  const colors: Record<string, string> = { pending: '#b45309', approved: '#2e7d32', rejected: '#cc0000' };
                  const labels: Record<string, string> = { pending: 'En cours de révision', approved: 'Validé ✓', rejected: 'Rejeté' };
                  return mine.map((s: any) => (
                    <div key={s.id} style={{ border: '1px solid #e8d5b7', padding: '1rem 1.25rem', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: '#1a1a1a', marginBottom: '3px' }}>{s.brand}</p>
                        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e' }}>{s.category}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: colors[s.status] || '#9e8e7e' }}>{labels[s.status] || s.status}</p>
                        {s.status === 'approved' && !s.tracking_sent && (
                          <Link to="/mes-soumissions" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#1976d2', textDecoration: 'none' }}>→ Entrer le numéro de suivi</Link>
                        )}
                      </div>
                    </div>
                  ));
                } catch { return null; }
              })()}
            </div>
          )}

          {/* ── FAVORIS ── */}
          {tab === 'favorites' && (
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 400, marginBottom: '1.25rem', color: '#1a1a1a' }}>Mes favoris</h2>
              {favItems.length === 0 ? (
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#9e8e7e', textAlign: 'center', padding: '2rem' }}>Aucun favori</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                  {favItems.map((item: any) => <ItemCard key={item.id} item={item} />)}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem',
  letterSpacing: '0.2em', color: '#c9a96e', marginBottom: '1rem',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'Helvetica Neue, Arial, sans-serif',
  fontSize: '0.65rem', letterSpacing: '0.1em', color: '#9e8e7e', marginBottom: '6px',
};
const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid #e8d5b7', padding: '10px 12px',
  fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#1a1a1a',
  boxSizing: 'border-box',
};
