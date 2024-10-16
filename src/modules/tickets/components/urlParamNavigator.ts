import {
  saveSelectedProduction,
  saveSelectedPerformance,
  clearTicketPurchaseState,
  loadTicketPurchaseState,
} from "../state/ticketPurchaseState";
import { initializeProductionList } from "../productionList";
import { initializePerformanceList } from "../performanceList";
import { initializeTicketTiers } from "../ticketTiers";
import { WFSlider } from "@xatom/slider";
import {
  initializeTicketSidebarIndicators,
  setActiveTicketStep,
  markTicketStepAsCompleted,
} from "../components/sidebarIndicators";
import { WFComponent } from "@xatom/core";
import { updateSelectedPerformanceUI } from "../components/selectedPerformanceUI";
import { apiClient } from "../../../api/apiConfig"; // Import apiClient for API requests

// Function to parse URL parameters
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  const productionId = params.get("production");
  const performanceId = params.get("performance");
  const cancelId = params.get("cancel"); // Extract 'cancel' parameter
  return { productionId, performanceId, cancelId };
};

// Function to initialize states based on URL parameters
export const initializeStateFromUrlParams = async (slider: WFSlider) => {
  const { productionId, performanceId, cancelId } = getUrlParams();
  initializeTicketSidebarIndicators(); // Initialize sidebar indicators

  const loadingWall = new WFComponent(".loading_wall");
  const animationDuration = 500; // Duration in milliseconds matching the CSS transition time

  // Check if any relevant URL parameters are present
  if (productionId || performanceId || cancelId) {
    // Show the loading wall
    loadingWall.setStyle({ display: "flex" });

    try {
      // Handle cancellation if 'cancel' parameter is present
      if (cancelId) {
        // Create the DELETE request using apiClient
        const cancelOrderRequest = apiClient.delete(
          `/tickets/cancel_order/${cancelId}`
        );

        // Set up listeners for the DELETE request
        await new Promise<void>((resolve, reject) => {
          cancelOrderRequest.onData(() => {
            console.log(`Ticket order ${cancelId} canceled successfully`);

            // Optional: Remove 'cancel' parameter from the URL to prevent repeated cancellations
            const params = new URLSearchParams(window.location.search);
            params.delete("cancel");
            const newUrl = `${window.location.pathname}${
              params.toString() ? `?${params.toString()}` : ""
            }`;
            window.history.replaceState({}, document.title, newUrl);

            resolve(); // Resolve the promise on successful cancellation
          });

          cancelOrderRequest.onError((error) => {
            console.error(`Failed to cancel ticket order ${cancelId}:`, error);
            // Optional: Display an error message to the user here
            reject(error); // Reject the promise on error
          });

          // Initiate the DELETE request
          cancelOrderRequest.fetch();
        });
      }

      // Proceed with initializing production and performance based on URL parameters

      if (productionId) {
        // Clear any previous ticket purchase state
        clearTicketPurchaseState();

        // Initialize the production list
        const productions = await initializeProductionList(
          "#selectProductionList"
        );

        // Find and select the production based on the URL parameter
        const selectedProduction = productions.find(
          (production) => production.id === productionId
        );
        if (selectedProduction) {
          saveSelectedProduction({
            id: selectedProduction.id,
            name: selectedProduction.fieldData["displayed-name"],
            description: selectedProduction.fieldData["short-description"],
            imageUrl: selectedProduction.fieldData["main-image"].url,
          });

          markTicketStepAsCompleted(1);
          setActiveTicketStep(2);

          // Select the production in the UI
          const productionComponent = document.querySelector(
            `input[value="${productionId}"]`
          );
          if (productionComponent) {
            (productionComponent as HTMLInputElement).checked = true;
            productionComponent.dispatchEvent(new Event("change"));
          }

          // Initialize the performance list for the selected production
          const performances = await initializePerformanceList(
            "#selectPerformanceList"
          );

          if (performanceId) {
            const selectedPerformance = performances.find(
              (performance) => performance.id === performanceId
            );
            if (selectedPerformance) {
              saveSelectedPerformance({
                id: selectedPerformance.id,
                name: selectedPerformance.fieldData["displayed-name"],
                dateTime: selectedPerformance.fieldData["date-time"],
                description: selectedPerformance.fieldData["short-description"],
                imageUrl: selectedPerformance.fieldData["main-image"].url,
                location: selectedPerformance.location_name,
              });

              markTicketStepAsCompleted(2);
              setActiveTicketStep(3);

              // Update the UI with the selected performance details
              updateSelectedPerformanceUI();

              // Initialize the ticket tiers (Step 3)
              await initializeTicketTiers("#bundleList", "#ticketTierList");
              slider.goToIndex(2); // Navigate to the ticket selection step
            } else {
              console.error(`Performance with ID ${performanceId} not found`);
              slider.goToIndex(1); // Navigate to the performance selection step
            }
          } else {
            slider.goToIndex(1); // Navigate to the performance selection step
          }
        } else {
          console.error(`Production with ID ${productionId} not found`);
          slider.goToIndex(0); // Navigate to the production selection step
        }
      } else {
        // If no productionId, navigate to the first step
        slider.goToIndex(0);
      }
    } catch (error) {
      console.error("Error initializing state from URL parameters:", error);
      slider.goToIndex(0); // Navigate to the production selection step on error
    } finally {
      // Hide the loading wall after completing all initializations
      loadingWall.addCssClass("hidden");
      setTimeout(
        () => loadingWall.setStyle({ display: "none" }),
        animationDuration
      );
    }
  }
};
