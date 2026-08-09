import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../lib/store';
import { getSharedItem } from '../../lib/marketplace';

const CATEGORIES = [
  { id: 'bags-handbags', fr: 'Sacs à Main', en: 'Handbags' },
  { id: 'bags-shoulder', fr: 'Sacs Bandoulière', en: 'Shoulder Bags' },
  { id: 'bags-clutch', fr: 'Pochettes', en: 'Clutches' },
  { id: 'bags-tote', fr: 'Totes', en: 'Totes' },
  { id: 'bags-backpack', fr: 'Sacs à Dos', en: 'Backpacks' },
  { id: 'shoes-heels', fr: 'Escarpins', en: 'Heels' },
  { id: 'shoes-flats', fr: 'Chaussures Plates', en: 'Flats' },
  { id: 'shoes-boots', fr: 'Bottes', en: 'Boots' },
  { id: 'acc-watches', fr: 'Montres', en: 'Watches' },
  { id: 'acc-jewelry', fr: 'Bijoux', en: 'Jewelry' },
  { id: 'acc-scarves', fr: 'Foulards', en: 'Scarves' },
  { id: 'clothing-dresses', fr: 'Robes', en: 'Dresses' },
  { id: 'clothing-tops', fr: 'Hauts', en: 'Tops' },
  { id: 'clothing-coats', fr: 'Manteaux', en: 'Coats' },
];

const CONDITIONS = [
  { id: 'new', fr: 'Neuf avec étiquettes' },
  { id: 'excellent', fr: 'Excellent état' },
  { id: 'very_good', fr: 'Très bon état' },
  { id: 'good', fr: 'Bon état' },
  { id: 'fair', fr: 'État correct' },
];

