import { Link } from 'react-router-dom';
import { Send, Shield, Star } from 'lucide-react';
import { useStore } from '../lib/store';

export default function ProPage() {
  const { user } = useStore();

  return (
    <div>
      {/* Hero */}
      <div style={{ backgroundColor: '#1a1a1a', padding: '6rem 2rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.4em', color: '#c9a96e', marginBottom: '1rem' }}>VENDRE SUR MAGALI BERDAH</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'white', fontWeight: 400, marginBottom: '1.5rem' }}>
          Soumettez vos pièces de luxe<br />à notre sélection
        </h1>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '1rem', color: '#9e8e7e', maxWidth: '500px', margin: '0 auto 2.5rem', lineHeight: '1.7' }}>
          Chaque pièce est examinée et validée par Magali avant d'être mise en vente. Soumettez vos articles en quelques clics.
        </p>
        {user?.role === 'pro' ? (
          <Link to="/boutique" className="btn-gold">ACCÉDER À MON ESPACE</Link>
        ) : (
          <Link to="/soumettre" className="btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <Send size={16} /> SOUMETTRE UN ARTICLE
          </Link>
        )}
      </div>

      {/* How it works */}
      <div style={{ padding: '5rem 2rem', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.65rem', letterSpacing: '0.4em', color: '#c9a96e', marginBottom: '0.75rem' }}>COMMENT ÇA MARCHE</p>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1a1a1a', marginBottom: '3rem' }}>En 3 étapes simples</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
          {[
            { step: '1', icon: Send, title: 'Soumettez votre article', text: 'Photos, description, certificats d\'authenticité — remplissez le formulaire en quelques minutes.' },
            { step: '2', icon: Shield, title: 'Validation par Magali', text: 'Chaque pièce est examinée. Si elle est acceptée, vous recevrez un email avec l\'adresse d\'envoi.' },
            { step: '3', icon: Star, title: 'Mise en vente', text: 'Après réception, votre article est photographié et mis en ligne avec le badge certifié.' },
          ].map(({ step, icon: Icon, title, text }) => (
            <div key={step} style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #c9a96e, #a8834a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Icon size={24} color="white" />
              </div>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 400, marginBottom: '0.75rem', color: '#1a1a1a' }}>{title}</h3>
              <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '0.85rem', color: '#9e8e7e', lineHeight: '1.7' }}>{text}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '3rem' }}>
          <Link to="/soumettre" className="btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <Send size={16} /> SOUMETTRE UN ARTICLE
          </Link>
        </div>
      </div>
    </div>
  );
}
