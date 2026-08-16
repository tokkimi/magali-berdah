import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Ban, UserCheck, Copy, Radio } from 'lucide-react';
import { adminConnectWhatnot, adminListAmbassadorRequests, adminReviewAmbassadorRequest } from '../../lib/whatnot';
import { supabase } from '../../lib/supabase';
function getAmbassadors(): string[] {
  try { return JSON.parse(localStorage.getItem('mb_ambassadors') || '[]'); } catch { return []; }
}
function setAmbassadors(list: string[]) {
  localStorage.setItem('mb_ambassadors', JSON.stringify(list));
}

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [userDetail, setUserDetail] = useState<any>(null);
  const [liveAdminCode, setLiveAdminCode] = useState('');
  const [liveRequests, setLiveRequests] = useState<any[]>([]);
  const [liveMessage, setLiveMessage] = useState('');
  const [directLive, setDirectLive] = useState({ handle: '', showUrl: '', previewUrl: '' });
  const [createdLiveCode, setCreatedLiveCode] = useState('');

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => setUsers(data || []));
  }, []);

  const openUser = async (user: any) => {
    setSelected(user);
    setUserDetail({ user, orders: [] });
  };

  const toggleVerify = async (id: string, current: number) => {
    await supabase.from('profiles').update({ verified: !current }).eq('id', id);
    setUsers(u => u.map(x => x.id === id ? { ...x, verified: current ? 0 : 1 } : x));
    if (userDetail?.user?.id === id) setUserDetail((d: any) => ({ ...d, user: { ...d.user, verified: current ? 0 : 1 } }));
  };

  const toggleBan = async (id: string, current: number) => {
    if (!confirm(current ? 'Réactiver ce compte ?' : 'Suspendre ce compte ?')) return;
    await supabase.from('profiles').update({ banned: !current }).eq('id', id);
    setUsers(u => u.map(x => x.id === id ? { ...x, banned: current ? 0 : 1 } : x));
  };

  const loadLiveRequests = async () => {
    setLiveMessage('');
    try { setLiveRequests(await adminListAmbassadorRequests(liveAdminCode)); }
    catch { setLiveMessage('Code administrateur Live invalide.'); }
  };

  const reviewLiveRequest = async (email: string, approved: boolean) => {
    await adminReviewAmbassadorRequest(liveAdminCode, email, approved);
    setLiveMessage(approved ? 'Ambassadeur validé.' : 'Demande refusée.');
    await loadLiveRequests();
  };

  const authorizeSelectedForLive = async () => {
    if (!selected || !liveAdminCode || !directLive.handle || !directLive.showUrl) return;
    setLiveMessage(''); setCreatedLiveCode('');
    try {
      const token = await adminConnectWhatnot({ adminCode: liveAdminCode, email: selected.email, displayName: selected.name, ...directLive });
      setCreatedLiveCode(token);
      setLiveMessage(`${selected.name} est maintenant autorisé à diffuser.`);
    } catch { setLiveMessage('Impossible d’autoriser ce profil. Vérifiez le code administrateur et les informations Whatnot.'); }  };

  const toggleAmbassador = (email: string) => {
    const list = getAmbassadors();
    setAmbassadors(list.includes(email) ? list.filter(e => e !== email) : [...list, email]);
    setUsers(u => [...u]);
  };

  const filtered = users.filter(u => {
    const m = u.email?.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase());
    if (filter === 'buyer') return m && u.role === 'buyer';
    if (filter === 'banned') return m && u.banned;
    if (filter === 'unverified') return m && !u.verified;
    return m;
  });

  const roleColors: Record<string, string> = { buyer: '#1976d2', pro: '#c9a96e', admin: '#cc0000' };
  const roleLabels: Record<string, string> = { buyer: 'UTILISATEUR', pro: 'VENDEUR', admin: 'ADMIN' };

  return (
    <div className="admin-users-page" style={{ display: 'flex', gap: '1.5rem', flexDirection: 'column' }}>
      <style>{`@media(max-width:800px){.admin-users-columns{display:block!important}.admin-user-detail{width:100%!important;position:static!important;margin-top:16px}.admin-users-page table{min-width:720px}.admin-users-page input,.admin-users-page select{max-width:100%;min-height:42px}}`}</style>
      <section style={{ background: 'white', border: '1px solid #e8d5b7', padding: '1.25rem' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 400, marginBottom: '.5rem' }}>Demandes ambassadeurs Live</h2>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '.72rem', color: '#777', marginBottom: '1rem' }}>Validez ou refusez les utilisateurs qui souhaitent diffuser sur la page Live.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' }}>
          <input type="password" value={liveAdminCode} onChange={e => setLiveAdminCode(e.target.value)} placeholder="Code administrateur Live" style={{ border: '1px solid #e8d5b7', padding: '8px 10px', minWidth: 240 }} />
          <button onClick={loadLiveRequests} className="btn-gold" style={{ fontSize: '.7rem' }}>AFFICHER LES DEMANDES</button>
        </div>
        {liveMessage && <p style={{ fontSize: '.72rem', color: liveMessage.includes('invalide') ? '#b91c1c' : '#2e7d32', marginBottom: 10 }}>{liveMessage}</p>}
        {liveRequests.map(request => (
          <div key={request.email} style={{ borderTop: '1px solid #f0ece6', padding: '12px 0', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '.82rem', fontWeight: 700 }}>{request.display_name} · @{request.whatnot_handle}</p>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '.7rem', color: '#777' }}>{request.email} · Statut : {request.status}</p>
              <a href={request.show_url} target="_blank" rel="noreferrer" style={{ fontSize: '.68rem', color: '#c9a96e' }}>Vérifier le profil Whatnot</a>
            </div>
            {request.status === 'pending' && <div style={{ display: 'flex', gap: 8 }}><button onClick={() => reviewLiveRequest(request.email, true)} style={{ border: 0, background: '#2e7d32', color: 'white', padding: '8px 11px', cursor: 'pointer', fontSize: '.68rem' }}>VALIDER</button><button onClick={() => reviewLiveRequest(request.email, false)} style={{ border: '1px solid #b91c1c', background: 'white', color: '#b91c1c', padding: '8px 11px', cursor: 'pointer', fontSize: '.68rem' }}>REFUSER</button></div>}
          </div>
        ))}
      </section>
      {selected && <section style={{ background: 'white', border: '1px solid #e8d5b7', padding: '1.25rem' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 400, marginBottom: 6 }}>Autoriser directement {selected.name}</h2>
        <p style={{ color: '#777', fontSize: 12, marginBottom: 12 }}>Sélectionnez un utilisateur dans la liste, puis liez son compte Whatnot sans attendre une demande.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 8 }}>
          <input value={directLive.handle} onChange={e => setDirectLive(v => ({ ...v, handle: e.target.value }))} placeholder="@pseudo Whatnot" style={{ border: '1px solid #e8d5b7', padding: 10 }} />
          <input value={directLive.showUrl} onChange={e => setDirectLive(v => ({ ...v, showUrl: e.target.value }))} placeholder="Lien du profil ou show Whatnot" style={{ border: '1px solid #e8d5b7', padding: 10 }} />
          <input value={directLive.previewUrl} onChange={e => setDirectLive(v => ({ ...v, previewUrl: e.target.value }))} placeholder="Miniature (facultatif)" style={{ border: '1px solid #e8d5b7', padding: 10 }} />
        </div>
        <button onClick={authorizeSelectedForLive} className="btn-gold" style={{ marginTop: 10 }}>AUTORISER COMME AMBASSADEUR LIVE</button>
        {createdLiveCode && <div style={{ marginTop: 12, padding: 12, background: '#f8f4ef', wordBreak: 'break-all', fontSize: 12 }}><strong>Code à transmettre une seule fois :</strong> {createdLiveCode} <button aria-label="Copier le code" onClick={() => navigator.clipboard.writeText(createdLiveCode)} style={{ border: 0, background: 'none', cursor: 'pointer' }}><Copy size={15} /></button></div>}
      </section>}
      <div className="admin-users-columns" style={{ display: 'flex', gap: '1.5rem' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a' }}>Utilisateurs ({filtered.length})</h1>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
              style={{ border: '1px solid #e8d5b7', padding: '6px 12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', width: '200px' }} />
            <select value={filter} onChange={e => setFilter(e.target.value)}
              style={{ border: '1px solid #e8d5b7', padding: '6px 12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', backgroundColor: 'white' }}>
              <option value="all">Tous</option>
              <option value="buyer">Acheteurs</option>
              <option value="banned">Suspendus</option>
              <option value="unverified">Non vérifiés</option>
            </select>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e8d5b7', backgroundColor: '#f8f4ef' }}>
                {['Nom', 'Email', 'Rôle', 'Vérifié', 'Ambassadeur', 'Ventes', 'Inscrit', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#9e8e7e' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f0ece6', opacity: u.banned ? 0.5 : 1, cursor: 'pointer', backgroundColor: selected?.id === u.id ? '#fdf9f4' : 'white' }}
                  onClick={() => openUser(u)}>
                  <td style={{ padding: '10px 14px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#1a1a1a' }}>
                    {u.name} {u.banned ? <span style={{ fontSize: '0.65rem', color: '#cc0000' }}>[BANNI]</span> : ''}
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#666' }}>{u.email}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ color: roleColors[u.role] || '#9e8e7e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', fontWeight: 600 }}>
                      {roleLabels[u.role] || u.role?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {u.verified ? <CheckCircle size={16} color="#2e7d32" /> : <XCircle size={16} color="#ff9800" />}
                  </td>
                  <td style={{ padding: '10px 14px' }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => toggleAmbassador(u.email)} title={getAmbassadors().includes(u.email) ? 'Révoquer ambassadeur' : 'Nommer ambassadeur'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: getAmbassadors().includes(u.email) ? '#e53935' : '#ccc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Radio size={16} />
                      {getAmbassadors().includes(u.email) && <span style={{ fontSize: '0.6rem', fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#e53935' }}>AMBASSADEUR</span>}
                    </button>
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1a1a1a' }}>
                    {u.total_sales ? `${u.total_sales.toLocaleString('fr-FR')} €` : '-'}
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#9e8e7e' }}>
                    {new Date(u.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleVerify(u.id, u.verified)} title={u.verified ? 'Dé-vérifier' : 'Vérifier'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: u.verified ? '#ff9800' : '#2e7d32' }}>
                        {u.verified ? <UserCheck size={16} /> : <CheckCircle size={16} />}
                      </button>
                      <button onClick={() => toggleBan(u.id, u.banned)} title={u.banned ? 'Réactiver' : 'Suspendre'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: u.banned ? '#2e7d32' : '#ff9800' }}>
                        <Ban size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {selected && userDetail && (
        <div className="admin-user-detail" style={{ width: '320px', flexShrink: 0, backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem', height: 'fit-content', position: 'sticky', top: '2rem' }}>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 400, marginBottom: '1rem', color: '#1a1a1a' }}>Détails</h3>
          <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f0ece6' }}>
            {[
              { k: 'Nom', v: userDetail.user?.name },
              { k: 'Email', v: userDetail.user?.email },
              { k: 'Téléphone', v: userDetail.user?.phone || '-' },
              { k: 'Pays', v: userDetail.user?.country || '-' },
              { k: 'Dernière connexion', v: userDetail.user?.last_login ? new Date(userDetail.user.last_login).toLocaleDateString('fr-FR') : '-' },
            ].map(row => (
              <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e' }}>{row.k}</span>
                <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1a1a1a' }}>{row.v}</span>
              </div>
            ))}
          </div>

          {false && userDetail.shop && (
            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f0ece6' }}>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#9e8e7e', marginBottom: '8px' }}>BOUTIQUE</p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: '#c9a96e', marginBottom: '4px' }}>{userDetail.shop.shop_name}</p>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#1a1a1a' }}>Commission: {userDetail.shop.commission_rate}% · {userDetail.shop.subscription_active ? '★ Premium' : 'Gratuit'}</p>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#1a1a1a' }}>Solde: {(userDetail.shop.wallet_balance || 0).toLocaleString('fr-FR')} €</p>
            </div>
          )}

          <div>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#9e8e7e', marginBottom: '8px' }}>ACHATS ({userDetail.orders?.length || 0})</p>
            {userDetail.orders?.slice(0, 5).map((o: any) => (
              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f8f4ef' }}>
                <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#1a1a1a' }}>{o.item_title?.slice(0, 20)}...</span>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.75rem', color: o.payment_status === 'paid' ? '#2e7d32' : '#ff9800' }}>{o.amount?.toLocaleString('fr-FR')} €</span>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
