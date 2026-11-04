/**
 * Storage management with try/catch safety and persistence
 * CRA Jimena Muñiz (Corullón) - Morning Circle Unit 2
 */

import { DesdobleId, DesdobleState, WeatherDataDocument } from '../types.ts';
import { INITIAL_WEATHER_CORULLON } from '../data/unit2Data.ts';

const STORAGE_PREFIX = 'morning_circle_unit2_';

export function getDefaultDesdobleState(desdobleId: DesdobleId): DesdobleState {
  if (desdobleId === 'desdoble1') {
    return {
      desdobleId: 'desdoble1',
      starJar: 4,
      maxStars: 20,
      rewardsUnlocked: 0,
      teams: [
        { id: 'team-red', name: 'Red Foxes 🦊', color: '#ef4444', points: 3 },
        { id: 'team-blue', name: 'Blue Jays 🐦', color: '#3b82f6', points: 3 },
        { id: 'team-green', name: 'Green Frogs 🐸', color: '#10b981', points: 4 },
      ],
      scoreHistory: [],
      territories: {
        grade2: [true, true, false, false, false, false],
        grade3: [true, false, false, false, false, false],
        grade4: [true, true, false, false, false, false],
        grade5: [false, false, false, false, false, false],
        grade6: [false, false, false, false, false, false],
      },
      badges: {
        'super-speaker': true,
        'grammar-detective': false,
        'team-player': true,
        'weather-master': false,
        'star-champion': false,
      },
      streak: 2,
      bonusGameUnlocked: false,
      emotionTally: { happy: 5, excited: 3, calm: 2 },
    };
  } else {
    return {
      desdobleId: 'desdoble2',
      starJar: 6,
      maxStars: 25,
      rewardsUnlocked: 0,
      teams: [
        { id: 'team-wolves', name: 'Grey Wolves 🐺', color: '#64748b', points: 5 },
        { id: 'team-eagles', name: 'Golden Eagles 🦅', color: '#f59e0b', points: 4 },
        { id: 'team-lynx', name: 'Iberian Lynx 🐾', color: '#8b5cf6', points: 6 },
      ],
      scoreHistory: [],
      territories: {
        grade2: [false, false, false, false, false, false],
        grade3: [false, false, false, false, false, false],
        grade4: [false, false, false, false, false, false],
        grade5: [true, true, false, false, false, false],
        grade6: [true, false, false, false, false, false],
      },
      badges: {
        'super-speaker': true,
        'grammar-detective': true,
        'team-player': true,
        'weather-master': false,
        'star-champion': false,
      },
      streak: 3,
      bonusGameUnlocked: true,
      emotionTally: { happy: 4, calm: 3, tired: 1 },
    };
  }
}

export function loadDesdobleState(desdobleId: DesdobleId): DesdobleState {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}state_${desdobleId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all fields exist
      const defaultState = getDefaultDesdobleState(desdobleId);
      return {
        ...defaultState,
        ...parsed,
        territories: {
          ...defaultState.territories,
          ...(parsed.territories || {}),
        },
        badges: {
          ...defaultState.badges,
          ...(parsed.badges || {}),
        },
      };
    }
  } catch (err) {
    console.warn('Could not read state from localStorage:', err);
  }
  return getDefaultDesdobleState(desdobleId);
}

export function saveDesdobleState(desdobleId: DesdobleId, state: DesdobleState): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}state_${desdobleId}`, JSON.stringify(state));
  } catch (err) {
    console.warn('Could not save state to localStorage:', err);
  }
}

export function resetDesdobleState(desdobleId: DesdobleId): DesdobleState {
  const fresh = getDefaultDesdobleState(desdobleId);
  // Clear stars, tiles, badges to zero for clean restart
  fresh.starJar = 0;
  fresh.rewardsUnlocked = 0;
  fresh.scoreHistory = [];
  fresh.teams.forEach(t => { t.points = 0; });
  fresh.territories.grade2 = [false, false, false, false, false, false];
  fresh.territories.grade3 = [false, false, false, false, false, false];
  fresh.territories.grade4 = [false, false, false, false, false, false];
  fresh.territories.grade5 = [false, false, false, false, false, false];
  fresh.territories.grade6 = [false, false, false, false, false, false];
  fresh.badges = {};
  fresh.streak = 0;
  fresh.bonusGameUnlocked = false;
  fresh.emotionTally = {};
  saveDesdobleState(desdobleId, fresh);
  return fresh;
}

export function loadWeatherDocument(): WeatherDataDocument {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}weather_corullon`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.hours) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not load weather document:', err);
  }
  return INITIAL_WEATHER_CORULLON;
}

export function saveWeatherDocument(doc: WeatherDataDocument): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}weather_corullon`, JSON.stringify(doc));
  } catch (err) {
    console.warn('Could not save weather document:', err);
  }
}

export interface AppPreferences {
  lastDesdoble: DesdobleId;
  speechRate: number;
  soundEnabled: boolean;
  isDarkMode: boolean;
}

export function loadPreferences(): AppPreferences {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}preferences`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Could not load preferences:', err);
  }
  return {
    lastDesdoble: 'desdoble1',
    speechRate: 0.9,
    soundEnabled: true,
    isDarkMode: false,
  };
}

export function savePreferences(prefs: AppPreferences): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}preferences`, JSON.stringify(prefs));
  } catch (err) {
    console.warn('Could not save preferences:', err);
  }
}
