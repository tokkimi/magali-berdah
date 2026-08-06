import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Clock, Plus } from 'lucide-react';
import { api, imgUrl } from '../../lib/api';

function loadLocalItems(): any[] {
  try { return JSON.parse(localStorage.getItem('mb_shop_items') || '[]'); } catch { return []; }
}

export default function ProItems() {
  const [items, setItems] = useState<any[]>(loadLocalItems);

  useEffect(() => {
    api.get('/items/shop/mine').then(d => {
      if (d.items?.length) {
        // Merge: API items take priority, but keep local-only items
        const apiIds = new Set(d.items.map((i: any) => i.id));
        const localOnly = loadLocalItems().filter((i: any) => !apiIds.has(i.id));
        setItems([...d.items, ...localOnly]);
      }
    }).catch(() => {});
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const next = items.map(i => i.id === id ? { ...i, status } : i);
    setItems(next);
    // Persist locally too
    const local = loadLocalItems().map((i: any) => i.id === id ? { ...i, status } : i);
    localStorage.setItem('mb_shop_items', JSON.stringify(local));
    try { await api.put(`/items/${id}`, { status }); } catch {}
  };

  const removeItem = async (id: string) => {
    if (!confirm('Retirer cet article ?')) return;
    setItems(prev => prev.filter(i => i.id !== id));
    const local = loadLocalItems().filter((i: any) => i.id !== id);
    localStorage.setItem('mb_shop_items', JSON.stringify(local));
    try { await api.delete(`/items/${id}`); } catch {}
  };

  const statusColors: Record<string, string> = {
    active: '#2e7d32', draft: '#9e8e7e', suspended: '#ff9800', sold: '#1976d2', removed: '#cc0000'
  };
  const statusLabels: Record<string, string> = {
    active: 'En ligne', draft: 'Brouillon', suspended: 'Suspendu', sold: 'Vendu', removed: 'Retiré'
  };

  const visible = items.filter(i => i.status !== 'removed');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a' }}>
          Mes articles <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '1rem', color: '#9e8e7e', fontWeight: 400 }}>({visible.length})</span>
        </h1>
        <Link to="/boutique/articles/nouveau" className="btn-gold" style={{ textDecoration: 'none', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} /> AJOUTER
        </Link>
      </div>

      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'white', border: '1px solid #e8d5b7' }}>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', color: '#9e8e7e', marginBottom: '1.5rem' }}>Aucun article pour le moment</p>
          <Link to="/boutique/articles/nouveau" className="btn-gold" style={{ textDecoration: 'none' }}>Ajouter mon premier article</Link>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e8d5b7', backgroundColor: '#f8f4ef' }}>
                {['Article', 'Prix', 'Statut', 'Vues', 'Enchère', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#9e8e7e' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f0ece6' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {item.photos?.[0] ? (
                        <img src={item.photos[0].startsWith('blob:') ? item.photos[0] : imgUrl(item.photos[0])} alt=""
                          style={{ width: '44px', height: '55px', objectFit: 'cover', backgroundColor: '#f8f4ef', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '44px', height: '55px', backgroundColor: '#f8f4ef', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.6rem', color: '#9e8e7e' }}>Photo</span>
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.88rem', color: '#1a1a1a', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{item.title}</p>
                        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#c9a96e' }}>{item.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'Georgia, serif', fontSize: '0.88rem' }}>
                    {item.fixed_price ? `${Number(item.fixed_price).toLocaleString('fr-FR')} €` : item.auction_start_price ? `${Number(item.auction_start_price).toLocaleString('fr-FR')} €` : '-'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: statusColors[item.status] || '#9e8e7e', fontWeight: 600 }}>
                      {statusLabels[item.status] || item.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#1a1a1a' }}>
                      <Eye size={13} color="#9e8e7e" /> {item.views || 0}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {item.auction_enabled ? (
                      <div>
                        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#c9a96e' }}>
                          {(item.current_bid || item.auction_start_price || 0).toLocaleString('fr-FR')} €
                        </p>
                        {item.auction_end_time && (
                          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#9e8e7e', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={10} /> {new Date(item.auction_end_time).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Link to={`/boutique/articles/${item.id}`} style={{ color: '#c9a96e', display: 'flex' }} title="Modifier"><Edit size={15} /></Link>
                      {item.status === 'active' ? (
                        <button onClick={() => updateStatus(item.id, 'draft')} title="Mettre en brouillon"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff9800', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', padding: 0 }}>Dépublier</button>
                      ) : (
                        <button onClick={() => updateStatus(item.id, 'active')} title="Mettre en ligne"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2e7d32', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', padding: 0 }}>Publier</button>
                      )}
                      <button onClick={() => removeItem(item.id)} title="Supprimer" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cc0000', display: 'flex' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
