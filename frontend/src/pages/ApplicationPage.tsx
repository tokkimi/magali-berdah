import { useEffect, useState } from 'react';
import { Download, Smartphone, Bell, Star, Zap, Shield } from 'lucide-react';

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
}

export default function ApplicationPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const ios = isIOS();
  const android = isAndroid();

  useEffect(() => {
    if (isStandalone()) setInstalled(true);
    const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  const features = [
    { icon: <Bell size={22} color="#c9a96e" />, title: 'Notifications en temps réel', desc: "Soyez alerté dès qu'une enchère est sur le point de se terminer ou qu'une vente exclusive s'ouvre." },
    { icon: <Zap size={22} color="#c9a96e" />, title: 'Accès instantané', desc: 'Ouvrez l\'application en un geste depuis votre écran d\'accueil — sans passer par un navigateur.' },
    { icon: <Star size={22} color="#c9a96e" />, title: 'Ventes exclusives', desc: 'Ne manquez aucune sélection du jour grâce aux notifications programmées à l\'ouverture.' },
    { icon: <Shield size={22} color="#c9a96e" />, title: 'Connexion sécurisée', desc: 'Votre compte reste connecté pour enchérir et acheter en quelques secondes.' },
  ];

  return (
    <div style={{ backgroundColor: '#faf7f4', minHeight: '80vh', paddingBottom: '6rem' }}>
      {/* Hero */}
      <div style={{ backgroundColor: '#1a1a1a', padding: 'clamp(3rem, 8vw, 5rem) 1.5rem', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '20px', backgroundColor: '#c9a96e', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Smartphone size={38} color="white" />
        </div>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.4em', color: '#c9a96e', marginBottom: '0.75rem' }}>APPLICATION MOBILE</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 5vw, 3rem)', color: 'white', fontWeight: 400, marginBottom: '0.75rem', lineHeight: 1.2 }}>
          Magali Berdah sur votre téléphone
        </h1>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
          Installez l'application gratuitement et accédez à toutes les enchères et ventes exclusives depuis votre écran d'accueil.
        </p>

        {installed ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.4)', padding: '12px 24px', color: '#c9a96e', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.8rem', borderRadius: '4px' }}>
            ✓ Application déjà installée
          </div>
        ) : android && deferredPrompt ? (
          <button onClick={handleInstall} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: '#c9a96e', border: 'none', padding: '14px 28px', cursor: 'pointer', color: 'white', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', letterSpacing: '0.1em', borderRadius: '4px' }}>
            <Download size={16} /> INSTALLER L'APPLICATION
          </button>
        ) : ios ? null : (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem' }}>
            Ouvrez cette page depuis votre téléphone pour installer l'application.
          </p>
        )}
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 1.5rem 0' }}>
        {/* iOS instructions */}
        {ios && !installed && (
          <div style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', borderRadius: '8px', padding: '1.5rem', marginBottom: '2.5rem' }}>
            <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.25em', color: '#c9a96e', marginBottom: '1rem' }}>INSTALLER SUR IPHONE / IPAD</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { n: 1, text: 'Appuyez sur le bouton Partager', icon: (
                  <svg width="18" height="18" viewBox="0 0 50 50" fill="#007AFF"><path d="M30.3 13.7L25 8.4l-5.3 5.3-1.4-1.4L25 5.6l6.7 6.7z"/><path d="M24 7h2v21h-2z"/><path d="M35 40H15c-1.7 0-3-1.3-3-3V19c0-1.7 1.3-3 3-3h7v2h-7c-.6 0-1 .4-1 1v18c0 .6.4 1 1 1h20c.6 0 1-.4 1-1V19c0-.6-.4-1-1-1h-7v-2h7c1.7 0 3 1.3 3 3v18c0 1.7-1.3 3-3 3z"/></svg>
                )},
                { n: 2, text: 'Sélectionnez « Sur l\'écran d\'accueil »', icon: null },
                { n: 3, text: 'Appuyez sur « Ajouter »', icon: null },
              ].map(step => (
                <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#c9a96e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: '0.9rem', flexShrink: 0 }}>{step.n}</div>
                  <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#1a1a1a', flex: 1 }}>{step.text}</p>
                  {step.icon && <div style={{ flexShrink: 0 }}>{step.icon}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.3em', color: '#9e8e7e', marginBottom: '1.5rem' }}>POURQUOI INSTALLER L'APPLICATION</p>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr' }}>
          {features.map(f => (
            <div key={f.title} style={{ backgroundColor: 'white', border: '1px solid #e8d5b7', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ flexShrink: 0, marginTop: '2px' }}>{f.icon}</div>
              <div>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>{f.title}</p>
                <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.78rem', color: '#9e8e7e', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
