import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Mail, ChevronDown, ChevronUp } from 'lucide-react';

const SHIPPING_ADDRESS = 'Magali Berdah – Service Dépôt\n12 rue du Faubourg Saint-Honoré\n75008 Paris\nFrance';

const CONDITIONS: Record<string, string> = {
  excellent: 'Excellent état',
  very_good: 'Très bon état',
  good: 'Bon état',
  fair: 'État correct',
};

function loadSubmissions(): any[] {
  try { return JSON.parse(localStorage.getItem('mb_submissions') || '[]'); } catch { return []; }
}
function saveSubmissions(subs: any[]) {
  try { localStorage.setItem('mb_submissions', JSON.stringify(subs)); } catch {}
}

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [emailModal, setEmailModal] = useState<any>(null);

  useEffect(() => {
    setSubmissions(loadSubmissions());
  }, []);

  const updateStatus = (id: string, status: 'approved' | 'rejected') => {
    const updated = submissions.map(s => s.id === id ? { ...s, status } : s);
    setSubmissions(updated);
    saveSubmissions(updated);
  };

  const approve = (sub: any) => {
    updateStatus(sub.id, 'approved');
    setEmailModal(sub);
  };

  const reject = (id: string) => {
    if (!confirm('Refuser cette demande ?')) return;
    updateStatus(id, 'rejected');
  };

  const filtered = submissions.filter(s => {
    if (filter === 'pending') return s.status === 'pending';
    if (filter === 'approved') return s.status === 'approved';
    if (filter === 'rejected') return s.status === 'rejected';
    return true;
  });

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  return (
    <div>
      {/* Email modal */}
      {emailModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', maxWidth: '560px', width: '100%', padding: '2rem', position: 'relative' }}>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#c9a96e', marginBottom: '0.5rem' }}>EMAIL DE VALIDATION</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '1.5rem' }}>
              Envoyer les instructions à {emailModal.name}
            </h2>
            <div style={{ backgroundColor: '#f8f4ef', padding: '1.25rem', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#1a1a1a', lineHeight: 1.7, marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
{`Bonjour ${emailModal.name},

Bonne nouvelle ! Votre article "${emailModal.brand}${emailModal.isVintage ? ' (Vintage)' : ''}" a été sélectionné pour apparaître sur la plateforme Magali Berdah.

Pour finaliser la mise en vente, merci d'envoyer votre article à l'adresse suivante :

${SHIPPING_ADDRESS}

Merci d'inclure votre nom et email dans le colis.
Dès réception et vérification, votre article sera mis en ligne.

À très bientôt,
L'équipe Magali Berdah`}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a href={`mailto:${emailModal.email}?subject=Votre article sélectionné – Magali Berdah&body=${encodeURIComponent(`Bonjour ${emailModal.name},\n\nBonne nouvelle ! Votre article "${emailModal.brand}${emailModal.isVintage ? ' (Vintage)' : ''}" a été sélectionné pour apparaître sur la plateforme Magali Berdah.\n\nPour finaliser la mise en vente, merci d'envoyer votre article à l'adresse suivante :\n\n${SHIPPING_ADDRESS}\n\nMerci d'inclure votre nom et email dans le colis.\nDès réception et vérification, votre article sera mis en ligne.\n\nÀ très bientôt,\nL'équipe Magali Berdah`)}`}
                className="btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center', textDecoration: 'none', fontSize: '0.75rem' }}>
                <Mail size={14} /> OUVRIR L'EMAIL
              </a>
              <button onClick={() => setEmailModal(null)}
                style={{ flex: 1, padding: '10px', border: '1px solid #e8d5b7', background: 'none', cursor: 'pointer', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e' }}>
                FERMER
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a' }}>
            Demandes de dépôt
            {pendingCount > 0 && (
              <span style={{ marginLeft: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#c9a96e', color: 'white', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', fontWeight: 700, verticalAlign: 'middle' }}>
                {pendingCount}
              </span>
            )}
          </h1>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#9e8e7e', marginTop: '4px' }}>
            Articles soumis par les utilisateurs pour mise en vente
          </p>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ border: '1px solid #e8d5b7', padding: '6px 12px', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', backgroundColor: 'white' }}>
          <option value="all">Toutes ({submissions.length})</option>
          <option value="pending">En attente ({submissions.filter(s => s.status === 'pending').length})</option>
          <option value="approved">Approuvées ({submissions.filter(s => s.status === 'approved').length})</option>
          <option value="rejected">Refusées ({submissions.filter(s => s.status === 'rejected').length})</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'white', border: '1px solid #e8d5b7' }}>
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#9e8e7e' }}>
            {submissions.length === 0 ? 'Aucune demande reçue pour l\'instant.' : 'Aucune demande dans cette catégorie.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(sub => (
            <div key={sub.id} style={{ backgroundColor: 'white', border: `1px solid ${sub.status === 'pending' ? '#e8d5b7' : sub.status === 'approved' ? '#c3e6cb' : '#f5c6cb'}` }}>
              {/* Header */}
              <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#1a1a1a', fontWeight: 400 }}>
                      {sub.brand}
                    </p>
                    {sub.isVintage && (
                      <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.55rem', letterSpacing: '0.1em', color: '#9e8e7e', border: '1px solid #e8d5b7', padding: '2px 6px', borderRadius: '20px' }}>
                        VINTAGE
                      </span>
                    )}
                    <span style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', color: sub.status === 'pending' ? '#ff9800' : sub.status === 'approved' ? '#2e7d32' : '#cc0000', fontWeight: 600 }}>
                      {sub.status === 'pending' ? '● En attente' : sub.status === 'approved' ? '✓ Approuvée' : '✗ Refusée'}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.75rem', color: '#9e8e7e', marginTop: '2px' }}>
                    {sub.category} · {CONDITIONS[sub.condition] || sub.condition} · {sub.photoCount} photo{sub.photoCount > 1 ? 's' : ''}{sub.docNames?.length > 0 ? ` · ${sub.docNames.length} doc` : ''}
                  </p>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#c9a96e', marginTop: '3px' }}>
                    {sub.name} · {sub.email}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {sub.status === 'pending' && (
                    <>
                      <button onClick={() => approve(sub)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'linear-gradient(135deg, #c9a96e, #a8834a)', border: 'none', cursor: 'pointer', color: 'white', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                        <CheckCircle size={13} /> VALIDER
                      </button>
                      <button onClick={() => reject(sub.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'none', border: '1px solid #cc0000', cursor: 'pointer', color: '#cc0000', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem' }}>
                        <XCircle size={13} /> REFUSER
                      </button>
                    </>
                  )}
                  {sub.status === 'approved' && (
                    <button onClick={() => setEmailModal(sub)}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', border: '1px solid #c9a96e', background: 'none', cursor: 'pointer', color: '#c9a96e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.7rem' }}>
                      <Mail size={13} /> RENVOYER EMAIL
                    </button>
                  )}
                  <button onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9e8e7e', padding: '4px' }}>
                    {expanded === sub.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Détail expandable */}
              {expanded === sub.id && (
                <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #f0ece6' }}>
                  {sub.description && (
                    <div style={{ marginTop: '1rem' }}>
                      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#9e8e7e', marginBottom: '6px' }}>DESCRIPTION</p>
                      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', color: '#1a1a1a', lineHeight: 1.6 }}>{sub.description}</p>
                    </div>
                  )}
                  {sub.photoNames?.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#9e8e7e', marginBottom: '6px' }}>PHOTOS JOINTES ({sub.photoNames.length})</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {sub.photoNames.map((n: string, i: number) => (
                          <span key={i} style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#666', backgroundColor: '#f8f4ef', padding: '4px 8px', borderRadius: '4px' }}>{n}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {sub.docNames?.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#9e8e7e', marginBottom: '6px' }}>DOCUMENTS D'AUTHENTICITÉ ({sub.docNames.length})</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {sub.docNames.map((n: string, i: number) => (
                          <span key={i} style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.72rem', color: '#c9a96e', backgroundColor: '#fdf6ec', padding: '4px 8px', borderRadius: '4px' }}>📄 {n}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', color: '#bbb', marginTop: '1rem' }}>
                    Soumis le {new Date(sub.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
