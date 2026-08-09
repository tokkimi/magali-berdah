import { supabase } from './supabase';

export async function getSharedItems(filters: { type?: string; category?: string; limit?: number } = {}) {
  let query = supabase.from('auction_items').select('*').in('status', ['active', 'sold', 'unsold']).order('created_at', { ascending: false });
  if (filters.type === 'auction') query = query.eq('auction_enabled', true);
  if (filters.type === 'fixed') query = query.not('fixed_price', 'is', null);
  if (filters.category) {
    const prefixes: Record<string, string> = { women: 'women-', men: 'men-', bags: 'bags-', accessories: 'acc-' };
    const prefix = prefixes[filters.category];
    query = prefix ? query.like('category_id', `${prefix}%`) : query.eq('category_id', filters.category);
  }
  if (filters.limit) query = query.limit(filters.limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(item => ({ ...item, __shared: true }));
}

export async function getSharedItem(id: string) {
  const { data, error } = await supabase.from('auction_items').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? { ...data, __shared: true } : null;
}

export async function placeSharedBid(itemId: string, amount: number) {
  const { data, error } = await supabase.rpc('place_auction_bid', { p_item_id: itemId, p_amount: amount });
  if (error) throw error;
  return data?.[0];
}

export async function getSharedBids(itemId: string) {
  const { data, error } = await supabase.from('auction_bids').select('id,amount,created_at,bidder_id').eq('item_id', itemId).order('amount', { ascending: false });
  if (error) throw error;
  return (data || []).map((bid, index) => ({ ...bid, bidder_name: index === 0 ? 'Meilleure offre' : 'Enchérisseur' }));
}

export async function getMyAuctionWins() {
  await supabase.rpc('finalize_expired_auctions');
  const { data, error } = await supabase.from('auction_wins').select('*,auction_items(*)').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export function subscribeToSharedAuctions(refresh: () => void) {
  const channel = supabase.channel('shared-auctions')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'auction_items' }, refresh)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'auction_bids' }, refresh)
    .subscribe();
  return () => { void supabase.removeChannel(channel); };
}
