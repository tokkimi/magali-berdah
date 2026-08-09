import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://ixtuxlirehrbsvifdfka.supabase.co',
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ZFuGaQ_JZTMXh1m0_Y1hMw_LBCqC7pE',
);
