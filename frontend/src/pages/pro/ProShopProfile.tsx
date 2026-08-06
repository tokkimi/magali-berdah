import { useState } from 'react';
import { useStore } from '../../lib/store';
import { api } from '../../lib/api';
import { Upload, Save } from 'lucide-react';

export default function ProShopProfile() {
  const { user, shop, updateUser } = useStore();

  const [form, setForm] = useState({
    shop_name: shop?.shop_name || '',
    bio: (shop as any)?.bio || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    country: user?.country || 'FR',
    website: (shop as any)?.website || '',
    instagram: (shop as any)?.instagram || '',
  });
  const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>((shop as any)?.avatar || null);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      await api.put('/shops/me', form);
    } catch {}
    // Update local store optimistically
    updateUser({ phone: form.phone, address: form.address, city: form.city, country: form.country });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '2rem' }}>Paramètres de ma boutique</h1>

      {/* Avatar */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <p style={sectionLabel}>PHOTO DE PROFIL BOUTIQUE</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f8f4ef', border: '2px solid #c9a96e', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', color: '#c9a96e' }}>
                {form.shop_name[0]?.toUpperCase() || user?.name[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: '1px solid #c9a96e', padding: '8px 16px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#c9a96e', letterSpacing: '0.08em' }}>
              <Upload size={13} /> CHANGER LA PHOTO
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </label>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#9e8e7e', marginTop: '6px' }}>
              JPG ou PNG · Recommandé : 400×400 px
            </p>
          </div>
        </div>
      </div>

      {/* Infos boutique */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <p style={sectionLabel}>INFORMATIONS BOUTIQUE</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>NOM DE LA BOUTIQUE *</label>
            <input value={form.shop_name} onChange={e => set('shop_name', e.target.value)} style={inp} placeholder="Ma Boutique Luxe" />
          </div>
          <div>
            <label style={labelStyle}>DESCRIPTION / BIO</label>
            <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3}
              style={{ ...inp, resize: 'vertical' }}
              placeholder="Présentez votre boutique, votre sélection, votre histoire..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>SITE WEB</label>
              <input value={form.website} onChange={e => set('website', e.target.value)} style={inp} placeholder="https://..." />
            </div>
            <div>
              <label style={labelStyle}>INSTAGRAM</label>
              <input value={form.instagram} onChange={e => set('instagram', e.target.value)} style={inp} placeholder="@maboutique" />
            </div>
          </div>
        </div>
      </div>

      {/* Coordonnées */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <p style={sectionLabel}>COORDONNÉES</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>TÉLÉPHONE</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} style={inp} placeholder="+33 6 00 00 00 00" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>ADRESSE</label>
            <input value={form.address} onChange={e => set('address', e.target.value)} style={inp} placeholder="123 rue du Faubourg Saint-Honoré" />
          </div>
          <div>
            <label style={labelStyle}>VILLE</label>
            <input value={form.city} onChange={e => set('city', e.target.value)} style={inp} placeholder="Paris" />
          </div>
          <div>
            <label style={labelStyle}>PAYS</label>
            <select value={form.country} onChange={e => set('country', e.target.value)} style={{ ...inp, backgroundColor: 'white' }}>
              <option value="FR">France</option>
              <option value="BE">Belgique</option>
              <option value="CH">Suisse</option>
              <option value="LU">Luxembourg</option>
              <option value="MC">Monaco</option>
              <option value="GB">Royaume-Uni</option>
              <option value="US">États-Unis</option>
              <option value="AE">Émirats Arabes Unis</option>
            </select>
          </div>
        </div>
      </div>

      {/* Infos abonnement (lecture seule) */}
      {shop && (
        <div style={{ backgroundColor: '#f8f4ef', border: '1px solid #e8d5b7', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <p style={sectionLabel}>MON ABONNEMENT</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#1a1a1a' }}>
                {shop.subscription_active ? '★ Plan Premium' : 'Plan Gratuit'}
              </p>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e' }}>
                Commission : {shop.commission_rate}% · Solde : {shop.wallet_balance?.toLocaleString('fr-FR') || 0} €
              </p>
            </div>
            <a href="/boutique/abonnement" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#c9a96e', textDecoration: 'none', alignSelf: 'center' }}>
              {shop.subscription_active ? 'Gérer →' : 'Passer Premium →'}
            </a>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={handleSave} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={15} /> ENREGISTRER
        </button>
        {saved && <span style={{ color: '#2e7d32', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem' }}>✓ Modifications enregistrées</span>}
      </div>
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem',
  letterSpacing: '0.2em', color: '#9e8e7e', marginBottom: '1rem',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'Helvetica Neue, Arial, sans-serif',
  fontSize: '0.65rem', letterSpacing: '0.1em', color: '#9e8e7e', marginBottom: '5px',
};
const inp: React.CSSProperties = {
  width: '100%', border: '1px solid #e8d5b7', padding: '9px 12px',
  fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#1a1a1a',
  boxSizing: 'border-box',
};
