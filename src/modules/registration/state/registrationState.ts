// state/registrationState.ts
import { CheckoutPreviewResponse } from "../checkoutPreview"; // Ensure this import exists

export interface RegistrationState {
  selectedProgramId?: string;
  selectedProgramName?: string;
  selectedProgramImageUrl?: string;
  selectedProgramAgeRange?: string;
  selectedWorkshopId?: string;
  selectedWorkshopName?: string;
  selectedWorkshopAgeRange?: string;
  selectedWorkshopImageUrl?: string;
  selectedPricingOption?: string;
  // Removed secondaryPricingOption
  selectedSessions?: { sessionId: string; studentIds: number[] }[];
  pendingStudents?: string[];
  fin_aid_requested?: boolean;
  selected_discount?: string;
  checkoutPreview?: CheckoutPreviewResponse;
  financialAidData?: {
    relationship: string;
    annualIncome: string;
    monthlyExpense: string;
    previousParticipant: string;
  };
  early_registration?: boolean; // Added early_registration flag
  start_date?: string; // Added start_date
}

export const loadState = (): RegistrationState => {
  const savedState = localStorage.getItem("registrationState");
  if (savedState) {
    return JSON.parse(savedState);
  }
  return {};
};

export const saveState = (state: Partial<RegistrationState>) => {
  const currentState = loadState();
  const newState = { ...currentState, ...state };
  localStorage.setItem("registrationState", JSON.stringify(newState));
};

export const logPricingOption = (pricingOption: string) => {
  saveState({ selectedPricingOption: pricingOption });
};

// Utility function to get pending students
export const getPendingStudents = (): string[] => {
  const state = loadState();
  return state.pendingStudents || [];
};
