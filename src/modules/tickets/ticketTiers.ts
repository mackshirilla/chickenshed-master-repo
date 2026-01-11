// src/modules/tickets/ticketTiers.ts

import { fetchTicketTiers } from "../../api/ticketTiersAPI";
import {
  renderBundles,
  renderTicketTiers,
} from "./components/ticketTierListRender";
import { getSelectedPerformance } from "./state/ticketPurchaseState";
import { WFComponent } from "@xatom/core";
import { updateSelectedPerformanceUI } from "./components/selectedPerformanceUI";
import { updateCustomQuestion } from "./components/customQuestionUI";
import { initializeAssistanceInput } from "./components/assistanceInputUI";
import { initializeUserDetails } from "./components/userDetailsUI";

/**
 * Initialize the bundles and ticket tiers UI for the selected performance.
 */
export const initializeTicketTiers = async (
  bundleContainerSelector: string,
  tierContainerSelector: string
) => {
  const selectedPerformance = getSelectedPerformance();

  if (!selectedPerformance?.id) {
    console.error("No performance selected.");
    return;
  }

  try {
    // Fetch all ticket tier data for this performance
    const ticketTierData = await fetchTicketTiers(selectedPerformance.id);

    // Safely destructure API response shape (defaults prevent crashes)
    const {
      tickets_available = null,
      performance_details = null,
      bundles_available = null,
    } = (ticketTierData ?? {}) as any;

    // Guard: avoid `.flat()` on undefined/null
    const rawBundlesOffered =
      performance_details?.ticket_bundles_offered ?? [];
    const rawTiersOffered = performance_details?.ticket_tiers_offered ?? [];

    // Flatten safely (supports nested arrays, non-nested arrays, or missing)
    const bundles = Array.isArray(rawBundlesOffered)
      ? rawBundlesOffered.flat?.() ?? rawBundlesOffered
      : [];

    const tickets = Array.isArray(rawTiersOffered)
      ? rawTiersOffered.flat?.() ?? rawTiersOffered
      : [];

    // Update selected performance UI
    updateSelectedPerformanceUI();

    // Initialize user details section
    initializeUserDetails();

    // Reset container visibility
    const bundleContainer = new WFComponent(bundleContainerSelector);
    bundleContainer.setStyle({ display: "block" });

    const tierContainer = new WFComponent(tierContainerSelector);
    tierContainer.setStyle({ display: "block" });

    let hasBundlesOrTickets = false;

    // Render bundle cards (pass bundles_available)
    if (bundles.length > 0) {
      renderBundles(bundles, bundleContainerSelector, bundles_available);
      hasBundlesOrTickets = true;
    } else {
      bundleContainer.setStyle({ display: "none" });
    }

    // Render ticket tier cards with availability
    if (tickets.length > 0) {
      renderTicketTiers(tickets, tickets_available, tierContainerSelector);
      hasBundlesOrTickets = true;
    } else {
      tierContainer.setStyle({ display: "none" });
    }

    // Toggle "no tickets available" message
    const noTicketsElem = new WFComponent("#noTicketsAvailable");
    noTicketsElem.setStyle({ display: hasBundlesOrTickets ? "none" : "flex" });

    // Show custom question (blank string fallback)
    const customQuestion = performance_details?.Custom_Question ?? "";
    updateCustomQuestion(customQuestion);

    // Initialize assistance input UI
    initializeAssistanceInput();
  } catch (error) {
    console.error("Error fetching ticket tiers:", error);

    // Optional: fail-safe empty-state UI so user isn't stuck
    try {
      const bundleContainer = new WFComponent(bundleContainerSelector);
      bundleContainer.setStyle({ display: "none" });

      const tierContainer = new WFComponent(tierContainerSelector);
      tierContainer.setStyle({ display: "none" });

      const noTicketsElem = new WFComponent("#noTicketsAvailable");
      noTicketsElem.setStyle({ display: "flex" });

      updateCustomQuestion("");
    } catch {
      // no-op (avoid masking original error)
    }
  }
};
