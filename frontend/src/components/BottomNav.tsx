import { useStore } from '../lib/store';
import { Link, useLocation } from 'react-router-dom';
import { Home, Gem, Gavel, Radio, Heart } from 'lucide-react';
export default function BottomNav() {
 const en=useStore(s=>s.lang)==='en';
 const {pathname,search}=useLocation();
 const entries=[{to:'/',label:en?'Home':'Accueil',icon:Home,active:pathname==='/'},{to:'/vente-exclusive',label:en?'Exclusives':'Exclusivités',icon:Gem,active:pathname==='/vente-exclusive'},{to:'/catalogue?type=auction',label:en?'Auctions':'Enchères',icon:Gavel,active:pathname==='/catalogue'&&search.includes('type=auction')},{to:'/lives',label:'Live',icon:Radio,active:pathname==='/lives'},{to:'/favoris',label:en?'Favourites':'Favoris',icon:Heart,active:pathname==='/favoris'}];
 return <nav className="premium-bottom" aria-label="Navigation principale">{entries.map(({to,label,icon:Icon,active})=><Link to={to} key={to} aria-current={active?'page':undefined}><Icon size={20} strokeWidth={1.5}/><span>{label}</span></Link>)}</nav>;
}
