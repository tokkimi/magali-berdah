import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Send, Plus, Mail } from 'lucide-react';

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [tab, setTab] = useState('campaigns');
  const [form, setForm] = useState({ subject: '', content: '', target_categories: [] as string[] });
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    api.get('/admin/newsletter/subscribers').then(d => setSubscribers(d.subscribers || [])).catch(() => {});
    api.get('/admin/newsletter/campaigns').then(d => setCampaigns(d.campaigns || [])).catch(() => {});
  }, []);

  const createCampaign = async () => {
    setCreating(true);
    try {
      await api.post('/admin/newsletter/campaigns', form);
      const d = await api.get('/admin/newsletter/campaigns');
      setCampaigns(d.campaigns || []);
      setForm({ subject: '', content: '', target_categories: [] });
    } catch {} finally { setCreating(false); }
  };

  const sendCampaign = async (id: string) => {
    if (!confirm('Envoyer cette campagne maintenant ?')) return;
    setSending(id);
    try {
      const d = await api.post(`/admin/newsletter/campaigns/${id}/send`);
      alert(`Campagne envoyée à ${d.sent} abonnés`);
      const r = await api.get('/admin/newsletter/campaigns');
      setCampaigns(r.campaigns || []);
    } catch {} finally { setSending(null); }
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '2rem' }}>Newsletter</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e8d5b7' }}>
        {[{ id: 'campaigns', label: `Campagnes (${campaigns.length})` }, { id: 'subscribers', label: `Abonnés (${subscribers.filter(s => s.active).length})` }, { id: 'create', label: '+ Nouvelle campagne' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', borderBottom: tab === t.id ? '2px solid #c9a96e' : '2px solid transparent', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: tab === t.id ? '#c9a96e' : '#9e8e7e', marginBottom: '-1px' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'campaigns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {campaigns.length === 0 ? (
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#9e8e7e', textAlign: 'center', padding: '3rem' }}>Aucune campagne</p>
          ) : campaigns.map(c => (
            <div key={c.id} style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#1a1a1a', marginBottom: '4px' }}>{c.subject}</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: '#9e8e7e' }}>
                  Créée le {new Date(c.created_at).toLocaleDateString('fr-FR')} ·
                  {c.status === 'sent' ? ` Envoyée à ${c.sent_count} abonnés le ${new Date(c.sent_at).toLocaleDateString('fr-FR')}` : ' Brouillon'}
                </p>
              </div>
              {c.status === 'draft' && (
                <button onClick={() => sendCampaign(c.id)} disabled={sending === c.id} className="btn-gold" style={{ fontSize: '0.7rem', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={14} /> {sending === c.id ? 'Envoi...' : 'Envoyer'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'subscribers' && (
        <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e8d5b7', backgroundColor: '#f8f4ef' }}>
                {['Email', 'Nom', 'Statut', 'Inscrit le'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#9e8e7e' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscribers.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f0ece6' }}>
                  <td style={{ padding: '10px 14px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#1a1a1a' }}>{s.email}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', color: '#666' }}>{s.name || '-'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: s.active ? '#2e7d32' : '#cc0000' }}>
                      {s.active ? 'Actif' : 'Désabonné'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e' }}>
                    {new Date(s.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'create' && (
        <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '2rem', maxWidth: '700px' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 400, marginBottom: '1.5rem', color: '#1a1a1a' }}>Nouvelle campagne</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={lbl}>OBJET DE L'EMAIL</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={inp} placeholder="Ex: Nouvelle collection de luxe disponible !" />
            </div>
            <div>
              <label style={lbl}>CONTENU (HTML accepté)</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={12} style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }}
                placeholder="<h1>Bonjour,</h1><p>Découvrez nos nouvelles pièces...</p>" />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={createCampaign} disabled={creating || !form.subject || !form.content} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} /> {creating ? 'Création...' : 'Créer la campagne'}
              </button>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', alignSelf: 'center' }}>
                La campagne sera sauvegardée en brouillon et envoyée manuellement
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#9e8e7e', marginBottom: '6px' };
const inp: React.CSSProperties = { width: '100%', border: '1px solid #e8d5b7', padding: '10px 12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#1a1a1a' };
