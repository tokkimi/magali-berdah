import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gavel, X, GripHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { getSharedItem, subscribeToSharedAuctions } from '../lib/marketplace';
import { imgUrl } from '../lib/api';
export default function MyAuctionsBubble(){
 const user=useStore(s=>s.user);const [open,setOpen]=useState(false);const [items,setItems]=useState<any[]>([]);const [error,setError]=useState(false);const [now,setNow]=useState(Date.now());
 const [pos,setPos]=useState({x:0,y:0});const drag=useRef<{x:number;y:number;px:number;py:number}|null>(null);
 useEffect(()=>{if(!user){setItems([]);return}let alive=true;const refresh=async()=>{try{const {data,error}=await supabase.from('auction_bids').select('item_id').eq('bidder_id',user.id);if(error)throw error;const ids=[...new Set((data||[]).map(b=>b.item_id))];const rows=await Promise.all(ids.map(getSharedItem));if(alive){setItems(rows.filter(i=>i&&i.status==='active'&&new Date(i.auction_end_time).getTime()>Date.now()));setError(false)}}catch{if(alive)setError(true)}};void refresh();const stop=subscribeToSharedAuctions(refresh);return()=>{alive=false;stop()}},[user?.id]);
 useEffect(()=>{if(!open)return;const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t)},[open]);
 useEffect(()=>{const reset=()=>setPos({x:0,y:0});window.addEventListener('resize',reset);return()=>window.removeEventListener('resize',reset)},[]);
 const remaining=(end:string)=>{const s=Math.max(0,Math.floor((new Date(end).getTime()-now)/1000));return s?`${Math.floor(s/3600)}h ${String(Math.floor(s%3600/60)).padStart(2,'0')}m ${String(s%60).padStart(2,'0')}s`:'Terminée'};
 return <div className="my-auctions-bubble" style={{transform:`translate(${pos.x}px,${pos.y}px)`}}>
 {open&&<section className="my-auctions-panel" aria-label="Mes enchères en cours"><header><strong>Mes enchères en cours</strong><button onClick={()=>setOpen(false)} aria-label="Fermer mes enchères"><X size={17}/></button></header>{!user?<p>Connectez-vous depuis le menu pour retrouver vos enchères.</p>:error?<p>Le suivi est momentanément indisponible.</p>:!items.length?<p>Aucune enchère en cours. <Link to="/catalogue?type=auction">Découvrir les sacs</Link></p>:items.map(item=><Link className="my-auction-row" key={item.id} to={`/article/${item.id}`} onClick={()=>setOpen(false)}><img src={imgUrl(item.photos?.[0])} alt=""/><span><strong>{item.title}</strong><small>{remaining(item.auction_end_time)}</small></span></Link>)}</section>}
 <button className="my-auctions-trigger" aria-expanded={open} onClick={()=>setOpen(o=>!o)}><Gavel size={16}/><span>Mes enchères{items.length>0?` · ${items.length}`:''}</span></button>
 <button className="bubble-grip" aria-label="Déplacer la bulle avec les flèches" onKeyDown={e=>{const shifts:Record<string,[number,number]>={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]};if(shifts[e.key]){e.preventDefault();const [x,y]=shifts[e.key];setPos(p=>({x:Math.max(-innerWidth+205,Math.min(0,p.x+x)),y:Math.max(-innerHeight+250,Math.min(0,p.y+y))}))}}} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);drag.current={x:e.clientX,y:e.clientY,px:pos.x,py:pos.y}}} onPointerMove={e=>{const d=drag.current;if(!d)return;setPos({x:Math.max(-innerWidth+205,Math.min(0,d.px+e.clientX-d.x)),y:Math.max(-innerHeight+250,Math.min(0,d.py+e.clientY-d.y))})}} onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}}><GripHorizontal size={14}/></button>
 </div>
}
