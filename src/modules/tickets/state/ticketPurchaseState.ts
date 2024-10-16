export interface TicketItem {
  ticket_tier_id: string;
  quantity: number;
  bundle_required: boolean;
}

export interface BundleItem {
  bundle_id: string;
  quantity: number;
}

export interface TicketPurchaseState {
  selectedProductionId?: string;
  selectedProductionName?: string;
  selectedProductionDescription?: string;
  selectedProductionImageUrl?: string;
  selectedPerformanceId?: string;
  selectedPerformanceName?: string;
  selectedPerformanceDateTime?: string;
  selectedPerformanceDescription?: string;
  selectedPerformanceImageUrl?: string;
  selectedPerformanceLocation?: string;
  selectedBundles?: BundleItem[];
  selectedTickets?: TicketItem[];
  customQuestion?: string;
  assistanceNeeded?: boolean;
  assistanceMessage?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

const TICKET_PURCHASE_STATE_KEY = "ticketPurchaseState";

// Utility function to safely convert unknown types to number
const safeNumber = (value: unknown): number =>
  typeof value === "number" ? value : 0;

export const loadTicketPurchaseState = (): TicketPurchaseState => {
  const savedState = localStorage.getItem(TICKET_PURCHASE_STATE_KEY);
  return savedState ? JSON.parse(savedState) : {};
};

export const saveTicketPurchaseState = (
  state: Partial<TicketPurchaseState>
) => {
  const currentState = loadTicketPurchaseState();
  const newState = { ...currentState, ...state };
  localStorage.setItem(TICKET_PURCHASE_STATE_KEY, JSON.stringify(newState));
};

export const clearTicketPurchaseState = () => {
  localStorage.removeItem(TICKET_PURCHASE_STATE_KEY);
};

// Production-related functions
export const getSelectedProduction = () => {
  const state = loadTicketPurchaseState();
  return {
    id: state.selectedProductionId || null,
    name: state.selectedProductionName || null,
    description: state.selectedProductionDescription || null,
    imageUrl: state.selectedProductionImageUrl || null, // Retrieve production image URL
  };
};

export const saveSelectedProduction = (production: {
  id: string;
  name: string;
  description: string;
  imageUrl: string; // Store production image URL
}) => {
  saveTicketPurchaseState({
    selectedProductionId: production.id,
    selectedProductionName: production.name,
    selectedProductionDescription: production.description,
    selectedProductionImageUrl: production.imageUrl, // Save production image URL
  });
};

// Performance-related functions
export const getSelectedPerformance = () => {
  const state = loadTicketPurchaseState();
  return {
    id: state.selectedPerformanceId || null,
    name: state.selectedPerformanceName || null,
    dateTime: state.selectedPerformanceDateTime || null,
    imageUrl: state.selectedPerformanceImageUrl || null,
    location: state.selectedPerformanceLocation || null, // Retrieve performance location
  };
};

export const saveSelectedPerformance = (performance: {
  id: string;
  name: string;
  dateTime: string;
  description: string;
  imageUrl: string;
  location: string;
}) => {
  saveTicketPurchaseState({
    selectedPerformanceId: performance.id,
    selectedPerformanceName: performance.name,
    selectedPerformanceDateTime: performance.dateTime,
    selectedPerformanceDescription: performance.description, // Save description to state
    selectedPerformanceImageUrl: performance.imageUrl,
    selectedPerformanceLocation: performance.location,
  });
};

// Bundle-related functions
export const getSelectedBundles = (): BundleItem[] => {
  const state = loadTicketPurchaseState();
  return state.selectedBundles || [];
};

export const saveSelectedBundle = (bundleId: string, quantity: number) => {
  const bundles = getSelectedBundles();
  const existingBundle = bundles.find((b) => b.bundle_id === bundleId);

  if (existingBundle) {
    if (quantity > 0) {
      existingBundle.quantity = quantity;
    } else {
      // Remove bundle if quantity is 0
      const index = bundles.indexOf(existingBundle);
      bundles.splice(index, 1);
    }
  } else if (quantity > 0) {
    bundles.push({ bundle_id: bundleId, quantity });
  }

  saveTicketPurchaseState({ selectedBundles: bundles });
};

export const removeSelectedBundle = (bundleId: string) => {
  const bundles = getSelectedBundles();
  const updatedBundles = bundles.filter((b) => b.bundle_id !== bundleId);
  saveTicketPurchaseState({ selectedBundles: updatedBundles });

  // After removing a bundle, check if any bundle is selected and remove "bundle_required" tickets if none are selected
  removeBundleRequiredTicketsIfNeeded();
};

// New function to remove "bundle_required: true" tickets if no bundles are selected
export const removeBundleRequiredTicketsIfNeeded = () => {
  const bundles = getSelectedBundles();
  const totalBundlesSelected = bundles.reduce(
    (sum, bundle) => sum + safeNumber(bundle.quantity),
    0
  );

  if (totalBundlesSelected <= 0) {
    const tickets = getSelectedTickets();
    const updatedTickets = tickets.filter((t) => !t.bundle_required);
    saveTicketPurchaseState({ selectedTickets: updatedTickets });
  }
};

// Ticket-related functions
export const getSelectedTickets = (): TicketItem[] => {
  const state = loadTicketPurchaseState();
  return state.selectedTickets || [];
};

export const saveSelectedTicket = (
  ticket_tier_id: string,
  quantity: number,
  bundle_required: boolean
) => {
  const tickets = getSelectedTickets();
  const existingTicket = tickets.find(
    (t) => t.ticket_tier_id === ticket_tier_id
  );

  if (existingTicket) {
    if (quantity > 0) {
      existingTicket.quantity = quantity;
    } else {
      // Remove ticket if quantity is 0
      const index = tickets.indexOf(existingTicket);
      tickets.splice(index, 1);
    }
  } else if (quantity > 0) {
    tickets.push({ ticket_tier_id, quantity, bundle_required });
  }

  saveTicketPurchaseState({ selectedTickets: tickets });
};

export const removeSelectedTicket = (ticket_tier_id: string) => {
  const tickets = getSelectedTickets();
  const updatedTickets = tickets.filter(
    (t) => t.ticket_tier_id !== ticket_tier_id
  );
  saveTicketPurchaseState({ selectedTickets: updatedTickets });
};

// Assistance-related functions
export const getCustomQuestion = () => {
  const state = loadTicketPurchaseState();
  return state.customQuestion || null;
};

export const saveCustomQuestion = (question: string) => {
  saveTicketPurchaseState({ customQuestion: question });
};

export const getAssistanceNeeded = (): boolean => {
  const state = loadTicketPurchaseState();
  return state.assistanceNeeded || false; // Default to false if not set
};

export const saveAssistanceNeeded = (needed: boolean) => {
  saveTicketPurchaseState({ assistanceNeeded: needed });
};

export const getAssistanceMessage = (): string => {
  const state = loadTicketPurchaseState();
  return state.assistanceMessage || ""; // Default to empty string if not set
};

export const saveAssistanceMessage = (message: string) => {
  saveTicketPurchaseState({ assistanceMessage: message });
};

// User-related functions
export const saveUserDetails = (details: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) => {
  saveTicketPurchaseState(details);
};

// Function to clear the selected performance from the state
export const clearSelectedPerformance = () => {
  saveTicketPurchaseState({
    selectedPerformanceId: undefined,
    selectedPerformanceName: undefined,
    selectedPerformanceDateTime: undefined,
    selectedPerformanceDescription: undefined,
    selectedPerformanceImageUrl: undefined,
    selectedPerformanceLocation: undefined,
  });
};

// Function to clear the selected bundles from the state
export const clearSelectedBundles = () => {
  saveTicketPurchaseState({
    selectedBundles: [],
  });
};

// Function to clear the selected tickets from the state
export const clearSelectedTickets = () => {
  saveTicketPurchaseState({
    selectedTickets: [],
  });
};
