import { useState } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { useStore } from '../lib/store';

const CATEGORIES = [
  'Sacs à Main', 'Sacs Bandoulière', 'Pochettes', 'Sacs Backpack',
  'Robes', 'Tops & Blouses', 'Pantalons & Jeans', 'Vestes & Manteaux', 'Chaussures Femme',
  'Chemises & Polos', 'Pantalons Homme', 'Costumes', 'Chaussures Homme',
  'Montres', 'Bijoux', 'Ceintures', 'Foulards', 'Lunettes',
];

function saveSubmission(sub: any) {
  try {
    const existing = JSON.parse(localStorage.getItem('mb_submissions') || '[]');
    existing.unshift(sub);
    localStorage.setItem('mb_submissions', JSON.stringify(existing));
  } catch {}
}

export default function SoumettreArticle() {
  const { user } = useStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    brand: '',
    category: '',
    condition: 'excellent',
    isVintage: false,
    description: '',
  });
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [docs, setDocs] = useState<{ file: File; name: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setPhotos(prev => [...prev, ...newPhotos].slice(0, 8));
  };

  const handleDocs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocs(prev => [...prev, ...files.map(f => ({ file: f, name: f.name }))].slice(0, 5));
  };

  const removePhoto = (i: number) => setPhotos(prev => prev.filter((_, idx) => idx !== i));
  const removeDoc = (i: number) => setDocs(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.brand || !form.category) {
      setError('Merci de remplir tous les champs obligatoires.');
      return;
    }
    if (photos.length === 0) {
      setError('Ajoutez au moins une photo de l\'article.');
      return;
    }
    setError('');
    const submission = {
      id: `sub-${Date.now()}`,
      ...form,
      photoCount: photos.length,
      photoNames: photos.map(p => p.file.name),
      docNames: docs.map(d => d.name),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    saveSubmission(submission);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #c9a96e, #a8834a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={32} color="white" />
        </div>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.3em', color: '#c9a96e', marginBottom: '0.5rem' }}>DEMANDE ENVOYÉE</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '1rem' }}>Merci pour votre soumission</h1>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.88rem', color: '#9e8e7e', lineHeight: 1.7, marginBottom: '2rem' }}>
          Magali Berdah va examiner votre article. Si votre pièce est sélectionnée, vous recevrez un email avec l'adresse à laquelle envoyer votre article pour authentification et mise en vente.
        </p>
        <button onClick={() => { setSubmitted(false); setPhotos([]); setDocs([]); setForm({ name: user?.name || '', email: user?.email || '', brand: '', category: '', condition: 'excellent', isVintage: false, description: '' }); }}
          className="btn-gold">
          SOUMETTRE UN AUTRE ARTICLE
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>
      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.55rem', letterSpacing: '0.35em', color: '#c9a96e', marginBottom: '4px' }}>VENDRE SUR MAGALI BERDAH</p>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '0.5rem' }}>Soumettre un article</h1>
      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#9e8e7e', marginBottom: '2rem', lineHeight: 1.6 }}>
        Envoyez-nous les photos et informations de votre pièce. Si elle est sélectionnée, nous vous contacterons pour organiser l'envoi.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Coordonnées */}
        <section style={card}>
          <p style={sectionLabel}>VOS COORDONNÉES</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>NOM *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} style={inp} placeholder="Votre nom" required />
            </div>
            <div>
              <label style={labelStyle}>EMAIL *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={inp} placeholder="votre@email.com" required />
            </div>
          </div>
        </section>

        {/* Photos */}
        <section style={card}>
          <p style={sectionLabel}>PHOTOS DE L'ARTICLE *</p>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', marginBottom: '1rem' }}>
            Ajoutez jusqu'à 8 photos claires (fond neutre, plusieurs angles). La qualité des photos est déterminante.
          </p>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: '1.5px dashed #c9a96e', padding: '12px 20px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#c9a96e', letterSpacing: '0.08em', marginBottom: '1rem' }}>
            <Upload size={14} /> AJOUTER DES PHOTOS
            <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotos} />
          </label>
          {photos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {photos.map((p, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '6px', overflow: 'hidden' }}>
                  <img src={p.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removePhoto(i)} style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={10} color="white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Infos article */}
        <section style={card}>
          <p style={sectionLabel}>INFORMATIONS SUR L'ARTICLE</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>MARQUE *</label>
                <input value={form.brand} onChange={e => set('brand', e.target.value)} style={inp} placeholder="ex: Hermès, Chanel..." required />
              </div>
              <div>
                <label style={labelStyle}>CATÉGORIE *</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} style={{ ...inp, backgroundColor: 'white' }} required>
                  <option value="">Choisir...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>ÉTAT</label>
              <select value={form.condition} onChange={e => set('condition', e.target.value)} style={{ ...inp, backgroundColor: 'white' }}>
                <option value="excellent">Excellent état — comme neuf</option>
                <option value="very_good">Très bon état — légères traces d'usure</option>
                <option value="good">Bon état — usure visible mais bien entretenu</option>
                <option value="fair">État correct — usure notable</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" id="vintage" checked={form.isVintage} onChange={e => set('isVintage', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#c9a96e', cursor: 'pointer' }} />
              <label htmlFor="vintage" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#1a1a1a', cursor: 'pointer' }}>
                Article vintage (plus de 20 ans)
              </label>
            </div>
            <div>
              <label style={labelStyle}>DESCRIPTION (optionnel)</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                style={{ ...inp, resize: 'vertical' }}
                placeholder="Décrivez l'article, son histoire, ses accessoires inclus (dustbag, boîte, papiers...)..." />
            </div>
          </div>
        </section>

        {/* Documents */}
        <section style={card}>
          <p style={sectionLabel}>PREUVES D'AUTHENTICITÉ (optionnel mais recommandé)</p>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', marginBottom: '1rem', lineHeight: 1.6 }}>
            Facture d'achat, certificat d'authenticité, carte de garantie... Ces documents augmentent vos chances d'être sélectionné.
          </p>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: '1px solid #e8d5b7', padding: '10px 16px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#9e8e7e', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            <FileText size={14} /> JOINDRE UN DOCUMENT (PDF, JPG, PNG)
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple style={{ display: 'none' }} onChange={handleDocs} />
          </label>
          {docs.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid #e8d5b7', marginBottom: '6px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1a1a1a' }}>
              <FileText size={14} color="#c9a96e" />
              {d.name}
              <button type="button" onClick={() => removeDoc(i)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9e8e7e' }}>
                <X size={14} />
              </button>
            </div>
          ))}
        </section>

        {error && (
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#cc0000', padding: '10px 14px', backgroundColor: '#fff5f5', border: '1px solid #ffcccc' }}>
            {error}
          </p>
        )}

        <button type="submit" className="btn-gold" style={{ fontSize: '0.78rem', padding: '14px 32px', alignSelf: 'flex-start' }}>
          ENVOYER MA DEMANDE
        </button>
      </form>
    </div>
  );
}

const card: React.CSSProperties = { backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem' };
const sectionLabel: React.CSSProperties = { fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#9e8e7e', marginBottom: '1rem' };
const labelStyle: React.CSSProperties = { display: 'block', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#9e8e7e', marginBottom: '5px' };
const inp: React.CSSProperties = { width: '100%', border: '1px solid #e8d5b7', padding: '9px 12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#1a1a1a', boxSizing: 'border-box' };
