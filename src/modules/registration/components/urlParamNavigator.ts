// src/navigation/urlParamNavigator.ts

import { saveSelectedProgram } from "../state/selectedProgram";
import {
  saveSelectedWorkshop,
  resetSelectedWorkshop,
} from "../state/selectedWorkshop";
import { initializeProgramList } from "../../registration/programList";
import { initializeWorkshopList } from "../../registration/workshopList";
import { initializeSessionList } from "../../registration/sessionsList";
import { WFSlider } from "@xatom/slider";
import {
  initializeSidebarIndicators,
  setActiveStep,
  markStepAsCompleted,
} from "../../registration/components/sidebarIndicators";
import { WFComponent } from "@xatom/core"; // Import WFComponent
import { apiClient } from "../../../api/apiConfig"; // Import apiClient

// **Import the initializeAlertBoxEarly function**
import { initializeAlertBoxEarly } from "../../registration/components/alertBoxEarly";

// Function to parse URL parameters
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  const programId = params.get("program");
  const workshopId = params.get("workshop");
  const cancelId = params.get("cancel"); // Extract 'cancel' parameter
  return { programId, workshopId, cancelId };
};

// Function to initialize states based on URL parameters
export const initializeStateFromUrlParams = async (slider: WFSlider) => {
  const { programId, workshopId, cancelId } = getUrlParams();
  initializeSidebarIndicators(); // Initialize sidebar indicators

  const loadingWall = new WFComponent(".loading_wall");
  const animationDuration = 500; // Duration in milliseconds matching the CSS transition time

  // Check if any relevant URL parameters are present
  if (programId || workshopId || cancelId) {
    // Show the loading wall
    loadingWall.setStyle({ display: "flex" });

    try {
      // Handle cancellation if 'cancel' parameter is present
      if (cancelId) {
        // Create the DELETE request using AxiosClient
        const deleteSubscription = apiClient.delete(
          `/subscriptions/${cancelId}`
        );

        // Set up listeners for the DELETE request
        await new Promise<void>((resolve, reject) => {
          deleteSubscription.onData(() => {
            console.log(`Subscription ${cancelId} canceled successfully`);

            // Optional: Remove 'cancel' parameter from the URL to prevent repeated cancellations
            const params = new URLSearchParams(window.location.search);
            params.delete("cancel");
            const newUrl = `${window.location.pathname}${
              params.toString() ? `?${params.toString()}` : ""
            }`;
            window.history.replaceState({}, document.title, newUrl);

            resolve(); // Resolve the promise on successful deletion
          });

          deleteSubscription.onError((error) => {
            console.error(`Failed to cancel subscription ${cancelId}:`, error);
            // Optional: Display an error message to the user here
            reject(error); // Reject the promise on error
          });

          // Initiate the DELETE request
          deleteSubscription.fetch();
        });
      }

      // Initialize the program list
      await initializeProgramList();

      if (programId) {
        // Select the program based on the URL parameter
        const programComponent = document.querySelector(
          `input[value="${programId}"]`
        );
        if (programComponent) {
          (programComponent as HTMLInputElement).checked = true;
          programComponent.dispatchEvent(new Event("change"));
          markStepAsCompleted(1);
          setActiveStep(2);

          // Initialize the workshop list for the selected program
          await initializeWorkshopList(programId);

          if (workshopId && workshopId === "none") {
            // Skip workshop selection and navigate to session list initialization
            resetSelectedWorkshop();
            markStepAsCompleted(2);
            setActiveStep(3);
            await initializeSessionList(null, programId);
            slider.goToIndex(2); // Navigate to the session selection slide
          } else if (workshopId) {
            // Select the workshop based on the URL parameter
            const workshopComponent = document.querySelector(
              `input[value="${workshopId}"]`
            );
            if (workshopComponent) {
              (workshopComponent as HTMLInputElement).checked = true;
              workshopComponent.dispatchEvent(new Event("change"));
              markStepAsCompleted(2);
              setActiveStep(3);

              // Initialize the session list for the selected workshop
              await initializeSessionList(workshopId, programId);
              slider.goToIndex(2); // Navigate to the session selection slide
            } else {
              console.error(`Workshop with ID ${workshopId} not found`);
              slider.goToIndex(1); // Navigate to the workshop selection slide
            }
          } else {
            resetSelectedWorkshop();
            slider.goToIndex(1); // Navigate to the workshop selection slide
          }
        } else {
          console.error(`Program with ID ${programId} not found`);
          slider.goToIndex(0); // Navigate to the program selection slide
        }
      } else {
        slider.goToIndex(0); // Navigate to the first slide if no program selected
      }
    } catch (error) {
      console.error("Error initializing state from URL parameters:", error);
      slider.goToIndex(0); // Navigate to the program selection slide on error
    } finally {
      // Hide the loading wall after completing all initializations
      loadingWall.addCssClass("hidden");
      setTimeout(
        () => loadingWall.setStyle({ display: "none" }),
        animationDuration
      );

      // **Initialize the early registration alert box**
      initializeAlertBoxEarly();
    }
  }
};
