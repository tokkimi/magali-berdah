import { useStore } from '../lib/store';
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
  const lang=useStore(s=>s.lang); const en=lang==='en';
  const go=(id:string)=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});
  useEffect(() => { if (paused) return; const timer = setInterval(() => setIndex(i => (i + 1) % slides.length), 6500); return () => clearInterval(timer); }, [paused]);
  const slide = slides[index];
  return <>
    <section className="bag-hero" aria-roledescription="carrousel" aria-label="Sélection de sacs">
      {slides.map((s, i) => <img key={s.image} className={`campaign-photo ${i === index ? 'shown' : ''}`} src={s.image} alt="" />)}
      <div className="campaign-shade" />
      <div className="campaign-copy">
        <p className="eyebrow">{en?(index===0?'THE MAGALI EDIT':'THE AUCTIONS'):slide.label}</p>
        <h1>{en?(index===0?'Your next\nfavourite bag.':'A rare find.\nYour next chapter.'):slide.title}</h1>
        <p>{en?'Pre-loved luxury bags.':'Des sacs de seconde main.'}<br />{en?'Timeless desire.':'Des envies de toujours.'}</p>
        <Link className="premium-cta" to={slide.link}>{en?(index===0?'Find my bag':'Browse auctions'):slide.cta} <ArrowUpRight size={17} /></Link>
      </div>
      <div className="campaign-controls">{slides.map((_, i) => <button key={i} aria-label={`Afficher la sélection ${i + 1}`} aria-pressed={i === index} className={i === index ? 'selected' : ''} onClick={() => setIndex(i)} />)}<button className="pause-slide" onClick={() => setPaused(p => !p)} aria-label={paused ? 'Animer le diaporama' : 'Mettre en pause'}>{paused ? <Play size={13} /> : <Pause size={13} />}</button></div>
    </section>
    <nav className="purchase-paths" aria-label="Comment souhaitez-vous acheter ?"><button onClick={() => go('direct-items')}>{en?"Buy now":"Acheter maintenant"} <ArrowUpRight size={17}/></button><button onClick={() => go('auction-items')}>{en?"Bid now":"Enchérir"} <ArrowUpRight size={17}/></button></nav>
    <nav className="bag-discovery" aria-label="Les sélections"><Link to="/catalogue">{en?"All bags":"Tous les sacs"}</Link><Link to="/catalogue?category=bags-handbags">{en?"Handbags":"Sacs à main"}</Link><Link to="/catalogue?category=bags-shoulder">{en?"Shoulder bags":"Bandoulières"}</Link><Link to="/catalogue?category=bags-clutch">{en?"Clutches":"Pochettes"}</Link><Link to="/catalogue?sort=created_at">{en?"New arrivals":"Nouveautés"}</Link></nav>
  </>;
}
