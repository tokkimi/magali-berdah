import { create } from 'zustand';
import { api } from './api';
import { STATIC_ITEMS } from './staticItems';
import { supabase } from './supabase';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  verified: number;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  dob?: string;
}

interface Shop {
  id: string;
  shop_name: string;
  subscription_active: number;
  commission_rate: number;
  wallet_balance: number;
  total_sales: number;
}

interface Store {
  user: User | null;
  shop: Shop | null;
  token: string | null;
  lang: 'fr' | 'en';
  favIds: Set<string>;
  certifiedIds: Set<string>;
  setLang: (l: 'fr' | 'en') => void;
  login: (token: string, user: User, shop?: Shop) => void;
  logout: () => void;
  updateUser: (u: Partial<User>) => void;
  fetchMe: () => Promise<void>;
  fetchFavs: () => Promise<void>;
  toggleFavId: (id: string) => void;
  setCertified: (id: string, certified: boolean) => void;
}

function loadSet(key: string): Set<string> {
  try { return new Set<string>(JSON.parse(localStorage.getItem(key) || '[]')); } catch { return new Set(); }
}
function saveSet(key: string, ids: Set<string>) {
  try { localStorage.setItem(key, JSON.stringify([...ids])); } catch {}
}
// keep old helpers for compat
function loadFavIds() { return loadSet('mb_fav_ids'); }
function saveFavIds(ids: Set<string>) { saveSet('mb_fav_ids', ids); }

function loadCertifiedIds(): Set<string> {
  // Pre-certified items from static data (visible to everyone, no backend needed)
  const base = new Set<string>(STATIC_ITEMS.filter(i => i.certified).map(i => i.id));
  // Merge with dynamically certified IDs saved by admin in localStorage
  for (const id of loadSet('mb_certified_ids')) base.add(id);
  return base;
}

export const useStore = create<Store>((set, get) => ({
  user: null,
  shop: null,
  token: localStorage.getItem('mb_token'),
  lang: (localStorage.getItem('mb_lang') as 'fr' | 'en') || 'fr',
  favIds: loadFavIds(),
  certifiedIds: loadCertifiedIds(),
  setLang: (l) => {
    localStorage.setItem('mb_lang', l);
    set({ lang: l });
  },
  login: (token, user, shop) => {
    localStorage.setItem('mb_token', token);
    set({ token, user, shop: shop || null });
  },
  logout: () => {
    localStorage.removeItem('mb_token');
    void supabase.auth.signOut();
    set({ token: null, user: null, shop: null });
  },
  updateUser: (u) => set(s => ({ user: s.user ? { ...s.user, ...u } : null })),
  fetchMe: async () => {
    const legacyToken = get().token;
    if (legacyToken?.startsWith('demo.')) {
      localStorage.removeItem('mb_token');
      set({ token: null, user: null, shop: null });
      return;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    const authUser = sessionData.session?.user;
    if (sessionData.session && authUser) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
      localStorage.setItem('mb_token', sessionData.session.access_token);
      set({
        token: sessionData.session.access_token,
        user: {
          id: authUser.id, email: authUser.email || '',
          name: profile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Utilisateur',
          role: authUser.app_metadata?.role === 'admin' ? 'admin' : 'buyer',
          verified: profile?.verified || authUser.email_confirmed_at ? 1 : 0,
          phone: profile?.phone || undefined, address: profile?.address || undefined,
          city: profile?.city || undefined, country: profile?.country || 'FR', avatar: profile?.avatar || undefined,
        },
        shop: null,
      });
      return;
    }
    const token = get().token;
    if (!token) return;
    try {
      const data = await api.get('/auth/me');
      set({ user: data.user, shop: data.shop || null });
      get().fetchFavs();
    } catch (e: any) {
      // Only disconnect on explicit auth rejection (401), not on network errors
      if (e?.message?.includes('401') || e?.message?.toLowerCase().includes('unauthorized') || e?.message?.toLowerCase().includes('token')) {
        localStorage.removeItem('mb_token');
        set({ token: null, user: null, shop: null });
      }
      // Network error → keep user logged in
    }
  },
  fetchFavs: async () => {
    if (!get().token) return;
    try {
      const data = await api.get('/favorites');
      const ids = new Set<string>((data.favorites || []).map((f: any) => f.id));
      saveFavIds(ids);
      set({ favIds: ids });
    } catch {}
  },
  toggleFavId: (id: string) => {
    set(s => {
      const next = new Set(s.favIds);
      if (next.has(id)) next.delete(id); else next.add(id);
      saveFavIds(next);
      return { favIds: next };
    });
  },
  setCertified: (id: string, certified: boolean) => {
    set(s => {
      const next = new Set(s.certifiedIds);
      if (certified) next.add(id); else next.delete(id);
      saveSet('mb_certified_ids', next);
      return { certifiedIds: next };
    });
  },
}));

// Translations
type TKey = keyof typeof translations.fr;

