import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const pages: Record<string, { title: string; description: string }> = {
  '/': { title: 'Magali Berdah — Mode de luxe de seconde main', description: 'Ventes, enchères et lives de pièces de mode et maroquinerie de luxe de seconde main.' },
  '/catalogue': { title: 'Catalogue luxe de seconde main | Magali Berdah', description: 'Explorez les sacs, vêtements et accessoires de luxe proposés en vente directe ou aux enchères.' },
  '/lives': { title: 'Lives Whatnot en cours | Magali Berdah', description: 'Retrouvez les lives Whatnot en cours des ambassadeurs validés par Magali Berdah.' },
  '/comment-acheter': { title: 'Comment acheter | Magali Berdah', description: 'Découvrez comment acheter une pièce, participer aux enchères et suivre votre commande.' },
  '/faq': { title: 'Questions fréquentes | Magali Berdah', description: 'Réponses aux questions sur les achats, enchères, livraisons, retours et paiements.' },
  '/cgv': { title: 'Conditions générales de vente | Magali Berdah', description: 'Consultez les conditions générales applicables aux ventes et enchères du site Magali Berdah.' },
};

export default function SeoManager() {
  const location = useLocation();
  useEffect(() => {
    const key = location.pathname.startsWith('/article/') ? '/article' : location.pathname;
    const custom = (() => { try { return JSON.parse(localStorage.getItem('mb_seo') || 'null'); } catch { return null; } })();
    const page = key === '/' && custom?.site_title
      ? { title: custom.site_title, description: custom.site_description || pages['/'].description }
      : pages[key] || pages['/'];
    document.title = page.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = page.description;
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = `https://magali-berdah.vercel.app${location.pathname}`;
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (ogTitle) ogTitle.content = page.title;
    if (ogDescription) ogDescription.content = page.description;
    if (ogUrl) ogUrl.content = `https://magali-berdah.vercel.app${location.pathname}`;
  }, [location.pathname]);
  return null;
}
