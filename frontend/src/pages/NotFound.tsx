import { Link } from 'react-router-dom';

export default function NotFound() {
  return <div style={{ minHeight: '55vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
    <div><p style={{ color: '#c9a96e', letterSpacing: '.2em', fontSize: 12 }}>ERREUR 404</p><h1 style={{ font: '400 clamp(2rem,7vw,3.5rem) Georgia, serif', margin: '10px 0' }}>Cette page n’existe pas</h1><p style={{ color: '#777', marginBottom: 24 }}>Le lien est peut-être ancien ou incorrect.</p><Link to="/" className="btn-gold" style={{ textDecoration: 'none' }}>REVENIR À L’ACCUEIL</Link></div>
  </div>;
}
