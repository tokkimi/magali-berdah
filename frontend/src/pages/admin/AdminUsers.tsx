import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Trash2, Eye, Ban, UserCheck } from 'lucide-react';
import { api } from '../../lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [userDetail, setUserDetail] = useState<any>(null);

  useEffect(() => {
    api.get('/admin/users').then(d => setUsers(d.users || [])).catch(() => {});
  }, []);

  const openUser = async (user: any) => {
    setSelected(user);
    const d = await api.get(`/admin/users/${user.id}`);
    setUserDetail(d);
  };

  const toggleVerify = async (id: string, current: number) => {
    await api.put(`/admin/users/${id}/verify`, { verified: !current });
    setUsers(u => u.map(x => x.id === id ? { ...x, verified: current ? 0 : 1 } : x));
    if (userDetail?.user?.id === id) setUserDetail((d: any) => ({ ...d, user: { ...d.user, verified: current ? 0 : 1 } }));
  };

  const toggleBan = async (id: string, current: number) => {
    if (!confirm(current ? 'Réactiver ce compte ?' : 'Suspendre ce compte ?')) return;
    await api.put(`/admin/users/${id}/ban`, { banned: !current });
    setUsers(u => u.map(x => x.id === id ? { ...x, banned: current ? 0 : 1 } : x));
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Supprimer définitivement cet utilisateur ?')) return;
    await api.delete(`/admin/users/${id}`);
    setUsers(u => u.filter(x => x.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const filtered = users.filter(u => {
    const m = u.email?.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase());
    if (filter === 'pro') return m && u.role === 'pro';
    if (filter === 'buyer') return m && u.role === 'buyer';
    if (filter === 'banned') return m && u.banned;
    if (filter === 'unverified') return m && !u.verified;
    return m;
  });

  const roleColors: Record<string, string> = { buyer: '#1976d2', pro: '#c9a96e', admin: '#cc0000' };

  return (
    <div style={{ display: 'flex', gap: '1.5rem' }}>
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
              <option value="pro">Boutiques</option>
              <option value="banned">Suspendus</option>
              <option value="unverified">Non vérifiés</option>
            </select>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e8d5b7', backgroundColor: '#f8f4ef' }}>
                {['Nom', 'Email', 'Rôle', 'Vérifié', 'Ventes', 'Inscrit', 'Actions'].map(h => (
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
                      {u.role?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {u.verified ? <CheckCircle size={16} color="#2e7d32" /> : <XCircle size={16} color="#ff9800" />}
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
                      <button onClick={() => deleteUser(u.id)} title="Supprimer" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cc0000' }}>
                        <Trash2 size={16} />
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
        <div style={{ width: '320px', flexShrink: 0, backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem', height: 'fit-content', position: 'sticky', top: '2rem' }}>
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

          {userDetail.shop && (
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
  );
}
