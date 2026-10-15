const d = (days: number) => new Date(Date.now() + days * 86400000).toISOString();

export const STATIC_ITEMS: any[] = [
  {
    id: 'static-1', shop_id: 'static-shop', title: 'Tote YSL Icare Matelassé Bordeaux',
    description: 'Grand tote Icare Saint Laurent en cuir matelassé bordeaux. Monogramme YSL doré. État excellent.',
    brand: 'Saint Laurent', category_id: 'bags-handbags', condition: 'excellent',
    size: 'Taille unique', color: 'Bordeaux',
    photos: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80'],
    fixed_price: null, auction_enabled: 1, auction_start_price: 1200, auction_min_price: 950,
    auction_end_time: d(2), current_bid: null, status: 'active', featured: 1, certified: 1, views: 0,
    shop_name: 'La Boutique Élise', category_name_fr: 'Sacs à Main', category_name_en: 'Handbags',
    created_at: new Date().toISOString(),
  },
  {
    id: 'static-2', shop_id: 'static-shop', title: 'Sac Baguette Fendi Denim FF',
    description: 'Iconic Fendi Baguette en denim avec monogramme FF et rabat en cuir camel. Avec dustbag.',
    brand: 'Fendi', category_id: 'bags-shoulder', condition: 'excellent',
    size: 'Taille unique', color: 'Denim/Camel',
    photos: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80'],
    fixed_price: null, auction_enabled: 1, auction_start_price: 1800, auction_min_price: 1500,
    auction_end_time: d(4), current_bid: null, status: 'active', featured: 1, certified: 1, views: 0,
    shop_name: 'La Boutique Élise', category_name_fr: 'Sacs Bandoulière', category_name_en: 'Shoulder Bags',
    created_at: new Date().toISOString(),
  },
  {
    id: 'static-3', shop_id: 'static-shop', title: 'Sac Birkin 30 Hermès Fauve',
    description: 'Birkin 30 cuir Togo fauve, quincaillerie palladium. Boîte et dustbag inclus.',
    brand: 'Hermès', category_id: 'bags-handbags', condition: 'excellent',
    size: 'Taille unique', color: 'Fauve',
    photos: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80'],
    fixed_price: null, auction_enabled: 1, auction_start_price: 8500, auction_min_price: 7000,
    auction_end_time: d(5), current_bid: null, status: 'active', featured: 1, certified: 1, views: 0,
    shop_name: 'La Boutique Élise', category_name_fr: 'Sacs à Main', category_name_en: 'Handbags',
    created_at: new Date().toISOString(),
  },
  {
    id: 'static-4', shop_id: 'static-shop', title: 'Montre Cartier Tank Must',
    description: 'Tank Must acier, bracelet cuir bordeaux. Livrée avec boîte et papiers.',
    brand: 'Cartier', category_id: 'acc-watches', condition: 'excellent',
    size: 'Taille unique', color: 'Argent',
    photos: ['https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80'],
    fixed_price: null, auction_enabled: 1, auction_start_price: 1800, auction_min_price: 1500,
    auction_end_time: d(7), current_bid: null, status: 'active', featured: 1, certified: 1, views: 0,
    shop_name: 'La Boutique Élise', category_name_fr: 'Montres', category_name_en: 'Watches',
    created_at: new Date().toISOString(),
  },
  {
    id: 'static-5', shop_id: 'static-shop', title: 'Sac Kelly 28 Hermès Noir',
    description: 'Kelly 28 box calf noir, palladium. Intérieur impeccable, tous accessoires.',
    brand: 'Hermès', category_id: 'bags-handbags', condition: 'very_good',
    size: 'Taille unique', color: 'Noir',
    photos: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80'],
    fixed_price: null, auction_enabled: 1, auction_start_price: 11000, auction_min_price: 9500,
    auction_end_time: d(10), current_bid: null, status: 'active', featured: 1, certified: 1, views: 0,
    shop_name: 'La Boutique Élise', category_name_fr: 'Sacs à Main', category_name_en: 'Handbags',
    created_at: new Date().toISOString(),
  },
  {
    id: 'static-6', shop_id: 'static-shop', title: 'Pochette Cuir Noir Dolce & Gabbana',
    description: 'Pochette bandoulière en cuir noir avec bracelet poignet, logo DG. Très bon état.',
    brand: 'Dolce & Gabbana', category_id: 'bags-clutch', condition: 'very_good',
    size: 'Taille unique', color: 'Noir',
    photos: ['https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80'],
    fixed_price: 480, auction_enabled: 0, auction_start_price: null, auction_min_price: null,
    auction_end_time: null, current_bid: null, status: 'active', featured: 1, views: 0,
    shop_name: 'La Boutique Élise', category_name_fr: 'Pochettes', category_name_en: 'Clutches',
    created_at: new Date().toISOString(),
  },
  {
    id: 'static-9', shop_id: 'static-shop', title: 'Sac Structuré Suède Marron Polène',
    description: 'Sac structuré en suède marron, fermeture à rabat magnétique. Silhouette épurée. Neuf.',
    brand: 'Polène', category_id: 'bags-handbags', condition: 'excellent',
    size: 'Taille unique', color: 'Marron',
    photos: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80'],
    fixed_price: 420, auction_enabled: 0, auction_start_price: null, auction_min_price: null,
    auction_end_time: null, current_bid: null, status: 'active', featured: 1, views: 0,
    shop_name: 'La Boutique Élise', category_name_fr: 'Sacs à Main', category_name_en: 'Handbags',
    created_at: new Date().toISOString(),
  },
];