export const translations = {
  fr: {
    sales: 'Ventes',
    auctions: 'Enchères',
    women: 'Femme',
    men: 'Homme',
    bags: 'Sacs',
    accessories: 'Accessoires',
    search: 'Rechercher...',
    login: 'Connexion',
    register: "S'inscrire",
    logout: 'Déconnexion',
    profile: 'Mon Profil',
    myOrders: 'Mes Achats',
    myBids: 'Mes Enchères',
    favorites: 'Favoris',
    newItems: 'Nouvelles Pièces',
    featuredAuctions: 'Enchères à la Une',
    buyNow: 'Acheter',
    bidNow: 'Enchérir',
    currentBid: 'Enchère actuelle',
    startingBid: 'Mise de départ',
    timeLeft: 'Temps restant',
    brand: 'Marque',
    condition: 'État',
    size: 'Taille',
    color: 'Couleur',
    description: 'Description',
    shipping: 'Livraison incluse',
    placeBid: 'Placer une offre',
    yourBid: 'Votre offre (€)',
    minBid: 'Offre minimale',
    excellent: 'Excellent état',
    very_good: 'Très bon état',
    good: 'Bon état',
    fair: 'État correct',
    newsletter: 'Newsletter',
    subscribeNewsletter: 'Restez informé(e) des dernières pièces',
    subscribe: "S'abonner",
    cgv: 'CGV',
    privacy: 'Politique de confidentialité',
    contact: 'Contact',
    aboutUs: 'À propos',
    cookieConsent: 'Nous utilisons des cookies pour améliorer votre expérience.',
    acceptCookies: 'Accepter',
    refuseCookies: 'Refuser',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    noResults: 'Aucun résultat',
    price: 'Prix',
    sortBy: 'Trier par',
    newest: 'Plus récents',
    priceLow: 'Prix croissant',
    priceHigh: 'Prix décroissant',
    mostViewed: 'Plus vus',
    endingSoon: 'Fin imminente',
    proAccount: 'Espace Boutique',
    dashboard: 'Tableau de bord',
    myItems: 'Mes Articles',
    myStore: 'Ma Boutique',
    wallet: 'Portefeuille',
    subscription: 'Abonnement',
    addItem: 'Ajouter un article',
    chatbot: 'Assistance',
    adminPanel: 'Administration',
    home: 'Accueil',
    allItems: 'Tous les articles',
    // Hero
    heroTagline: 'MAGALI BERDAH · MODE DE LUXE',
    heroTitle: "Des pièces d'exception,",
    heroHighlight: 'vendues ou aux enchères.',
    heroCtaSales: 'VENTE DIRECTE',
    heroCtaAuctions: 'ENCHÈRES EN COURS',
    // Sections
    sectionOngoing: 'EN COURS',
    sectionSelection: 'SÉLECTION',
    sectionTrend: 'TENDANCE',
    womenSection: 'Femme',
    menSection: 'Homme',
    bagsSection: 'Sacs de luxe',
    seeAll: 'Tout voir',
    seeMore: 'VOIR PLUS',
    // How to buy
    howToBuy: 'Comment acheter ?',
    buyGuide: "Guide d'achat",
    buyGuideDesc: "Votre guide d'achat et commandes",
    faqLabel: 'FAQ',
    faqDesc: 'Vos questions, nos réponses',
    authenticity: 'AUTHENTICITÉ',
    authenticityDesc: 'Vendeurs vérifiés, pièces garanties',
    // Trust
    verifiedSellers: 'Vendeurs vérifiés',
    siretChecked: 'SIRET contrôlé',
    shippingIncluded: 'Livraison incluse',
    realTimeTracking: 'Suivi en temps réel',
    secureAuctions: 'Enchères sécurisées',
    securePayment: 'Paiement protégé',
    returns14: 'Retour 14 jours',
    euRights: 'Droit EU garanti',
    // Catalogue
    typeLabel: 'TYPE',
    allTypes: 'Tous',
    categoriesLabel: 'CATÉGORIES',
    brandsLabel: 'MARQUES',
    noItemsFound: 'Aucun article trouvé',
    tryOtherFilters: "Essayez d'autres filtres ou revenez bientôt",
    results: 'article',
    resultsPlural: 'articles',
    // Footer
    subscribeThanks: 'Merci de votre inscription',
    emailPlaceholder: 'Votre email',
    footerDesc: 'La référence de la mode de luxe de seconde main. Pièces authentiques, ventes et enchères exclusives.',
    footerBuy: 'ACHETER',
    footerSales: 'Ventes',
    footerAuctions: 'Enchères',
    footerNew: 'Nouvelles pièces',
    footerPro: 'BOUTIQUES PRO',
    footerOpenShop: 'Ouvrir une boutique',
    footerPremium: 'Abonnement Premium',
    footerCommission: 'Commission & tarifs',
    footerInfo: 'INFORMATIONS',
    // Chat
    chatTitle: 'Assistance Magali Berdah',
    chatWelcome: 'Bonjour ! Comment puis-je vous aider ?',
    chatPlaceholder: 'Votre question...',
    chatError: 'Désolée, une erreur est survenue.',
  },
  en: {
    sales: 'Sales',
    auctions: 'Auctions',
    women: 'Women',
    men: 'Men',
    bags: 'Bags',
    accessories: 'Accessories',
    search: 'Search...',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'My Profile',
    myOrders: 'My Purchases',
    myBids: 'My Bids',
    favorites: 'Favorites',
    newItems: 'New Arrivals',
    featuredAuctions: 'Featured Auctions',
    buyNow: 'Buy Now',
    bidNow: 'Bid Now',
    currentBid: 'Current bid',
    startingBid: 'Starting bid',
    timeLeft: 'Time left',
    brand: 'Brand',
    condition: 'Condition',
    size: 'Size',
    color: 'Color',
    description: 'Description',
    shipping: 'Shipping included',
    placeBid: 'Place a bid',
    yourBid: 'Your bid (€)',
    minBid: 'Minimum bid',
    excellent: 'Excellent condition',
    very_good: 'Very good condition',
    good: 'Good condition',
    fair: 'Fair condition',
    newsletter: 'Newsletter',
    subscribeNewsletter: 'Stay updated on latest arrivals',
    subscribe: 'Subscribe',
    cgv: 'Terms & Conditions',
    privacy: 'Privacy Policy',
    contact: 'Contact',
    aboutUs: 'About',
    cookieConsent: 'We use cookies to enhance your experience.',
    acceptCookies: 'Accept',
    refuseCookies: 'Decline',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    noResults: 'No results',
    price: 'Price',
    sortBy: 'Sort by',
    newest: 'Newest',
    priceLow: 'Price: Low to High',
    priceHigh: 'Price: High to Low',
    mostViewed: 'Most viewed',
    endingSoon: 'Ending soon',
    proAccount: 'Shop Space',
    dashboard: 'Dashboard',
    myItems: 'My Items',
    myStore: 'My Store',
    wallet: 'Wallet',
    subscription: 'Subscription',
    addItem: 'Add Item',
    chatbot: 'Assistant',
    adminPanel: 'Admin Panel',
    home: 'Home',
    allItems: 'All items',
    // Hero
    heroTagline: 'MAGALI BERDAH · LUXURY FASHION',
    heroTitle: 'Exceptional pieces,',
    heroHighlight: 'for sale or at auction.',
    heroCtaSales: 'DIRECT SALE',
    heroCtaAuctions: 'LIVE AUCTIONS',
    // Sections
    sectionOngoing: 'ONGOING',
    sectionSelection: 'SELECTION',
    sectionTrend: 'TRENDING',
    womenSection: 'Women',
    menSection: 'Men',
    bagsSection: 'Luxury Bags',
    seeAll: 'See all',
    seeMore: 'SEE MORE',
    // How to buy
    howToBuy: 'How to buy?',
    buyGuide: 'Buying guide',
    buyGuideDesc: 'Your buying guide and orders',
    faqLabel: 'FAQ',
    faqDesc: 'Your questions, our answers',
    authenticity: 'AUTHENTICITY',
    authenticityDesc: 'Verified sellers, guaranteed pieces',
    // Trust
    verifiedSellers: 'Verified sellers',
    siretChecked: 'ID verified',
    shippingIncluded: 'Shipping included',
    realTimeTracking: 'Real-time tracking',
    secureAuctions: 'Secure auctions',
    securePayment: 'Protected payment',
    returns14: '14-day returns',
    euRights: 'EU rights guaranteed',
    // Catalogue
    typeLabel: 'TYPE',
    allTypes: 'All',
    categoriesLabel: 'CATEGORIES',
    brandsLabel: 'BRANDS',
    noItemsFound: 'No items found',
    tryOtherFilters: 'Try other filters or check back soon',
    results: 'item',
    resultsPlural: 'items',
    // Footer
    subscribeThanks: 'Thank you for subscribing',
    emailPlaceholder: 'Your email',
    footerDesc: 'The reference for second-hand luxury fashion. Authentic pieces, exclusive sales and auctions.',
    footerBuy: 'SHOP',
    footerSales: 'Sales',
    footerAuctions: 'Auctions',
    footerNew: 'New arrivals',
    footerPro: 'PRO SHOPS',
    footerOpenShop: 'Open a shop',
    footerPremium: 'Premium Subscription',
    footerCommission: 'Commission & pricing',
    footerInfo: 'INFORMATION',
    // Chat
    chatTitle: 'Magali Berdah Support',
    chatWelcome: 'Hello! How can I help you?',
    chatPlaceholder: 'Your question...',
    chatError: 'Sorry, an error occurred.',
  }
};

export function useT() {
  const lang = useStore(s => s.lang);
  return (key: TKey) => translations[lang][key] || translations.fr[key] || key;
}
