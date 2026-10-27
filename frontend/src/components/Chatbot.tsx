import { useState } from 'react';
import { X, Mail } from 'lucide-react';

const WA_ICON = (
  <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
    <path d="M16 2C8.268 2 2 8.268 2 16c0 2.49.654 4.826 1.797 6.844L2 30l7.344-1.766A13.94 13.94 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2z" fill="#fff"/>
    <path d="M21.8 19.4c-.3-.15-1.77-.874-2.044-.974-.274-.1-.474-.15-.674.15-.2.3-.774.974-.948 1.174-.174.2-.348.224-.648.075-.3-.15-1.267-.467-2.413-1.489-.892-.796-1.494-1.779-1.669-2.079-.174-.3-.018-.462.131-.611.134-.133.3-.348.45-.522.15-.174.2-.3.3-.5.1-.2.05-.374-.025-.524-.075-.15-.674-1.624-.923-2.224-.244-.582-.491-.503-.674-.512l-.574-.01c-.2 0-.524.075-.799.374-.274.3-1.047 1.023-1.047 2.497 0 1.474 1.072 2.898 1.222 3.098.15.2 2.112 3.225 5.118 4.523.715.308 1.273.492 1.708.63.718.228 1.372.196 1.888.119.576-.085 1.77-.723 2.02-1.422.25-.699.25-1.299.175-1.424-.075-.124-.275-.2-.574-.35z" fill="#25D366"/>
  </svg>
);

export default function Chatbot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Bulle flottante WhatsApp */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Nous contacter"
          style={{
            position: 'fixed', bottom: '110px', right: '1.25rem',
            width: '52px', height: '52px', borderRadius: '50%',
            backgroundColor: '#25D366', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(37,211,102,0.45)', zIndex: 250,
          }}>
          <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
            <path d="M16 2C8.268 2 2 8.268 2 16c0 2.49.654 4.826 1.797 6.844L2 30l7.344-1.766A13.94 13.94 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2z" fill="#fff"/>
            <path d="M21.8 19.4c-.3-.15-1.77-.874-2.044-.974-.274-.1-.474-.15-.674.15-.2.3-.774.974-.948 1.174-.174.2-.348.224-.648.075-.3-.15-1.267-.467-2.413-1.489-.892-.796-1.494-1.779-1.669-2.079-.174-.3-.018-.462.131-.611.134-.133.3-.348.45-.522.15-.174.2-.3.3-.5.1-.2.05-.374-.025-.524-.075-.15-.674-1.624-.923-2.224-.244-.582-.491-.503-.674-.512l-.574-.01c-.2 0-.524.075-.799.374-.274.3-1.047 1.023-1.047 2.497 0 1.474 1.072 2.898 1.222 3.098.15.2 2.112 3.225 5.118 4.523.715.308 1.273.492 1.708.63.718.228 1.372.196 1.888.119.576-.085 1.77-.723 2.02-1.422.25-.699.25-1.299.175-1.424-.075-.124-.275-.2-.574-.35z" fill="#25D366"/>
          </svg>
        </button>
      )}

      {/* Panneau de contact */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '110px', right: '1rem',
          width: 'min(290px, calc(100vw - 2rem))',
          backgroundColor: '#1a1a1a',
          boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
          zIndex: 250, borderRadius: '18px', overflow: 'hidden',
          fontFamily: 'Helvetica Neue, Arial, sans-serif',
        }}>
          {/* Header vert */}
          <div style={{ backgroundColor: '#25D366', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, margin: 0, letterSpacing: '0.01em' }}>Contact</p>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.7rem', margin: '2px 0 0', letterSpacing: '0.03em' }}>Réponse sous 24h</p>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.9)', padding: '2px', display: 'flex' }}>
              <X size={18} />
            </button>
          </div>

          {/* Boutons */}
          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a
              href="https://wa.me/33649708097"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '11px',
                backgroundColor: '#25D366', color: '#fff',
                textDecoration: 'none', padding: '13px 15px', borderRadius: '12px',
                fontSize: '0.85rem', fontWeight: 500,
              }}>
              {WA_ICON}
              WhatsApp
            </a>

            <a
              href="mailto:contact@vendyys.com"
              style={{
                display: 'flex', alignItems: 'center', gap: '11px',
                backgroundColor: '#2a2a2a', color: '#f0e9df',
                textDecoration: 'none', padding: '13px 15px', borderRadius: '12px',
                fontSize: '0.85rem', fontWeight: 500,
                border: '1px solid #3a3a3a',
              }}>
              <Mail size={20} color="#c9a96e" strokeWidth={1.5} />
              contact@vendyys.com
            </a>
          </div>
        </div>
      )}
    </>
  );
}
