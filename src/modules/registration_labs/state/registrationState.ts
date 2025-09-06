// registrationState.ts

export interface RegistrationState {
  fin_aid_requested: boolean;
  selected_discount?: string;
  financialAidData?: {
    relationship: string;
    annualIncome: string;
    monthlyExpense: string;
    previousParticipant: string;
  };
  subscriptionType?: string;
  apiData?: any; // API response from startRegistration.
  originalSubscriptionTotal?: number;
  // NEW: Array of confirmed registration items with IDs and display text.
  registrationItems?: {
    program_id: string | null;
    session_id: string | null;
    student_id: string | null;
    program_name?: string;
    workshop_name?: string;
    session_name?: string;
    student_name?: string;
  }[];
}

const STORAGE_KEY = "labRegistrationState";

let state: RegistrationState = loadStateFromStorage() || {
  fin_aid_requested: false,
  selected_discount: undefined,
  financialAidData: undefined,
  subscriptionType: "year",
  apiData: undefined,
  originalSubscriptionTotal: 0,
  registrationItems: []
};

export function loadState(): RegistrationState {
  return state;
}

export function saveState(newState: Partial<RegistrationState>): void {
  state = { ...state, ...newState };
  saveStateToStorage(state);
}

export function resetRegistrationState(): void {
  state = {
    fin_aid_requested: false,
    selected_discount: undefined,
    financialAidData: undefined,
    subscriptionType: "year",
    apiData: undefined,
    originalSubscriptionTotal: 0,
    registrationItems: []
  };
  saveStateToStorage(state);
}

function loadStateFromStorage(): RegistrationState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error loading state from storage:", error);
    return null;
  }
}

function saveStateToStorage(state: RegistrationState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error saving state to storage:", error);
  }
}
