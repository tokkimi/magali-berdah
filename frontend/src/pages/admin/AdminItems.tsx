import { useEffect, useState } from 'react';
import { Eye, Star, Pause, Play, Trash2, ShieldCheck, FileText, X, Plus, Pencil } from 'lucide-react';
import { api, imgUrl } from '../../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { getAllItems } from '../../lib/staticItems';
import { useStore } from '../../lib/store';
import { getSharedItems } from '../../lib/marketplace';
import { supabase } from '../../lib/supabase';

export default function AdminItems() {
  const navigate = useNavigate();
  const { certifiedIds, setCertified, user } = useStore();
  const [items, setItems] = useState<any[]>(getAllItems().map(i => ({ ...i, certified: certifiedIds.has(i.id) ? 1 : i.certified })));
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [certModal, setCertModal] = useState<any>(null); // item being reviewed

  useEffect(() => {
    getSharedItems().then(shared => setItems([...new Map([...getAllItems().filter(i => i.id.startsWith('static-')), ...shared].map(item => [item.id, item])).values()])).catch(() => {});
  }, []);

  const persistItem = async (item: any, changes: Record<string, unknown>) => {
    const reserve = item.auction_reserve_price ?? item.auction_min_price ?? null;
    const payload = {
      id: item.id, title: item.title, brand: item.brand, description: item.description || '',
      category_id: item.category_id, category_name_fr: item.category_name_fr || '', condition: item.condition || 'excellent',
      color: item.color || null, size: item.size || null, photos: item.photos || [], videos: item.videos || [], fixed_price: item.fixed_price || null,
      auction_enabled: Boolean(item.auction_enabled), auction_start_price: item.auction_start_price || null,
      auction_reserve_price: reserve == null ? null : Math.max(Number(reserve), Number(item.auction_start_price || 0)),
      auction_end_time: item.auction_end_time || null, status: item.status || 'active', featured: Boolean(item.featured),
      certified: Boolean(item.certified), seller_email: item.seller_email || null, seller_payout: item.seller_payout || null,
      created_by: item.created_by || user?.id,
      ...changes,
    };
    const { error } = await supabase.from('auction_items').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  };

  const setStatus = async (item: any, status: string) => {
    await persistItem(item, { status });
    const id = item.id;
    try { await api.put(`/admin/items/${id}/status`, { status }); } catch {}
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  const toggleFeature = async (item: any) => {
    const id = item.id; const current = item.featured;
    await persistItem(item, { featured: !current });
    try { await api.put(`/admin/items/${id}/feature`, { featured: !current }); } catch {}
    setItems(prev => prev.map(i => i.id === id ? { ...i, featured: current ? 0 : 1 } : i));
  };

  const certify = async (item: any, certified: boolean) => {
    const id = item.id;
    await persistItem(item, { certified });
    try { await api.put(`/admin/items/${id}/certify`, { certified }); } catch {}
    setItems(prev => prev.map(i => i.id === id ? { ...i, certified: certified ? 1 : 0 } : i));
    setCertified(id, certified);
    setCertModal(null);
  };

  const removeItem = async (item: any) => {
    if (!confirm('Retirer cet article ?')) return;
    const id = item.id;
    await persistItem(item, { status: 'removed' });
    try { await api.delete(`/admin/items/${id}`); } catch {}
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'removed' } : i));
  };

  const filtered = items.filter(i => {
    const m = i.title?.toLowerCase().includes(search.toLowerCase()) || i.brand?.toLowerCase().includes(search.toLowerCase());
    if (filter === 'active') return m && i.status === 'active';
    if (filter === 'auction') return m && i.auction_enabled;
    if (filter === 'suspended') return m && i.status === 'suspended';
    if (filter === 'featured') return m && i.featured;
    if (filter === 'certified') return m && i.certified;
    if (filter === 'pending_cert') return m && i.documents?.length && !i.certified;
    return m;
  });

  const statusColors: Record<string, string> = { active: '#2e7d32', draft: '#9e8e7e', suspended: '#ff9800', sold: '#1976d2', removed: '#cc0000' };
  const statusLabels: Record<string, string> = { active: 'En ligne', draft: 'Brouillon', suspended: 'Suspendu', sold: 'Vendu', removed: 'Retiré' };

  return (
    <div className="admin-items-page">
      <style>{`.mobile-action-label{display:none}@media(max-width:700px){
        .admin-items-toolbar{display:grid!important;grid-template-columns:1fr 1fr;width:100%;gap:8px!important}
        .admin-items-toolbar button{grid-column:1/-1;min-height:48px;justify-content:center}
        .admin-items-toolbar input,.admin-items-toolbar select{width:100%!important;min-height:44px}
        .admin-items-table-wrap{border:0!important;background:transparent!important;overflow:visible!important}
        .admin-items-table{min-width:0!important;display:block}.admin-items-table thead{display:none}.admin-items-table tbody{display:grid;gap:12px}
        .admin-items-table tr{display:grid;grid-template-columns:1fr 1fr;background:white;border:1px solid #e8d5b7!important;border-radius:14px;padding:12px;gap:8px}
        .admin-items-table td{display:block;padding:4px!important;min-width:0}.admin-items-table td:first-child{grid-column:1/-1}
        .admin-items-table td:last-child{grid-column:1/-1;border-top:1px solid #f0ece6;padding-top:10px!important}
        .admin-items-table td:last-child>div{display:grid!important;grid-template-columns:repeat(3,1fr);gap:8px!important}
        .admin-items-table td:last-child button{min-height:42px;border:1px solid #e8d5b7!important;border-radius:9px!important;display:flex;align-items:center;justify-content:center}
        .mobile-action-label{display:inline;font-size:12px;font-weight:700}
      }`}</style>
      {/* Cert modal */}
      {certModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', maxWidth: '520px', width: '100%', padding: '2rem', position: 'relative', maxHeight: '80vh', overflowY: 'auto' }}>
            <button onClick={() => setCertModal(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9e8e7e' }}>
              <X size={18} />
            </button>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#c9a96e', marginBottom: '0.5rem' }}>CERTIFICATION D'AUTHENTICITÉ</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '0.25rem' }}>{certModal.title}</h2>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', marginBottom: '1.5rem' }}>{certModal.brand} · {certModal.shop_name}</p>

            {/* Photos article */}
            {certModal.photos?.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem', overflowX: 'auto' }}>
                {certModal.photos.slice(0, 4).map((p: string, i: number) => (
                  <img key={i} src={imgUrl(p)} alt="" style={{ width: '80px', height: '100px', objectFit: 'cover', flexShrink: 0, backgroundColor: '#f8f4ef' }} />
                ))}
              </div>
            )}

            {/* Documents uploaded by shop */}
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#9e8e7e', marginBottom: '0.75rem' }}>DOCUMENTS JOINTS</p>
            {certModal.documents?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
                {certModal.documents.map((doc: any, i: number) => (
                  <a key={i} href={imgUrl(doc.url || doc)} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', border: '1px solid #e8d5b7', textDecoration: 'none', color: '#1a1a1a', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem' }}>
                    <FileText size={16} color="#c9a96e" />
                    {doc.name || `Document ${i + 1}`}
                    <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#c9a96e' }}>Ouvrir →</span>
                  </a>
                ))}
              </div>
            ) : (
              <div style={{ padding: '1rem', backgroundColor: '#f8f4ef', marginBottom: '1.5rem', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#9e8e7e' }}>
                Aucun document joint pour cet article.
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {certModal.certified ? (
                <button onClick={() => certify(certModal, false)}
                  style={{ flex: 1, padding: '10px', border: '1px solid #cc0000', background: 'none', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#cc0000', letterSpacing: '0.08em' }}>
                  RETIRER LA CERTIFICATION
                </button>
              ) : (
                <>
                  <button onClick={() => setCertModal(null)}
                    style={{ flex: 1, padding: '10px', border: '1px solid #e8d5b7', background: 'none', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e' }}>
                    REFUSER
                  </button>
                  <button onClick={() => certify(certModal, true)} className="btn-gold"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem' }}>
                    <ShieldCheck size={15} /> CERTIFIER AUTHENTIQUE
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a' }}>Articles ({filtered.length})</h1>
        <div className="admin-items-toolbar" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => navigate('/admin/articles/nouveau')} className="btn-gold"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
            <Plus size={14} /> AJOUTER UN ARTICLE
          </button>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            style={{ border: '1px solid #e8d5b7', padding: '6px 12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', width: '180px' }} />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ border: '1px solid #e8d5b7', padding: '6px 12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', backgroundColor: 'white' }}>
            <option value="all">Tous</option>
            <option value="active">En ligne</option>
            <option value="pending_cert">En attente certificat</option>
            <option value="certified">Certifiés</option>
            <option value="auction">Enchères</option>
            <option value="suspended">Suspendus</option>
            <option value="featured">Mis en avant</option>
          </select>
        </div>
      </div>

      <div className="admin-items-table-wrap" style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', overflow: 'auto' }}>
        <table className="admin-items-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e8d5b7', backgroundColor: '#f8f4ef' }}>
              {['Article', 'Vendeur', 'Prix', 'Statut', 'Vues', 'Certifié', 'Mis en avant', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#9e8e7e' }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f0ece6' }}>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={imgUrl(item.photos?.[0])} alt="" style={{ width: '40px', height: '50px', objectFit: 'cover', backgroundColor: '#f8f4ef' }} />
                      {item.certified ? (
                        <span title="Certifié authentique" style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '16px', height: '16px', backgroundColor: '#c9a96e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid white' }}>
                          <span style={{ color: 'white', fontSize: '9px', fontWeight: 700 }}>✓</span>
                        </span>
                      ) : null}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <Link to={`/article/${item.id}`} style={{ textDecoration: 'none' }}>
                        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{item.title}</p>
                      </Link>
                      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#c9a96e' }}>{item.brand}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '10px 12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#666' }}>{item.shop_name}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'Georgia, serif', fontSize: '0.85rem' }}>
                  {item.fixed_price ? `${item.fixed_price.toLocaleString('fr-FR')} €` : item.auction_start_price ? `${item.auction_start_price.toLocaleString('fr-FR')} €` : '-'}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: statusColors[item.status] || '#9e8e7e', fontWeight: 600 }}>
                    {statusLabels[item.status] || item.status}
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#1a1a1a' }}>
                    <Eye size={12} color="#9e8e7e" /> {item.views || 0}
                  </div>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <button onClick={() => setCertModal(item)} title={item.certified ? 'Certifié authentique' : item.documents?.length ? 'Vérifier les documents' : 'Aucun document'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '4px', backgroundColor: item.certified ? '#fdf6ec' : item.documents?.length ? '#fff8ee' : 'transparent' }}>
                    <ShieldCheck size={16} color={item.certified ? '#c9a96e' : item.documents?.length ? '#ff9800' : '#ccc'} />
                    {item.documents?.length && !item.certified ? (
                      <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', color: '#ff9800' }}>À vérifier</span>
                    ) : item.certified ? (
                      <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', color: '#c9a96e' }}>Certifié</span>
                    ) : null}
                  </button>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <button onClick={() => toggleFeature(item)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Star size={16} fill={item.featured ? '#c9a96e' : 'none'} color={item.featured ? '#c9a96e' : '#ccc'} />
                  </button>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => navigate(`/admin/articles/${item.id}/modifier`)} title="Modifier entièrement" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1976d2', gap: 5 }}><Pencil size={15} /><span className="mobile-action-label">Modifier</span></button>
                    {item.status === 'active' ? (
                      <button onClick={() => setStatus(item, 'suspended')} title="Suspendre" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff9800' }}><Pause size={15} /></button>
                    ) : item.status !== 'removed' ? (
                      <button onClick={() => setStatus(item, 'active')} title="Mettre en ligne" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2e7d32' }}><Play size={15} /></button>
                    ) : null}
                    <button onClick={() => removeItem(item)} title="Retirer" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cc0000' }}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#9e8e7e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem' }}>Aucun article trouvé</p>
        )}
      </div>
    </div>
  );
}