export default function AdminItemForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { user } = useStore();
  const [saving, setSaving] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>(['']);

  const [form, setForm] = useState({
    title: '', brand: '', category_id: 'bags-handbags', condition: 'excellent',
    color: '', size: 'Taille unique', description: '',
    saleType: 'fixed' as 'fixed' | 'auction',
    fixed_price: '', auction_start_price: '', auction_min_price: '',
    auction_days: '7', auction_end_time: '',
    certified: false, featured: false, isVintage: false,
    seller_email: '', seller_payout: '',
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!id) return;
    getSharedItem(id).then(existing => {
      if (!existing) { navigate('/admin/articles'); return; }
      setPhotoUrls(existing.photos?.length ? existing.photos : ['']);
      setForm({
        title: existing.title || '', brand: existing.brand || '', category_id: existing.category_id || 'bags-handbags',
        condition: existing.condition || 'excellent', color: existing.color || '', size: existing.size || 'Taille unique',
        description: existing.description || '', saleType: existing.auction_enabled ? 'auction' : 'fixed',
        fixed_price: existing.fixed_price?.toString() || '', auction_start_price: existing.auction_start_price?.toString() || '',
        auction_min_price: existing.auction_reserve_price?.toString() || '', auction_days: '7',
        auction_end_time: existing.auction_end_time ? new Date(existing.auction_end_time).toISOString().slice(0, 16) : '',
        certified: Boolean(existing.certified), featured: Boolean(existing.featured), isVintage: false,
        seller_email: existing.seller_email || '', seller_payout: existing.seller_payout?.toString() || '',
      });
    }).catch(() => navigate('/admin/articles'));
  }, [id, navigate]);

  const addUrl = () => setPhotoUrls(u => [...u, '']);
  const removeUrl = (i: number) => setPhotoUrls(u => u.filter((_, idx) => idx !== i));
  const setUrl = (i: number, v: string) => setPhotoUrls(u => u.map((x, idx) => idx === i ? v : x));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const cat = CATEGORIES.find(c => c.id === form.category_id);
    const photos = photoUrls.filter(u => u.trim());
    const itemId = id || `item-${crypto.randomUUID()}`;
    const auctionEnd = form.saleType === 'auction'
      ? (form.auction_end_time ? new Date(form.auction_end_time).toISOString() : new Date(Date.now() + parseInt(form.auction_days) * 86400000).toISOString())
      : null;

    const item = {
      id: itemId,
      shop_id: 'admin',
      shop_name: 'Magali Berdah',
      title: form.title,
      brand: form.brand,
      description: form.description,
      category_id: form.category_id,
      category_name_fr: cat?.fr || '',
      category_name_en: cat?.en || '',
      condition: form.condition,
      color: form.color,
      size: form.size,
      photos: photos.length ? photos : ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80'],
      fixed_price: form.saleType === 'fixed' ? parseFloat(form.fixed_price) || null : null,
      auction_enabled: form.saleType === 'auction' ? 1 : 0,
      auction_start_price: form.saleType === 'auction' ? parseFloat(form.auction_start_price) || null : null,
      auction_min_price: form.saleType === 'auction' ? parseFloat(form.auction_min_price) || null : null,
      auction_end_time: auctionEnd,
      current_bid: null,
      status: 'active',
      featured: form.featured ? 1 : 0,
      certified: form.certified ? 1 : 0,
      isVintage: form.isVintage,
      seller_email: form.seller_email.trim() || null,
      seller_payout: form.seller_payout ? parseFloat(form.seller_payout) : null,
      views: 0,
      created_at: new Date().toISOString(),
    };

    const payload = {
      id: item.id, title: item.title, brand: item.brand, description: item.description,
      category_id: item.category_id, category_name_fr: item.category_name_fr,
      condition: item.condition, color: item.color, size: item.size, photos: item.photos,
      fixed_price: item.fixed_price,
      auction_enabled: Boolean(item.auction_enabled),
      auction_start_price: item.auction_start_price,
      auction_reserve_price: item.auction_min_price,
      auction_end_time: item.auction_end_time,
      status: item.status,
      featured: Boolean(item.featured),
      certified: Boolean(item.certified),
      seller_email: item.seller_email, seller_payout: item.seller_payout,
      created_by: user?.id,
    };
    const { error } = isEdit
      ? await supabase.from('auction_items').update(payload).eq('id', id!)
      : await supabase.from('auction_items').insert(payload);
    if (error) {
      setSaving(false);
      alert(`Impossible d'ajouter l'article : ${error.message}`);
      return;
    }

    // Also persist certifiedIds if certified
    if (form.certified) {
      const raw = localStorage.getItem('mb_certified_ids') || '[]';
      const ids: string[] = JSON.parse(raw);
      if (!ids.includes(itemId)) ids.push(itemId);
      localStorage.setItem('mb_certified_ids', JSON.stringify(ids));
    }

    setSaving(false);
    navigate('/admin/articles');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1px solid #e8d5b7',
    fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem',
    backgroundColor: 'white', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: 'Helvetica Neue, Arial, sans-serif',
    fontSize: '0.6rem', letterSpacing: '0.15em', color: '#9e8e7e', marginBottom: '6px',
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a' }}>{isEdit ? 'Modifier l’article' : 'Ajouter un article'}</h1>
        <button onClick={() => navigate('/admin/articles')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9e8e7e' }}>
          <X size={22} />
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Photos */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', border: '1px solid #e8d5b7' }}>
          <p style={{ ...labelStyle, marginBottom: '1rem' }}>PHOTOS (URLs)</p>
          {photoUrls.map((url, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="url" value={url} onChange={e => setUrl(i, e.target.value)}
                placeholder={`https://images.unsplash.com/...`}
                style={{ ...inputStyle, flex: 1 }}
              />
              {photoUrls.length > 1 && (
                <button type="button" onClick={() => removeUrl(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cc0000' }}>
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          {photoUrls.length < 8 && (
            <button type="button" onClick={addUrl}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px dashed #e8d5b7', padding: '8px 16px', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', marginTop: '4px' }}>
              <Plus size={14} /> Ajouter une photo
            </button>
          )}
          {photoUrls.filter(u => u.trim()).length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {photoUrls.filter(u => u.trim()).map((url, i) => (
                <img key={i} src={url} alt="" style={{ width: '70px', height: '90px', objectFit: 'cover', backgroundColor: '#f8f4ef' }}
                  onError={e => (e.currentTarget.style.display = 'none')} />
              ))}
            </div>
          )}
        </div>

        {/* Infos principales */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', border: '1px solid #e8d5b7', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>TITRE *</label>
            <input required value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Ex: Sac Birkin 30 Hermès Fauve" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>MARQUE *</label>
            <input required value={form.brand} onChange={e => set('brand', e.target.value)}
              placeholder="Ex: Hermès" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>CATÉGORIE</label>
            <select value={form.category_id} onChange={e => set('category_id', e.target.value)} style={inputStyle}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.fr}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>ÉTAT</label>
            <select value={form.condition} onChange={e => set('condition', e.target.value)} style={inputStyle}>
              {CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.fr}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>COULEUR</label>
            <input value={form.color} onChange={e => set('color', e.target.value)}
              placeholder="Ex: Bordeaux" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>TAILLE / FORMAT</label>
            <input value={form.size} onChange={e => set('size', e.target.value)}
              placeholder="Ex: Taille unique" style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>DESCRIPTION</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={4} placeholder="Description détaillée de l'article..."
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
        </div>

        {/* Type de vente */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', border: '1px solid #e8d5b7' }}>
          <p style={{ ...labelStyle, marginBottom: '1rem' }}>TYPE DE VENTE</p>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
            {[{ id: 'fixed', label: 'Vente directe' }, { id: 'auction', label: 'Enchère' }].map(opt => (
              <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#1a1a1a' }}>
                <input type="radio" name="saleType" value={opt.id} checked={form.saleType === opt.id}
                  onChange={() => set('saleType', opt.id)} style={{ accentColor: '#c9a96e' }} />
                {opt.label}
              </label>
            ))}
          </div>

          {form.saleType === 'fixed' ? (
            <div style={{ maxWidth: '220px' }}>
              <label style={labelStyle}>PRIX DE VENTE (€) *</label>
              <input required type="number" min="0" step="1" value={form.fixed_price}
                onChange={e => set('fixed_price', e.target.value)}
                placeholder="Ex: 2500" style={inputStyle} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>PRIX DE DÉPART (€) *</label>
                <input required type="number" min="0" value={form.auction_start_price}
                  onChange={e => set('auction_start_price', e.target.value)}
                  placeholder="Ex: 1200" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>PRIX DE RÉSERVE (€)</label>
                <input type="number" min={form.auction_start_price || '0'} value={form.auction_min_price}
                  onChange={e => set('auction_min_price', e.target.value)}
                  placeholder="Ex: 1500" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>DURÉE (JOURS)</label>
                <select value={form.auction_days} onChange={e => set('auction_days', e.target.value)} style={inputStyle}>
                  {[1, 2, 3, 5, 7, 10, 14].map(d => <option key={d} value={d}>{d} jour{d > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>DATE ET HEURE DE FIN</label>
                <input type="datetime-local" value={form.auction_end_time} onChange={e => set('auction_end_time', e.target.value)} style={inputStyle} />
                <p style={{ marginTop: 5, color: '#9e8e7e', fontSize: '.7rem' }}>Si aucune date n’est indiquée, la durée choisie ci-dessus sera utilisée.</p>
              </div>
            </div>
          )}
        </div>

        {/* Vendeur lié */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', border: '1px solid #e8d5b7' }}>
          <p style={{ ...labelStyle, marginBottom: '1rem', color: '#c9a96e' }}>VENDEUR LIÉ (optionnel)</p>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', marginBottom: '1rem', lineHeight: 1.5 }}>
            Liez cet article à un utilisateur qui a soumis sa pièce. La cagnotte sera créditée à sa réception par l'acheteur.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>EMAIL DU VENDEUR</label>
              <input value={form.seller_email} onChange={e => set('seller_email', e.target.value)}
                type="email" placeholder="ex: vendeur@email.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>MONTANT CAGNOTTE (€)</label>
              <input value={form.seller_payout} onChange={e => set('seller_payout', e.target.value)}
                type="number" min="0" step="1" placeholder="Ex: 800" style={inputStyle} />
            </div>
          </div>
          {form.seller_email && form.seller_payout && (
            <div style={{ marginTop: '10px', padding: '10px 14px', backgroundColor: '#fff8e6', border: '1px solid #c9a96e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#a8834a' }}>
              ✓ {form.seller_email} recevra <strong>{parseFloat(form.seller_payout).toLocaleString('fr-FR')} €</strong> dans sa cagnotte après réception par l'acheteur
            </div>
          )}
        </div>

        {/* Options */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', border: '1px solid #e8d5b7', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            { key: 'certified', label: 'Certifié authentique ✓', color: '#c9a96e' },
            { key: 'featured', label: 'Mis en avant ★', color: '#c9a96e' },
            { key: 'isVintage', label: 'Vintage', color: '#9e8e7e' },
          ].map(opt => (
            <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#1a1a1a' }}>
              <input type="checkbox" checked={(form as any)[opt.key]}
                onChange={e => set(opt.key, e.target.checked)} style={{ accentColor: opt.color, width: '16px', height: '16px' }} />
              {opt.label}
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={saving} className="btn-gold"
            style={{ flex: 1, fontSize: '0.8rem', letterSpacing: '0.1em', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'ENREGISTREMENT...' : isEdit ? 'ENREGISTRER LES MODIFICATIONS' : 'PUBLIER L\'ARTICLE'}
          </button>
          <button type="button" onClick={() => navigate('/admin/articles')}
            style={{ flex: 1, padding: '12px', border: '1px solid #e8d5b7', background: 'none', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#9e8e7e' }}>
            ANNULER
          </button>
        </div>
      </form>
    </div>
  );
}
