export interface WhatnotLive {
  id: string;
  userEmail: string;
  username: string;
  whatnotUrl: string;
  previewUrl?: string;
  title?: string;
  isLive: boolean;
  startedAt: string;
}

const LIVES_KEY = 'mb_whatnot_lives';
const AMBASSADORS_KEY = 'mb_whatnot_ambassadors';

export function getWhatnotLives(): WhatnotLive[] {
  try {
    return (JSON.parse(localStorage.getItem(LIVES_KEY) || '[]') as WhatnotLive[])
      .filter(live => live.isLive);
  } catch { return []; }
}

export function saveWhatnotLive(live: WhatnotLive) {
  const all = getAllLives();
  const next = [live, ...all.filter(item => item.userEmail !== live.userEmail)];
  localStorage.setItem(LIVES_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('whatnot-lives-updated'));
}

export function stopWhatnotLive(userEmail: string) {
  const next = getAllLives().map(live => live.userEmail === userEmail ? { ...live, isLive: false } : live);
  localStorage.setItem(LIVES_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('whatnot-lives-updated'));
}

function getAllLives(): WhatnotLive[] {
  try { return JSON.parse(localStorage.getItem(LIVES_KEY) || '[]'); } catch { return []; }
}

export function getApprovedAmbassadors(): string[] {
  try { return JSON.parse(localStorage.getItem(AMBASSADORS_KEY) || '[]'); } catch { return []; }
}

export function isApprovedAmbassador(email?: string) {
  return !!email && getApprovedAmbassadors().includes(email.toLowerCase());
}

export function setAmbassadorApproval(email: string, approved: boolean) {
  const normalized = email.toLowerCase();
  const current = new Set(getApprovedAmbassadors());
  if (approved) current.add(normalized); else current.delete(normalized);
  localStorage.setItem(AMBASSADORS_KEY, JSON.stringify([...current]));
  window.dispatchEvent(new Event('whatnot-ambassadors-updated'));
}