const PARENT_MAP: Record<string, string> = {
  'bags-handbags': 'bags', 'bags-shoulder': 'bags', 'bags-clutch': 'bags', 'bags-backpack': 'bags', 'bags-travel': 'bags',
  'acc-jewelry': 'accessories', 'acc-watches': 'accessories', 'acc-belts': 'accessories',
  'acc-scarves': 'accessories', 'acc-sunglasses': 'accessories',
};

function loadAdminItems(): any[] {
  try { return JSON.parse(localStorage.getItem('mb_admin_items') || '[]'); } catch { return []; }
}

const ALLOWED_PREFIXES = ['bags-', 'acc-'];

export function getAllItems(): any[] {
  return [...loadAdminItems(), ...STATIC_ITEMS].filter(item =>
    ALLOWED_PREFIXES.some(p => item.category_id?.startsWith(p))
  );
}

export function filterStaticItems(q: {
  type?: string; category?: string; brand?: string; search?: string;
  featured?: string; limit?: number; offset?: number; sort?: string;
}): { items: any[]; total: number } {
  const { type, category, brand, search, featured, limit = 20, offset = 0, sort = 'created_at' } = q;

  const allItems = getAllItems();

  let filtered = allItems.filter(item => {
    if (type === 'auction' && !item.auction_enabled) return false;
    if (type === 'fixed' && item.fixed_price == null) return false;
    if (featured === 'true' && !item.featured) return false;
    if (brand && !item.brand.toLowerCase().includes(brand.toLowerCase())) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!item.title.toLowerCase().includes(s) && !item.brand.toLowerCase().includes(s) && !item.description.toLowerCase().includes(s)) return false;
    }
    if (category) {
      if (item.category_id !== category && PARENT_MAP[item.category_id] !== category) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (b.featured !== a.featured) return b.featured - a.featured;
    if (sort === 'price_asc') return (a.fixed_price || a.auction_start_price || 0) - (b.fixed_price || b.auction_start_price || 0);
    if (sort === 'price_desc') return (b.fixed_price || b.auction_start_price || 0) - (a.fixed_price || a.auction_start_price || 0);
    return 0;
  });

  return { items: filtered.slice(offset, offset + limit), total: filtered.length };
}
