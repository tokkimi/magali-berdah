import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
export default function BrandLoading() {
 const [phase,setPhase]=useState('loading');
 const lang=useStore(s=>s.lang);
 useEffect(()=>{
  let closing:ReturnType<typeof setTimeout>;let stopped=false;let done=false;
  const finish=()=>{if(stopped||done)return;done=true;setPhase('finished');closing=setTimeout(()=>setPhase('hidden'),450)};
  const fallback=setTimeout(finish,2400);
  return()=>{stopped=true;clearTimeout(fallback);clearTimeout(closing)};
 },[]);
 if(phase==='hidden')return null;
 return <div className={`brand-loading ${phase}`} role="status" aria-label="Magali Berdah"><img src="/mb-logo.png" alt="Magali Berdah"/><p>{lang==='fr'?'L’EXCEPTION VOUS ATTEND':'SOMETHING EXCEPTIONAL AWAITS'}</p><div className="loading-line"/></div>;
}
