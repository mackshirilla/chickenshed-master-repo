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
  selectedProductionId?: number;
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

// Utility to convert unknown to number
const safeNumber = (value: unknown): number =>
  typeof value === "number" ? value : 0;

export const loadTicketPurchaseState = (): TicketPurchaseState => {
  const saved = localStorage.getItem(TICKET_PURCHASE_STATE_KEY);
  return saved ? JSON.parse(saved) : {};
};

export const saveTicketPurchaseState = (
  state: Partial<TicketPurchaseState>
) => {
  const current = loadTicketPurchaseState();
  const merged = { ...current, ...state };
  localStorage.setItem(
    TICKET_PURCHASE_STATE_KEY,
    JSON.stringify(merged)
  );
};

export const clearTicketPurchaseState = () => {
  localStorage.removeItem(TICKET_PURCHASE_STATE_KEY);
};

// Production-related
export const getSelectedProduction = () => {
  const s = loadTicketPurchaseState();
  return {
    id: s.selectedProductionId ?? null,
    name: s.selectedProductionName ?? null,
    description: s.selectedProductionDescription ?? null,
    imageUrl: s.selectedProductionImageUrl ?? null,
  };
};

export const saveSelectedProduction = (production: {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}) => {
  saveTicketPurchaseState({
    selectedProductionId: production.id,
    selectedProductionName: production.name,
    selectedProductionDescription: production.description,
    selectedProductionImageUrl: production.imageUrl,
  });
};

// Performance-related
export const getSelectedPerformance = () => {
  const s = loadTicketPurchaseState();
  return {
    id: s.selectedPerformanceId ?? null,
    name: s.selectedPerformanceName ?? null,
    dateTime: s.selectedPerformanceDateTime ?? null,
    description: s.selectedPerformanceDescription ?? null,
    imageUrl: s.selectedPerformanceImageUrl ?? null,
    location: s.selectedPerformanceLocation ?? null,
  };
};

export const saveSelectedPerformance = (perf: {
  id: string;
  name: string;
  dateTime: string;
  description: string;
  imageUrl: string;
  location: string;
}) => {
  saveTicketPurchaseState({
    selectedPerformanceId: perf.id,
    selectedPerformanceName: perf.name,
    selectedPerformanceDateTime: perf.dateTime,
    selectedPerformanceDescription: perf.description,
    selectedPerformanceImageUrl: perf.imageUrl,
    selectedPerformanceLocation: perf.location,
  });
};

// Bundle functions
export const getSelectedBundles = (): BundleItem[] => {
  return loadTicketPurchaseState().selectedBundles || [];
};

export const saveSelectedBundle = (bundleId: string, quantity: number) => {
  const bundles = getSelectedBundles();
  const idx = bundles.findIndex((b) => b.bundle_id === bundleId);
  if (idx > -1) {
    if (quantity > 0) bundles[idx].quantity = quantity;
    else bundles.splice(idx, 1);
  } else if (quantity > 0) {
    bundles.push({ bundle_id: bundleId, quantity });
  }
  saveTicketPurchaseState({ selectedBundles: bundles });
};

export const removeSelectedBundle = (bundleId: string) => {
  const remaining = getSelectedBundles().filter((b) => b.bundle_id !== bundleId);
  saveTicketPurchaseState({ selectedBundles: remaining });
  // Remove bundle_required tickets if none selected
  const total = remaining.reduce((sum, b) => sum + safeNumber(b.quantity), 0);
  if (total === 0) {
    const tickets = getSelectedTickets().filter((t) => !t.bundle_required);
    saveTicketPurchaseState({ selectedTickets: tickets });
  }
};

// Ticket functions
export const getSelectedTickets = (): TicketItem[] => {
  return loadTicketPurchaseState().selectedTickets || [];
};

export const saveSelectedTicket = (
  tierId: string,
  quantity: number,
  bundle_required: boolean
) => {
  const tickets = getSelectedTickets();
  const idx = tickets.findIndex((t) => t.ticket_tier_id === tierId);
  if (idx > -1) {
    if (quantity > 0) tickets[idx].quantity = quantity;
    else tickets.splice(idx, 1);
  } else if (quantity > 0) {
    tickets.push({ ticket_tier_id: tierId, quantity, bundle_required });
  }
  saveTicketPurchaseState({ selectedTickets: tickets });
};

export const removeSelectedTicket = (tierId: string) => {
  const remaining = getSelectedTickets().filter((t) => t.ticket_tier_id !== tierId);
  saveTicketPurchaseState({ selectedTickets: remaining });
};

// Assistance
export const getCustomQuestion = () => loadTicketPurchaseState().customQuestion ?? null;
export const saveCustomQuestion = (q: string) => saveTicketPurchaseState({ customQuestion: q });
export const getAssistanceNeeded = () => loadTicketPurchaseState().assistanceNeeded ?? false;
export const saveAssistanceNeeded = (v: boolean) => saveTicketPurchaseState({ assistanceNeeded: v });
export const getAssistanceMessage = () => loadTicketPurchaseState().assistanceMessage ?? '';
export const saveAssistanceMessage = (m: string) => saveTicketPurchaseState({ assistanceMessage: m });

// User details
export const saveUserDetails = (d: { firstName?: string; lastName?: string; email?: string }) =>
  saveTicketPurchaseState(d);

// Clearers
export const clearSelectedPerformance = () => saveTicketPurchaseState({
  selectedPerformanceId: undefined,
  selectedPerformanceName: undefined,
  selectedPerformanceDateTime: undefined,
  selectedPerformanceDescription: undefined,
  selectedPerformanceImageUrl: undefined,
  selectedPerformanceLocation: undefined,
});
export const clearSelectedBundles = () => saveTicketPurchaseState({ selectedBundles: [] });
export const clearSelectedTickets = () => saveTicketPurchaseState({ selectedTickets: [] });
