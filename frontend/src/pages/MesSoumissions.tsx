import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Clock, CheckCircle, XCircle, Truck, Send, ChevronDown, ChevronUp } from 'lucide-react';

const SHIPPING_ADDRESS = 'Magali Berdah – Service Dépôt\n12 rue du Faubourg Saint-Honoré\n75008 Paris\nFrance';

const CARRIERS = [
  { id: 'colissimo', label: 'Colissimo', url: (n: string) => `https://www.laposte.fr/outils/suivre-vos-envois?code=${n}` },
  { id: 'chronopost', label: 'Chronopost', url: (n: string) => `https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLtc=${n}` },
  { id: 'dhl', label: 'DHL', url: (n: string) => `https://www.dhl.com/fr-fr/home/tracking.html?tracking-id=${n}` },
  { id: 'ups', label: 'UPS', url: (n: string) => `https://www.ups.com/track?tracknum=${n}` },
  { id: 'mondial', label: 'Mondial Relay', url: (n: string) => `https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=${n}` },
  { id: 'other', label: 'Autre', url: () => '' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: 'En cours de révision', color: '#b45309', bg: '#fef3c7', icon: Clock },
  approved: { label: 'Validé ✓', color: '#2e7d32', bg: '#d4edda', icon: CheckCircle },
  rejected: { label: 'Rejeté', color: '#cc0000', bg: '#f8d7da', icon: XCircle },
};

function loadMySubmissions(email: string): any[] {
  try {
    const all = JSON.parse(localStorage.getItem('mb_submissions') || '[]');
    return all.filter((s: any) => s.email === email);
  } catch { return []; }
}

function saveSubmission(updated: any) {
  try {
    const all = JSON.parse(localStorage.getItem('mb_submissions') || '[]');
    const next = all.map((s: any) => s.id === updated.id ? updated : s);
    localStorage.setItem('mb_submissions', JSON.stringify(next));
  } catch {}
}

