import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://qaxkkmomvzapedarfjfh.supabase.co',
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_1lZ5LIpEZufFUMFWIvPtKA_rM3R51i2',
);
