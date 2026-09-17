import { useEffect, useState } from 'react';
export default function BrandLoading() {
 const [phase,setPhase]=useState('loading');
 useEffect(()=>{
  let closing:ReturnType<typeof setTimeout>;let stopped=false;let done=false;
  const finish=()=>{if(stopped||done)return;done=true;setPhase('finished');closing=setTimeout(()=>setPhase('hidden'),450)};
  const image=new Image();image.src='/mb-logo.png';image.decode().catch(()=>{}).then(finish);
  const fallback=setTimeout(finish,2500);
  return()=>{stopped=true;clearTimeout(fallback);clearTimeout(closing)};
 },[]);
 if(phase==='hidden')return null;
 return <div className={`brand-loading ${phase}`} role="status" aria-label="Chargement de Magali Berdah"><img src="/mb-logo.png" alt="Magali Berdah"/><p>L’EXCEPTION VOUS ATTEND</p><div className="loading-line"/></div>;
}
