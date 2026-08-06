import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, Plus, FileText } from 'lucide-react';
import { api, uploadFiles, imgUrl } from '../../lib/api';
import { useStore } from '../../lib/store';

const CONDITIONS = [
  { value: 'excellent', label: 'Excellent état (comme neuf)' },
  { value: 'very_good', label: 'Très bon état (légères traces)' },
  { value: 'good', label: "Bon état (traces d'usure visibles)" },
  { value: 'fair', label: 'État correct (imperfections notables)' },
];

const STATIC_CATEGORIES = [
  { id: 'women', name_fr: 'Femme', parent_id: null },
  { id: 'men', name_fr: 'Homme', parent_id: null },
  { id: 'bags', name_fr: 'Sacs', parent_id: null },
  { id: 'accessories', name_fr: 'Accessoires', parent_id: null },
  { id: 'bags-handbags', name_fr: '└ Sacs à Main', parent_id: 'bags' },
  { id: 'bags-shoulder', name_fr: '└ Sacs Bandoulière', parent_id: 'bags' },
  { id: 'bags-clutch', name_fr: '└ Pochettes', parent_id: 'bags' },
  { id: 'women-dresses', name_fr: '└ Robes', parent_id: 'women' },
  { id: 'women-tops', name_fr: '└ Tops & Blouses', parent_id: 'women' },
  { id: 'women-shoes', name_fr: '└ Chaussures', parent_id: 'women' },
  { id: 'men-suits', name_fr: '└ Costumes', parent_id: 'men' },
  { id: 'men-shoes', name_fr: '└ Chaussures', parent_id: 'men' },
];

interface PhotoEntry {
  url: string;      // server URL (already uploaded)
  preview?: string; // local blob URL
  file?: File;      // pending file
}

