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
import { initializeUserDetails } from "./components/userDetailsUI"; // Import the new component

export const initializeTicketTiers = async (
  bundleContainerSelector: string,
  tierContainerSelector: string
) => {
  const selectedPerformance = getSelectedPerformance();

  if (!selectedPerformance || !selectedPerformance.id) {
    console.error("No performance selected.");
    return;
  }

  try {
    // Fetch ticket tiers data based on the selected performance
    const ticketTierData = await fetchTicketTiers(selectedPerformance.id);

    const { bundles_offered, tickets_offered, performance_details } =
      ticketTierData;

    // Update the UI with the selected performance details
    updateSelectedPerformanceUI();

    // Initialize the user details section
    initializeUserDetails(); // Initialize the user details component

    // Always reset the display style before rendering
    const bundleContainer = new WFComponent(bundleContainerSelector);
    if (bundleContainer) {
      bundleContainer.setStyle({ display: "block" }); // Reset to default visible style
    }

    const tierContainer = new WFComponent(tierContainerSelector);
    if (tierContainer) {
      tierContainer.setStyle({ display: "block" }); // Reset to default visible style
    }

    // Flag to check if there are any bundles or tickets
    let hasBundlesOrTickets = false;

    // Render bundles if available
    if (bundles_offered.length > 0) {
      renderBundles(bundles_offered, bundleContainerSelector);
      hasBundlesOrTickets = true;
    } else {
      if (bundleContainer) {
        bundleContainer.setStyle({ display: "none" }); // Hide if no bundles offered
      }
    }

    // Render ticket tiers if available
    if (tickets_offered.length > 0) {
      renderTicketTiers(tickets_offered, tierContainerSelector);
      hasBundlesOrTickets = true;
    } else {
      if (tierContainer) {
        tierContainer.setStyle({ display: "none" }); // Hide if no tickets offered
      }
    }

    // Show or hide the "no tickets available" message
    const noTicketsAvailableElement = new WFComponent("#noTicketsAvailable");
    if (noTicketsAvailableElement) {
      if (!hasBundlesOrTickets) {
        noTicketsAvailableElement.setStyle({ display: "flex" });
      } else {
        noTicketsAvailableElement.setStyle({ display: "none" });
      }
    }

    // Extract the custom question and update the UI
    const customQuestion = performance_details.fieldData["custom-question"];
    updateCustomQuestion(customQuestion);

    // Initialize the assistance input logic
    initializeAssistanceInput(); // Initialize the assistance input component
  } catch (error) {
    console.error("Error fetching ticket tiers:", error);
    // Handle any errors that occur during the ticket tiers fetching process
  }
};
