import { useState, useEffect, useCallback } from 'react';
import Onboarding from './components/Onboarding.jsx';
import PersonalizingLoader from './components/PersonalizingLoader.jsx';
import Dashboard from './components/Dashboard.jsx';
import { loadAppState, saveAppState, DEFAULT_PROFILE, resetAppState, getSeedCoachSpace, normalizeCoachSpace } from './lib/storage.js';

function getInitialState() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('restart') === '1') {
    window.history.replaceState({}, '', window.location.pathname);
    resetAppState();
    return { profile: { ...DEFAULT_PROFILE }, chats: [], coachSpace: getSeedCoachSpace() };
  }
  return loadAppState();
}

export default function App() {
  const [state, setState] = useState(getInitialState);

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  function updateProfile(profile) {
    setState((s) => ({ ...s, profile }));
  }

  function completeOnboarding(profile) {
    setState((s) => ({
      ...s,
      profile: { ...profile, onboardingComplete: true, personalizationComplete: false },
      coachSpace: normalizeCoachSpace(
        s.coachSpace?.length ? s.coachSpace : getSeedCoachSpace(profile.college),
        profile.college,
      ),
    }));
  }

  const completePersonalization = useCallback(() => {
    setState((s) => ({
      ...s,
      profile: { ...s.profile, personalizationComplete: true },
    }));
  }, []);

  function resetOnboarding() {
    setState((s) => ({
      ...s,
      profile: {
        ...DEFAULT_PROFILE,
        integrations: s.profile.integrations,
        customIntegrations: s.profile.customIntegrations || [],
        personalizationComplete: false,
      },
    }));
  }

  function restartFromOnboarding() {
    setState({
      profile: { ...DEFAULT_PROFILE },
      chats: [],
      coachSpace: getSeedCoachSpace(),
    });
  }

  if (!state.profile.onboardingComplete) {
    return (
      <Onboarding
        profile={state.profile}
        onUpdate={updateProfile}
        onComplete={completeOnboarding}
      />
    );
  }

  if (!state.profile.personalizationComplete) {
    return (
      <PersonalizingLoader
        profile={state.profile}
        onComplete={completePersonalization}
      />
    );
  }

  return (
    <Dashboard
      profile={state.profile}
      onUpdateProfile={updateProfile}
      chats={state.chats}
      onChatsChange={(chats) => setState((s) => ({ ...s, chats }))}
      coachSpace={state.coachSpace || []}
      onCoachSpaceChange={(coachSpace) => setState((s) => ({ ...s, coachSpace }))}
      onResetOnboarding={resetOnboarding}
      onRestartFromOnboarding={restartFromOnboarding}
    />
  );
}

if (import.meta.env.DEV) {
  window.__resetRosterMind = () => {
    resetAppState();
    window.location.reload();
  };
}
