import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus } from 'lucide-react';

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

function loadAdminItems(): any[] {
  try { return JSON.parse(localStorage.getItem('mb_admin_items') || '[]'); } catch { return []; }
}
function saveAdminItems(items: any[]) {
  localStorage.setItem('mb_admin_items', JSON.stringify(items));
}

export default function AdminItemForm() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>(['']);

  const [form, setForm] = useState({
    title: '', brand: '', category_id: 'bags-handbags', condition: 'excellent',
    color: '', size: 'Taille unique', description: '',
    saleType: 'fixed' as 'fixed' | 'auction',
    fixed_price: '', auction_start_price: '', auction_min_price: '',
    auction_days: '7',
    certified: false, featured: false, isVintage: false,
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const addUrl = () => setPhotoUrls(u => [...u, '']);
  const removeUrl = (i: number) => setPhotoUrls(u => u.filter((_, idx) => idx !== i));
  const setUrl = (i: number, v: string) => setPhotoUrls(u => u.map((x, idx) => idx === i ? v : x));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const cat = CATEGORIES.find(c => c.id === form.category_id);
    const photos = photoUrls.filter(u => u.trim());
    const id = `admin-${Date.now()}`;
    const auctionEnd = form.saleType === 'auction'
      ? new Date(Date.now() + parseInt(form.auction_days) * 86400000).toISOString()
      : null;

    const item = {
      id,
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
      views: 0,
      created_at: new Date().toISOString(),
    };

    const existing = loadAdminItems();
    saveAdminItems([item, ...existing]);

    // Also persist certifiedIds if certified
    if (form.certified) {
      const raw = localStorage.getItem('mb_certified_ids') || '[]';
      const ids: string[] = JSON.parse(raw);
      if (!ids.includes(id)) ids.push(id);
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
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a' }}>Ajouter un article</h1>
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
                <label style={labelStyle}>PRIX MINIMUM (€)</label>
                <input type="number" min="0" value={form.auction_min_price}
                  onChange={e => set('auction_min_price', e.target.value)}
                  placeholder="Ex: 900" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>DURÉE (JOURS)</label>
                <select value={form.auction_days} onChange={e => set('auction_days', e.target.value)} style={inputStyle}>
                  {[1, 2, 3, 5, 7, 10, 14].map(d => <option key={d} value={d}>{d} jour{d > 1 ? 's' : ''}</option>)}
                </select>
              </div>
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
            {saving ? 'ENREGISTREMENT...' : 'PUBLIER L\'ARTICLE'}
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
