import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock } from 'lucide-react';
import { useStore } from '../lib/store';
import { getSharedItem, placeSharedBid } from '../lib/marketplace';
import { imgUrl } from '../lib/api';
import AuthModal from './AuthModal';

export default function ItemAction({ item, initial, onClose }: { item: any; initial: 'buy'|'bid'; onClose: () => void }) {
  const {user,lang}=useStore(); const en=lang==='en';
  const tr=(fr:string,english:string)=>en?english:fr;
  const [mode,setMode]=useState(initial); const [email,setEmail]=useState(user?.email||'');
  const [amount,setAmount]=useState(''); const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  const [success,setSuccess]=useState(false);const [accepted,setAccepted]=useState(false);
  const [auth,setAuth]=useState<'login'|'register'|null>(null);const [method,setMethod]=useState('card');
  const [fresh,setFresh]=useState(item);const panel=useRef<HTMLDivElement>(null);
  useEffect(()=>{let active=true;void getSharedItem(item.id).then(value=>{if(active&&value)setFresh(value)}).catch(()=>{});return()=>{active=false}},[item.id]);
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;const overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';panel.current?.focus();
    const key=(e:KeyboardEvent)=>{if(auth)return;if(e.key==='Escape'&&!busy)onClose();if(e.key==='Tab'){
      const nodes=panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),a[href]');
      if(!nodes?.length)return;const first=nodes[0],last=nodes[nodes.length-1];
      if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel.current)){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }};
    document.addEventListener('keydown',key);return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key);previous?.focus()};
  },[onClose,auth,busy]);
  const minimum=Number(fresh.current_bid||fresh.auction_start_price||0)+1;
  const price=Number(fresh.fixed_price||0);
  const money=(v:number)=>new Intl.NumberFormat(en?'en-GB':'fr-FR',{style:'currency',currency:'EUR'}).format(v);
  const ended=!fresh.auction_end_time||new Date(fresh.auction_end_time).getTime()<=Date.now();
  async function submit(e:React.FormEvent){e.preventDefault();if(busy)return;setError('');setBusy(true);
    try{
      if(mode==='bid'){
        if(!user)throw new Error(tr('Connectez-vous pour enchérir.','Sign in to bid.'));
        if(!accepted||!Number.isFinite(Number(amount))||Number(amount)<minimum)throw new Error(tr('Vérifiez votre offre et acceptez les conditions.','Check your bid and accept the terms.'));
        const result=await placeSharedBid(item.id,Number(amount));
        if(!result)throw new Error(tr('L’offre n’a pas été confirmée.','The bid was not confirmed.'));
        setSuccess(true);
      }else{
        const response=await fetch('/api/create-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({itemId:item.id,email,method})});
        if(!response.headers.get('content-type')?.includes('application/json'))throw new Error(tr('Le paiement sécurisé n’est pas encore disponible. Aucun montant débité.','Secure payment is not available yet. No charge has been made.'));
        const data=await response.json();if(!response.ok)throw new Error(data.error||tr('Paiement indisponible.','Payment unavailable.'));
        const url=new URL(data.url);if(url.protocol!=='https:'||url.hostname!=='checkout.stripe.com')throw new Error(tr('Lien de paiement invalide.','Invalid payment link.'));
        window.location.assign(url.href);
      }
    }catch(cause){setError(cause instanceof Error?cause.message:tr('Action impossible. Veuillez réessayer.','Unable to complete this action. Please try again.'))}finally{setBusy(false)}
  }
  return createPortal(<><div className="item-action-overlay" onClick={e=>{if(e.target===e.currentTarget&&!busy)onClose()}}>
    <div ref={panel} tabIndex={-1} className="item-action-sheet" role="dialog" aria-modal="true" aria-label={fresh.title}>
      <button className="item-action-close" disabled={busy} onClick={onClose} aria-label={tr('Fermer','Close')}><X size={20}/></button>
      <div className="action-product"><img src={imgUrl(fresh.photos?.[0])} alt=""/><div><p className="eyebrow">{fresh.brand}</p><h2>{fresh.title}</h2></div></div>
      <div className="action-tabs">{fresh.auction_enabled&&<button type="button" aria-pressed={mode==='bid'} onClick={()=>{setMode('bid');setError('')}}>{tr('Enchérir','Place a bid')}</button>}{price>0&&<button type="button" aria-pressed={mode==='buy'} onClick={()=>{setMode('buy');setError('')}}>{tr('Acheter maintenant','Buy now')}</button>}</div>
      {success?<p role="status">{tr('Votre enchère a été confirmée par le serveur.','Your bid has been confirmed by the server.')}</p>:mode==='bid'&&!user?<><p>{tr('Connectez-vous à votre compte pour placer une enchère.','Sign in to your account to place a bid.')}</p><button className="item-action-submit" onClick={()=>setAuth('login')}>{tr('Se connecter','Sign in')}</button></>:<form onSubmit={submit}>
        <p className="item-action-price">{mode==='buy'?money(price):`${tr('Offre minimum','Minimum bid')} : ${money(minimum)}`}</p>
        {mode==='bid'?<><label>{tr('Votre offre (€)','Your bid (€)')}<input type="number" min={minimum} step="1" required value={amount} onChange={e=>setAmount(e.target.value)}/></label><label className="action-consent"><input type="checkbox" required checked={accepted} onChange={e=>setAccepted(e.target.checked)}/><span>{tr('Je m’engage à régler l’article si je remporte l’enchère et j’accepte les','I agree to pay if I win the auction and accept the')} <a href="/cgv" target="_blank" rel="noopener noreferrer">{tr('conditions de vente','terms of sale')}</a>.</span></label>{ended&&<p role="status">{tr('Cette enchère est terminée.','This auction has ended.')}</p>}</>:<><label>{tr('Email pour le reçu','Email for your receipt')}<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><fieldset className="payment-options"><legend>{tr('Votre paiement','Your payment')}</legend>{[['card',tr('Payer maintenant · Carte','Pay now · Card')],['paypal','PayPal'],['alma',tr('Payer en plusieurs fois · Alma','Pay in instalments · Alma')]].map(([value,label])=><label key={value}><input type="radio" name="payment" value={value} checked={method===value} onChange={()=>setMethod(value)}/>{label}</label>)}</fieldset><p className="action-note">{tr('PayPal et Alma : sous réserve d’activation, du montant et d’acceptation par le prestataire. Échéancier et frais présentés avant validation.','PayPal and Alma: subject to activation, amount and provider approval. The schedule and fees are shown before confirmation.')}</p></>}
        {error&&<p role="alert" className="action-error">{error}</p>}
        <button className="item-action-submit" disabled={busy||(mode==='bid'&&ended)}>{busy?tr('Vérification…','Checking…'):mode==='bid'?tr('Confirmer mon enchère','Confirm my bid'):method==='alma'?tr('Voir les échéances','View instalments'):`${tr('Payer maintenant','Pay now')} · ${money(price)}`}</button>
        {mode==='buy'&&<p className="action-note"><Lock size={12}/> {tr('Sans compte obligatoire. Le paiement se finalise sur la page sécurisée du prestataire.','No account required. Payment is completed on the provider’s secure page.')}</p>}
      </form>}
    </div></div>{auth&&<AuthModal mode={auth} onSwitchMode={setAuth} onClose={()=>setAuth(null)}/>}</>,document.body);
}
