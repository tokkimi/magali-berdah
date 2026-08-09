import { supabase } from './supabase';

export interface WhatnotLive {
  email: string;
  display_name: string;
  whatnot_handle: string;
  show_url: string;
  preview_url?: string;
  live_title?: string;
  is_live: boolean;
  started_at?: string;
  expires_at?: string;
}

const tokenKey = (email: string) => `mb_whatnot_access_${email.toLowerCase()}`;
const requestKey = (email: string) => `mb_whatnot_request_${email.toLowerCase()}`;

export function getSavedWhatnotToken(email?: string) {
  return email ? localStorage.getItem(tokenKey(email)) || '' : '';
}

export function saveWhatnotToken(email: string, token: string) {
  localStorage.setItem(tokenKey(email), token.trim());
  window.dispatchEvent(new Event('whatnot-profile-updated'));
}

export function getSavedRequestSecret(email?: string) {
  return email ? localStorage.getItem(requestKey(email)) || '' : '';
}

export async function requestAmbassador(input: { email: string; displayName: string; handle: string; showUrl: string; previewUrl?: string; message?: string }) {
  const { data, error } = await supabase.rpc('request_whatnot_ambassador', {
    p_email: input.email, p_display_name: input.displayName, p_whatnot_handle: input.handle,
    p_show_url: input.showUrl, p_preview_url: input.previewUrl || null, p_message: input.message || null,
  });
  if (error) throw error;
  localStorage.setItem(requestKey(input.email), data as string);
  return data as string;
}

export async function checkAmbassadorRequest(email: string) {
  const secret = getSavedRequestSecret(email);
  if (!secret) return null;
  const { data, error } = await supabase.rpc('get_whatnot_ambassador_request', { p_email: email, p_request_secret: secret });
  if (error) return null;
  const result = data?.[0] as { status: 'pending' | 'approved' | 'rejected'; manage_token?: string } | undefined;
  if (result?.manage_token) {
    saveWhatnotToken(email, result.manage_token);
    localStorage.removeItem(requestKey(email));
  }
  return result || null;
}

export async function adminListAmbassadorRequests(adminCode: string) {
  const { data, error } = await supabase.rpc('admin_list_whatnot_requests', { p_admin_code: adminCode });
  if (error) throw error;
  return data || [];
}

export async function adminReviewAmbassadorRequest(adminCode: string, email: string, approved: boolean) {
  const { error } = await supabase.rpc('admin_review_whatnot_request', { p_admin_code: adminCode, p_email: email, p_approved: approved });
  if (error) throw error;
}

export async function getWhatnotLives(): Promise<WhatnotLive[]> {
  const { data, error } = await supabase.from('whatnot_profiles')
    .select('email,display_name,whatnot_handle,show_url,preview_url,live_title,is_live,started_at,expires_at')
    .eq('is_live', true)
    .order('started_at', { ascending: false });
  if (error) throw error;
  const now = Date.now();
  return ((data || []) as WhatnotLive[]).filter(live => !live.expires_at || new Date(live.expires_at).getTime() > now);
}

export async function getOwnWhatnotProfile(email: string, token: string): Promise<WhatnotLive | null> {
  if (!email || !token) return null;
  const { data, error } = await supabase.rpc('get_whatnot_profile', { p_email: email, p_manage_token: token });
  if (error) return null;
  return (data?.[0] || null) as WhatnotLive | null;
}

export async function setWhatnotLive(email: string, token: string, isLive: boolean) {
  const { error } = await supabase.rpc('set_whatnot_live', {
    p_email: email, p_manage_token: token, p_is_live: isLive, p_live_title: null,
  });
  if (error) throw error;
}

export async function adminConnectWhatnot(input: {
  adminCode: string; email: string; displayName: string; handle: string; showUrl: string; previewUrl?: string;
}) {
  const { data, error } = await supabase.rpc('admin_upsert_whatnot_profile', {
    p_admin_code: input.adminCode,
    p_email: input.email,
    p_display_name: input.displayName,
    p_whatnot_handle: input.handle,
    p_show_url: input.showUrl,
    p_preview_url: input.previewUrl || null,
  });
  if (error) throw error;
  return data?.[0]?.manage_token as string;
}

export function subscribeToWhatnotLives(refresh: () => void) {
  const channel = supabase.channel('whatnot-live-status')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'whatnot_profiles' }, refresh)
    .subscribe();
  return () => { void supabase.removeChannel(channel); };
}