export default function MesSoumissions() {
  const { user } = useStore();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [trackingForms, setTrackingForms] = useState<Record<string, { carrier: string; number: string }>>({});

  useEffect(() => {
    if (user) setSubmissions(loadMySubmissions(user.email));
  }, [user]);

  const setField = (id: string, key: string, val: string) =>
    setTrackingForms(f => ({ ...f, [id]: { ...f[id], [key]: val } }));

  const submitTracking = (sub: any) => {
    const form = trackingForms[sub.id] || {};
    if (!form.number?.trim()) return;
    const carrier = CARRIERS.find(c => c.id === form.carrier) || CARRIERS[0];
    const updated = {
      ...sub,
      tracking_number: form.number.trim(),
      carrier: form.carrier,
      carrier_label: carrier.label,
      tracking_url: carrier.id !== 'other' ? carrier.url(form.number.trim()) : '',
      tracking_sent: true,
    };
    saveSubmission(updated);
    setSubmissions(prev => prev.map(s => s.id === sub.id ? updated : s));
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', color: '#9e8e7e', marginBottom: '1rem' }}>
          Connectez-vous pour voir vos soumissions
        </p>
        <Link to="/" className="btn-gold">SE CONNECTER</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem 8rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.55rem', letterSpacing: '0.35em', color: '#c9a96e', marginBottom: '4px' }}>MON COMPTE</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 400, color: '#1a1a1a' }}>Mes soumissions</h1>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#9e8e7e', marginTop: '4px' }}>
          Suivez l'état de vos demandes de mise en vente
        </p>
      </div>

      {submissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'white', border: '1px solid #e8d5b7' }}>
          <Send size={40} color="#e8d5b7" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#9e8e7e', marginBottom: '1.5rem' }}>
            Vous n'avez pas encore soumis d'article
          </p>
          <Link to="/soumettre" className="btn-gold" style={{ fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Send size={14} /> SOUMETTRE UN ARTICLE
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {submissions.map(sub => {
            const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
            const Icon = cfg.icon;
            const isOpen = expanded === sub.id;
            const tf = trackingForms[sub.id] || { carrier: 'colissimo', number: '' };

            return (
              <div key={sub.id} style={{ backgroundColor: 'white', border: `1px solid ${sub.status === 'approved' ? '#c3e6cb' : sub.status === 'rejected' ? '#f5c6cb' : '#e8d5b7'}`, overflow: 'hidden' }}>
                {/* Status banner */}
                <div style={{ padding: '8px 16px', backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={15} color={cfg.color} />
                  <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: cfg.color, letterSpacing: '0.05em' }}>
                    {cfg.label}
                  </span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#bbb' }}>
                    {new Date(sub.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                  </span>
                </div>

                {/* Main info */}
                <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#1a1a1a', marginBottom: '3px' }}>{sub.brand}</p>
                    <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#9e8e7e' }}>
                      {sub.category} · {sub.photoCount} photo{sub.photoCount > 1 ? 's' : ''}
                      {sub.isVintage ? ' · Vintage' : ''}
                    </p>
                  </div>
                  <button onClick={() => setExpanded(isOpen ? null : sub.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9e8e7e', padding: '4px' }}>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid #f0ece6', padding: '1.25rem' }}>
                    {sub.description && (
                      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#1a1a1a', lineHeight: 1.6, marginBottom: '1rem' }}>
                        {sub.description}
                      </p>
                    )}

                    {/* Approved: show address + tracking form */}
                    {sub.status === 'approved' && (
                      <div>
                        <div style={{ backgroundColor: '#f0f9f0', border: '1px solid #c3e6cb', padding: '1.25rem', marginBottom: '1.25rem' }}>
                          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#2e7d32', marginBottom: '0.75rem' }}>
                            ADRESSE D'ENVOI
                          </p>
                          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#1a1a1a', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                            {SHIPPING_ADDRESS}
                          </p>
                        </div>

                        {sub.tracking_sent ? (
                          <div style={{ backgroundColor: '#d1ecf1', border: '1px solid #bee5eb', padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Truck size={16} color="#1976d2" />
                            <div>
                              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#1976d2', fontWeight: 700 }}>
                                Numéro de suivi envoyé ✓
                              </p>
                              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#1976d2' }}>
                                {sub.carrier_label} · {sub.tracking_number}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#9e8e7e', marginBottom: '10px' }}>
                              ENTREZ VOTRE NUMÉRO DE SUIVI
                            </p>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                              <select
                                value={tf.carrier}
                                onChange={e => setField(sub.id, 'carrier', e.target.value)}
                                style={{ padding: '9px 12px', border: '1px solid #e8d5b7', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', backgroundColor: 'white', flex: '0 0 auto' }}>
                                {CARRIERS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                              </select>
                              <input
                                value={tf.number}
                                onChange={e => setField(sub.id, 'number', e.target.value)}
                                placeholder="Ex: 2C12345678901"
                                style={{ flex: 1, padding: '9px 12px', border: '1px solid #e8d5b7', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', minWidth: '140px' }}
                              />
                            </div>
                            <button
                              onClick={() => submitTracking(sub)}
                              disabled={!tf.number?.trim()}
                              className="btn-gold"
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', opacity: tf.number?.trim() ? 1 : 0.5, width: '100%', justifyContent: 'center' }}>
                              <Truck size={14} /> CONFIRMER L'ENVOI
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rejected: explain */}
                    {sub.status === 'rejected' && (
                      <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', padding: '1rem' }}>
                        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#856404' }}>
                          Votre article n'a pas été retenu pour cette fois. Vous pouvez soumettre un autre article.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to="/soumettre" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#9e8e7e', textDecoration: 'none', letterSpacing: '0.05em' }}>
          + Soumettre un nouvel article
        </Link>
      </div>
    </div>
  );
}
