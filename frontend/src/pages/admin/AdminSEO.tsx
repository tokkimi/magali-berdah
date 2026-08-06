import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function AdminSEO() {
  const [seo, setSeo] = useState({ site_title: '', site_description: '', site_keywords: '', og_image: '', google_analytics: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/admin/seo').then(d => { if (d.seo) setSeo(d.seo); }).catch(() => {});
  }, []);

  const save = async () => {
    try {
      await api.put('/admin/seo', seo);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '2rem' }}>Référencement (SEO)</h1>

      <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {[
          { label: 'Titre du site', key: 'site_title', placeholder: 'Magali Berdah | Mode de Luxe' },
          { label: 'Description meta', key: 'site_description', placeholder: 'Description courte du site (155 caractères max)', textarea: true },
          { label: 'Mots-clés', key: 'site_keywords', placeholder: 'luxe, mode, enchères, sacs, Hermès, Chanel...' },
          { label: 'Image Open Graph (URL)', key: 'og_image', placeholder: 'https://...' },
          { label: 'Google Analytics ID', key: 'google_analytics', placeholder: 'G-XXXXXXXXXX' },
        ].map(f => (
          <div key={f.key}>
            <label style={{ display: 'block', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#9e8e7e', marginBottom: '6px' }}>{f.label.toUpperCase()}</label>
            {f.textarea ? (
              <textarea value={(seo as any)[f.key]} onChange={e => setSeo(s => ({ ...s, [f.key]: e.target.value }))} rows={3}
                style={{ width: '100%', border: '1px solid #e8d5b7', padding: '10px 12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', resize: 'vertical' }}
                placeholder={f.placeholder} />
            ) : (
              <input value={(seo as any)[f.key]} onChange={e => setSeo(s => ({ ...s, [f.key]: e.target.value }))}
                style={{ width: '100%', border: '1px solid #e8d5b7', padding: '10px 12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem' }}
                placeholder={f.placeholder} />
            )}
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
          <button onClick={save} className="btn-gold">ENREGISTRER</button>
          {saved && <span style={{ color: '#2e7d32', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem' }}>✓ Sauvegardé</span>}
        </div>
      </div>

      <div style={{ backgroundColor: '#f8f4ef', border: '1px solid #e8d5b7', padding: '1.5rem', marginTop: '1.5rem' }}>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', lineHeight: '1.7' }}>
          <strong style={{ color: '#1a1a1a' }}>Aperçu Google :</strong><br />
          <span style={{ color: '#1a0dab', fontSize: '0.85rem' }}>{seo.site_title || 'Titre du site'}</span><br />
          <span style={{ color: '#006621', fontSize: '0.75rem' }}>https://magaliberdah.com</span><br />
          <span style={{ color: '#545454' }}>{seo.site_description || 'Description meta du site...'}</span>
        </p>
      </div>
    </div>
  );
}
