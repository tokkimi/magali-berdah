import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Lock, ShieldCheck } from 'lucide-react';
import { getAllItems } from '../lib/staticItems';
import { getSharedItem } from '../lib/marketplace';
import { imgUrl } from '../lib/api';

export default function GuestCheckout() {
  const { id } = useParams<{id:string}>(); const [item,setItem]=useState<any>(); const [email,setEmail]=useState(''); const [loading,setLoading]=useState(false); const [error,setError]=useState('');
  useEffect(()=>{if(id) void getSharedItem(id).then(found=>setItem(found||getAllItems().find(product=>product.id===id)));},[id]);
  async function checkout(event:FormEvent){event.preventDefault();if(!item||!email)return;setLoading(true);setError('');try{const response=await fetch('/api/create-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({itemId:item.id,title:item.title,amount:item.fixed_price,image:item.photos?.[0],email})});const data=await response.json();if(!response.ok||!data.url)throw new Error(data.error||'Le paiement est indisponible pour le moment.');window.location.assign(data.url);}catch(cause){setError(cause instanceof Error?cause.message:'Le paiement est indisponible pour le moment.');}finally{setLoading(false);}}
  if(!item)return <div className="checkout-shell"><p>Chargement de votre sac…</p></div>;
  return <main className="checkout-shell"><Link className="checkout-back" to={`/article/${item.id}`}><ChevronLeft size={17}/> Retour au sac</Link><div className="checkout-grid"><section><p className="eyebrow">ACHAT SÉCURISÉ</p><h1>Votre sac vous attend.</h1><div className="checkout-item"><img src={imgUrl(item.photos?.[0])} alt=""/><div><p>{item.brand}</p><h2>{item.title}</h2><strong>{Number(item.fixed_price).toLocaleString('fr-FR')} €</strong></div></div><div className="checkout-reassurance"><ShieldCheck size={20}/><span>Pièce vérifiée et contrôlée avec Entrupy. Livraison suivie incluse.</span></div></section><form onSubmit={checkout} className="checkout-form"><h2>Finaliser sans compte</h2><p>Votre reçu et le suivi de livraison seront envoyés à cette adresse.</p><label>Adresse e-mail<input type="email" value={email} onChange={event=>setEmail(event.target.value)} required autoComplete="email" placeholder="vous@exemple.com"/></label><button className="checkout-button" disabled={loading}>{loading?'Ouverture du paiement…':`Payer ${Number(item.fixed_price).toLocaleString('fr-FR')} €`}</button><div className="payment-methods"><span>Carte bancaire</span><span>PayPal</span><span>Alma · 2, 3 ou 4 fois</span></div>{error&&<p role="alert" className="checkout-error">{error}</p>}<p className="checkout-legal"><Lock size={13}/> Paiement sécurisé par Stripe. PayPal et Alma s’affichent selon votre pays et le montant.</p></form></div></main>;
}
