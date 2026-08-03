const KEY = 'roster-mind-v1';

import { getSeedCoachSpace, normalizeCoachSpace } from './coachSpaceSeed.js';

export { getSeedCoachSpace, normalizeCoachSpace, STAFF } from './coachSpaceSeed.js';

export const DEFAULT_PROFILE = {
  onboardingComplete: false,
  personalizationComplete: false,
  step: 0,
  college: '',
  conference: '',
  division: 'D1',
  rosterSize: 28,
  formation: '4-3-3',
  gradLosses: 4,
  budgetK: 120,
  scholarshipCapK: 120,
  positionsNeeded: [],
  coachingStyle: [],
  playerPrefs: [],
  familyBackground: '',
  integrations: {},
  customIntegrations: [],
};

export function loadAppState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return { profile: { ...DEFAULT_PROFILE }, chats: [], coachSpace: getSeedCoachSpace() };
    }
    const parsed = JSON.parse(raw);
    const profile = { ...DEFAULT_PROFILE, ...parsed.profile };
    const coachSpace = normalizeCoachSpace(
      parsed.coachSpace?.length ? parsed.coachSpace : getSeedCoachSpace(profile.college),
      profile.college,
    );
    return {
      profile,
      chats: parsed.chats || [],
      coachSpace,
    };
  } catch {
    return { profile: { ...DEFAULT_PROFILE }, chats: [], coachSpace: getSeedCoachSpace() };
  }
}

export function saveAppState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetAppState() {
  localStorage.removeItem(KEY);
}
