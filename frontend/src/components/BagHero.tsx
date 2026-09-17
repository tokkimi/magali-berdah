import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Pause, Play } from 'lucide-react';

const slides = [
  { title: 'Le prochain\ncoup de cœur.', label: 'LA SÉLECTION MAGALI', image: '/campaign-bag.jpg', cta: 'Trouver mon sac', link: '/catalogue?type=fixed' },
  { title: 'Une pièce rare.\nVotre prochaine histoire.', label: 'LES ENCHÈRES', image: '/campaign-bag-2.jpg', cta: 'Voir les enchères', link: '/catalogue?type=auction' },
];
export default function BagHero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { if (paused) return; const timer = setInterval(() => setIndex(i => (i + 1) % slides.length), 6500); return () => clearInterval(timer); }, [paused]);
  const slide = slides[index];
  return <>
    <section className="bag-hero" aria-roledescription="carrousel" aria-label="Sélection de sacs">
      {slides.map((s, i) => <img key={s.image} className={`campaign-photo ${i === index ? 'shown' : ''}`} src={s.image} alt="" />)}
      <div className="campaign-shade" />
      <div className="campaign-copy">
        <p className="eyebrow">{slide.label}</p>
        <h1>{slide.title}</h1>
        <p>Des sacs de seconde main.<br />Des envies de toujours.</p>
        <Link className="premium-cta" to={slide.link}>{slide.cta} <ArrowUpRight size={17} /></Link>
      </div>
      <div className="campaign-controls">{slides.map((_, i) => <button key={i} aria-label={`Afficher la sélection ${i + 1}`} aria-pressed={i === index} className={i === index ? 'selected' : ''} onClick={() => setIndex(i)} />)}<button className="pause-slide" onClick={() => setPaused(p => !p)} aria-label={paused ? 'Animer le diaporama' : 'Mettre en pause'}>{paused ? <Play size={13} /> : <Pause size={13} />}</button></div>
    </section>
    <nav className="purchase-paths" aria-label="Comment souhaitez-vous acheter ?"><Link to="/catalogue?type=fixed">Acheter maintenant <ArrowUpRight size={17}/></Link><Link to="/catalogue?type=auction">Enchérir <ArrowUpRight size={17}/></Link></nav>
    <nav className="bag-discovery" aria-label="Les sélections"><Link to="/catalogue">Tous les sacs</Link><Link to="/catalogue?category=bags-handbags">Sacs à main</Link><Link to="/catalogue?category=bags-shoulder">Bandoulières</Link><Link to="/catalogue?category=bags-clutch">Pochettes</Link><Link to="/catalogue?sort=created_at">Nouveautés</Link></nav>
  </>;
}