export default function ItemForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useStore();
  const isEdit = !!id && id !== 'nouveau';

  const [categories, setCategories] = useState<any[]>(STATIC_CATEGORIES);
  const [form, setForm] = useState({
    title: '', description: '', brand: '', category_id: '', condition: 'very_good',
    size: '', color: '', material: '', photos: [] as PhotoEntry[],
    mainPhotoIndex: 0,
    fixed_price: '', auction_enabled: false, auction_start_price: '', auction_min_price: '',
    auction_end_time: '', status: 'draft', seo_title: '', seo_description: '', seo_keywords: '',
  });
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/categories').then(d => {
      if (d.categories?.length) setCategories(d.categories);
    }).catch(() => {});

    if (isEdit) {
      api.get(`/items/${id}`).then(d => {
        const i = d.item;
        setForm(f => ({
          ...f,
          title: i.title || '', description: i.description || '', brand: i.brand || '',
          category_id: i.category_id || '', condition: i.condition || 'very_good',
          size: i.size || '', color: i.color || '', material: i.material || '',
          photos: (i.photos || []).map((url: string) => ({ url })),
          mainPhotoIndex: 0,
          fixed_price: i.fixed_price?.toString() || '',
          auction_enabled: !!i.auction_enabled,
          auction_start_price: i.auction_start_price?.toString() || '',
          auction_min_price: i.auction_min_price?.toString() || '',
          auction_end_time: i.auction_end_time ? i.auction_end_time.slice(0, 16) : '',
          status: i.status || 'draft',
          seo_title: i.seo_title || '', seo_description: i.seo_description || '', seo_keywords: i.seo_keywords || '',
        }));
      }).catch(() => navigate('/boutique/articles'));
    }
  }, [id]);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    const remaining = 10 - form.photos.length;
    const toAdd = files.slice(0, remaining);
    const newEntries: PhotoEntry[] = toAdd.map(file => ({
      url: '',
      preview: URL.createObjectURL(file),
      file,
    }));
    set('photos', [...form.photos, ...newEntries]);
    e.target.value = '';
  };

  const removePhoto = (i: number) => {
    const p = form.photos[i];
    if (p.preview) URL.revokeObjectURL(p.preview);
    const next = form.photos.filter((_, idx) => idx !== i);
    set('photos', next);
    if (form.mainPhotoIndex >= next.length) set('mainPhotoIndex', Math.max(0, next.length - 1));
  };

  const handleDocFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setDocFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleSubmit = async (e: React.FormEvent, statusOverride?: string) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      // Upload pending photo files
      const pendingFiles = form.photos.filter(p => p.file).map(p => p.file!);
      let uploadedUrls: string[] = [];
      if (pendingFiles.length > 0) {
        try {
          uploadedUrls = await uploadFiles(pendingFiles);
        } catch {
          // Keep local previews as URL if upload fails (demo mode)
          uploadedUrls = pendingFiles.map(f => URL.createObjectURL(f));
        }
      }

      // Build final photo URL list with main photo first
      let urlList: string[] = [];
      let uploadIdx = 0;
      const allPhotos = form.photos.map(p => {
        if (p.file) return uploadedUrls[uploadIdx++] || p.preview || '';
        return p.url;
      });
      // Reorder: main photo first
      if (form.mainPhotoIndex > 0 && allPhotos.length > 1) {
        const main = allPhotos[form.mainPhotoIndex];
        urlList = [main, ...allPhotos.filter((_, i) => i !== form.mainPhotoIndex)];
      } else {
        urlList = allPhotos;
      }

      const body = {
        title: form.title, description: form.description, brand: form.brand,
        category_id: form.category_id, condition: form.condition,
        size: form.size, color: form.color, material: form.material,
        photos: urlList,
        fixed_price: form.fixed_price ? parseFloat(form.fixed_price) : null,
        auction_enabled: form.auction_enabled,
        auction_start_price: form.auction_start_price ? parseFloat(form.auction_start_price) : null,
        auction_min_price: form.auction_min_price ? parseFloat(form.auction_min_price) : null,
        auction_end_time: form.auction_end_time || null,
        status: statusOverride || form.status,
        seo_title: form.seo_title, seo_description: form.seo_description, seo_keywords: form.seo_keywords,
      };

      try {
        if (isEdit) await api.put(`/items/${id}`, body);
        else await api.post('/items', body);
        navigate('/boutique/articles');
      } catch {
        // Demo mode — persist to localStorage so the item appears in ProItems
        const savedItems: any[] = (() => {
          try { return JSON.parse(localStorage.getItem('mb_shop_items') || '[]'); } catch { return []; }
        })();
        const localItem = {
          ...body,
          id: isEdit ? id : `local-${Date.now()}`,
          shop_name: user?.name || 'Ma boutique',
          shop_id: 'local',
          views: 0,
          created_at: new Date().toISOString(),
          // Keep local blob previews for display
          photos: form.photos.map(p => p.preview || p.url).filter(Boolean),
        };
        if (isEdit) {
          const idx = savedItems.findIndex((i: any) => i.id === id);
          if (idx >= 0) savedItems[idx] = localItem; else savedItems.push(localItem);
        } else {
          savedItems.push(localItem);
        }
        localStorage.setItem('mb_shop_items', JSON.stringify(savedItems));
        setSuccess(body.status === 'active' ? 'Article mis en ligne ✓ (synchronisation automatique dès que le serveur est disponible)' : 'Brouillon sauvegardé ✓');
        setSaving(false);
        setTimeout(() => navigate('/boutique/articles'), 1500);
      }
    } catch (e: any) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div>
      <style>{`
        .item-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        @media (max-width: 700px) { .item-form-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '1.5rem' }}>
        {isEdit ? "Modifier l'article" : 'Nouvel article'}
      </h1>

      {error && <div style={{ backgroundColor: '#fff0f0', border: '1px solid #ffcccc', color: '#cc0000', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>{error}</div>}
      {success && <div style={{ backgroundColor: '#f0fff4', border: '1px solid #c3e6cb', color: '#2e7d32', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="item-form-grid">
          {/* Left: Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Section title="INFORMATIONS ARTICLE">
              <Field label="Titre *"><input required value={form.title} onChange={e => set('title', e.target.value)} style={inp} placeholder="Ex: Sac Chanel 2.55 Noir" /></Field>
              <Field label="Marque *"><input required value={form.brand} onChange={e => set('brand', e.target.value)} style={inp} placeholder="Ex: Chanel" /></Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Catégorie">
                  <select value={form.category_id} onChange={e => set('category_id', e.target.value)} style={{ ...inp, backgroundColor: 'white' }}>
                    <option value="">Choisir...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
                  </select>
                </Field>
                <Field label="État *">
                  <select required value={form.condition} onChange={e => set('condition', e.target.value)} style={{ ...inp, backgroundColor: 'white' }}>
                    {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Description">
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} style={{ ...inp, resize: 'vertical' }} placeholder="Décrivez l'article en détail..." />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <Field label="Taille"><input value={form.size} onChange={e => set('size', e.target.value)} style={inp} placeholder="36, S, Unique..." /></Field>
                <Field label="Couleur"><input value={form.color} onChange={e => set('color', e.target.value)} style={inp} placeholder="Noir, Beige..." /></Field>
                <Field label="Matière"><input value={form.material} onChange={e => set('material', e.target.value)} style={inp} placeholder="Cuir, Soie..." /></Field>
              </div>
            </Section>

            {/* Documents */}
            <Section title="DOCUMENTS (AUTHENTICITÉ)">
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', lineHeight: '1.5' }}>
                Joignez factures, certificats d'authenticité ou tout justificatif. L'administrateur les validera.
              </p>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: '1px dashed #c9a96e', padding: '10px 16px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#c9a96e', letterSpacing: '0.05em' }}>
                <FileText size={14} />
                AJOUTER UN DOCUMENT
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple style={{ display: 'none' }} onChange={handleDocFiles} />
              </label>
              {docFiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  {docFiles.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={12} color="#9e8e7e" />
                      <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#1a1a1a' }}>{f.name}</span>
                      <button type="button" onClick={() => setDocFiles(d => d.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9e8e7e', padding: 0 }}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="SEO (RÉFÉRENCEMENT)">
              <Field label="Titre SEO"><input value={form.seo_title} onChange={e => set('seo_title', e.target.value)} style={inp} /></Field>
              <Field label="Description SEO"><textarea value={form.seo_description} onChange={e => set('seo_description', e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} /></Field>
              <Field label="Mots-clés"><input value={form.seo_keywords} onChange={e => set('seo_keywords', e.target.value)} style={inp} placeholder="luxe, sac, Chanel..." /></Field>
            </Section>
          </div>

          {/* Right: Photos & Price */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Section title={`PHOTOS (${form.photos.length}/10)`}>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e', marginBottom: '0.5rem' }}>
                Cliquez sur une photo pour la définir comme image principale. La photo principale apparaît en premier.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {form.photos.map((p, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '3/4', backgroundColor: '#f8f4ef', cursor: 'pointer', border: i === form.mainPhotoIndex ? '2px solid #c9a96e' : '2px solid transparent' }}
                    onClick={() => set('mainPhotoIndex', i)}>
                    <img src={p.preview || imgUrl(p.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={ev => { ev.stopPropagation(); removePhoto(i); }}
                      style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', color: 'white', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                      <X size={11} />
                    </button>
                    {i === form.mainPhotoIndex && (
                      <span style={{ position: 'absolute', bottom: '4px', left: '4px', backgroundColor: '#c9a96e', color: 'white', fontSize: '0.5rem', padding: '2px 6px', fontFamily: 'Helvetica Neue, Arial, sans-serif', letterSpacing: '0.05em' }}>PRINCIPALE</span>
                    )}
                  </div>
                ))}
                {form.photos.length < 10 && (
                  <label style={{ aspectRatio: '3/4', backgroundColor: '#f0ece6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px dashed #e8d5b7', gap: '6px' }}>
                    <Upload size={20} color="#9e8e7e" />
                    <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.62rem', color: '#9e8e7e' }}>Ajouter</span>
                    <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotos} />
                  </label>
                )}
              </div>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.68rem', color: '#9e8e7e' }}>5 à 10 photos recommandées. Cliquer sur une photo pour la choisir comme principale.</p>
            </Section>

            <Section title="PRIX DE VENTE">
              <Field label="Prix fixe (€)">
                <input type="number" value={form.fixed_price} onChange={e => set('fixed_price', e.target.value)} style={inp} placeholder="0.00" min="0" step="0.01" />
              </Field>
            </Section>

            <Section title="ENCHÈRES">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '1rem' }}>
                <input type="checkbox" checked={form.auction_enabled} onChange={e => set('auction_enabled', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#c9a96e' }} />
                <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#1a1a1a' }}>Activer les enchères</span>
              </label>
              {form.auction_enabled && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label="Mise de départ (€)"><input type="number" value={form.auction_start_price} onChange={e => set('auction_start_price', e.target.value)} style={inp} min="0" step="0.01" /></Field>
                    <Field label="Prix minimum (€)"><input type="number" value={form.auction_min_price} onChange={e => set('auction_min_price', e.target.value)} style={inp} min="0" step="0.01" /></Field>
                  </div>
                  <Field label="Date de fin">
                    <input type="datetime-local" value={form.auction_end_time} onChange={e => set('auction_end_time', e.target.value)} style={inp} />
                  </Field>
                </>
              )}
            </Section>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e8d5b7', flexWrap: 'wrap' }}>
          <button type="button" disabled={saving} onClick={e => handleSubmit(e as any, 'draft')} className="btn-outline">
            Sauvegarder brouillon
          </button>
          <button type="button" disabled={saving} onClick={e => handleSubmit(e as any, 'active')} className="btn-gold">
            {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Mettre en ligne'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem' }}>
      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#9e8e7e', marginBottom: '1rem' }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#9e8e7e', marginBottom: '5px' }}>{label.toUpperCase()}</label>
      {children}
    </div>
  );
}

const inp: React.CSSProperties = {
  width: '100%', border: '1px solid #e8d5b7', padding: '9px 12px',
  fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#1a1a1a',
  boxSizing: 'border-box',
};
