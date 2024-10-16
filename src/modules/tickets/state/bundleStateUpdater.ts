import {
  getSelectedBundles,
  getSelectedTickets,
  removeSelectedTicket,
} from "../state/ticketPurchaseState";

// Utility function to safely convert unknown types to number
const safeNumber = (value: unknown): number =>
  typeof value === "number" ? value : 0;

export const resetTicketQuantitiesIfNeeded = () => {
  const selectedBundles = getSelectedBundles();
  const totalBundlesSelected = selectedBundles.reduce(
    (sum, bundle) => sum + safeNumber(bundle.quantity),
    0
  );

  const selectedTickets = getSelectedTickets();
  selectedTickets.forEach((ticket) => {
    const ticketElement = document.querySelector(
      `#ticketTierCard[data-id="${ticket.ticket_tier_id}"] #ticketTierQuantityInput`
    ) as HTMLInputElement;

    if (!ticketElement) return;

    if (ticket.bundle_required && totalBundlesSelected <= 0) {
      ticketElement.value = "0";
      removeSelectedTicket(ticket.ticket_tier_id);
    }
  });

  console.log("Updated selectedTickets:", getSelectedTickets());
};

export const updateTicketTierButtons = () => {
  const selectedBundles = getSelectedBundles();
  const totalBundlesSelected = selectedBundles.reduce(
    (sum, bundle) => sum + safeNumber(bundle.quantity),
    0
  );

  const ticketTierInputs = document.querySelectorAll<HTMLInputElement>(
    "#ticketTierQuantityInput"
  );
  const ticketTierIncrementButtons =
    document.querySelectorAll<HTMLButtonElement>("#ticketTierQuantityIncrease");

  ticketTierInputs.forEach((input) => {
    const ticketCard = input.closest("#ticketTierCard");
    const requiresBundle =
      ticketCard?.getAttribute("data-requires-bundle") === "true";

    if (requiresBundle && totalBundlesSelected <= 0) {
      input.setAttribute("disabled", "true");
      input.value = "0";
    } else {
      input.removeAttribute("disabled");
    }
  });

  ticketTierIncrementButtons.forEach((button) => {
    const ticketCard = button.closest("#ticketTierCard");
    const requiresBundle =
      ticketCard?.getAttribute("data-requires-bundle") === "true";

    if (requiresBundle && totalBundlesSelected <= 0) {
      button.setAttribute("disabled", "true");
    } else {
      button.removeAttribute("disabled");
    }
  });

  resetTicketQuantitiesIfNeeded();
};
