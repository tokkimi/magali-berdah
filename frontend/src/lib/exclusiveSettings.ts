import { createClient } from '@supabase/supabase-js';

// Separate Supabase project solely for shared site settings (site_settings table)
const settingsSupabase = createClient(
  'https://qaxkkmomvzapedarfjfh.supabase.co',
  'sb_publishable_1lZ5LIpEZufFUMFWIvPtKA_rM3R51i2'
);

const SETTINGS_KEY = 'mb_exclusive_settings';
const ROW_ID = 'singleton';

export interface ExclusiveSettings {
  open_date: string;
  open_time: string;
  close_time: string;
  exclusive_ids: string[];
}

function defaults(): ExclusiveSettings {
  return { open_date: '', open_time: '09:00', close_time: '19:00', exclusive_ids: [] };
}

function fromLocal(): ExclusiveSettings {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return { ...defaults(), ...s, exclusive_ids: s.exclusive_ids || [] };
  } catch { return defaults(); }
}

function toLocal(s: ExclusiveSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export async function loadExclusiveSettings(): Promise<ExclusiveSettings> {
  try {
    const { data, error } = await settingsSupabase
      .from('site_settings')
      .select('open_date,open_time,close_time,exclusive_ids')
      .eq('id', ROW_ID)
      .maybeSingle();
    if (error || !data) return fromLocal();
    const s: ExclusiveSettings = {
      open_date: data.open_date || '',
      open_time: data.open_time || '09:00',
      close_time: data.close_time || '19:00',
      exclusive_ids: data.exclusive_ids || [],
    };
    toLocal(s);
    return s;
  } catch {
    return fromLocal();
  }
}

export async function saveExclusiveSettings(s: ExclusiveSettings): Promise<void> {
  toLocal(s);
  try {
    await settingsSupabase.from('site_settings').upsert(
      { id: ROW_ID, open_date: s.open_date, open_time: s.open_time, close_time: s.close_time, exclusive_ids: s.exclusive_ids },
      { onConflict: 'id' }
    );
  } catch {
    // Supabase unavailable — localStorage is the fallback
  }
}

export function getLocalExclusiveSettings(): ExclusiveSettings {
  return fromLocal();
}
