// src/manageSubscription/state/manageSubscriptionState.ts

import { ManageSubscriptionResponse, RegistrationItem } from "../types";

export interface ManageSubscriptionState {
  /** The raw payload from the manage-subscription endpoint */
  apiData?: ManageSubscriptionResponse;
  /** Array of current registration items */
  registrationItems: RegistrationItem[];
  /** User-selected override for subscription type */
  updateSubscriptionType?: string;
}

const STORAGE_KEY = "manageSubscriptionState";

let state: ManageSubscriptionState = loadStateFromStorage() || {
  apiData: undefined,
  registrationItems: [],
  updateSubscriptionType: undefined,
};

export function loadState(): ManageSubscriptionState {
  return state;
}

export function saveState(newState: Partial<ManageSubscriptionState>): void {
  state = { ...state, ...newState };
  saveStateToStorage(state);
}

function loadStateFromStorage(): ManageSubscriptionState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error loading manage subscription state:", error);
    return null;
  }
}

function saveStateToStorage(state: ManageSubscriptionState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error saving manage subscription state:", error);
  }
}
