// src/navigation/urlParamNavigator.ts

import {
  saveSelectedCampaign,
  clearDonationState,
} from "../state/donationState";
import { initializeCampaignList } from "../campaignList";
import { initializeDynamicProductList } from "../campaignProductList";
import { WFSlider } from "@xatom/slider";
import {
  initializeSidebarIndicators,
  setActiveStep,
  markStepAsCompleted,
} from "../components/sidebarIndicators";
import { WFComponent } from "@xatom/core";
import { updateSelectedCampaignDisplay } from "../components/selectedCampaignDisplay"; // Import updateSelectedCampaignDisplay
import { apiClient } from "../../../api/apiConfig"; // Import apiClient

// Function to parse URL parameters
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  const campaignId = params.get("campaign");
  const cancelId = params.get("cancel"); // Extract 'cancel' parameter
  return { campaignId, cancelId };
};

// Placeholder functions for user feedback
const displayErrorMessage = (message: string) => {
  // Implement your error display logic here
  // Example: Use a toast notification system
  // toast.error(message);
};

const displaySuccessMessage = (message: string) => {
  // Implement your success display logic here
  // Example: Use a toast notification system
  // toast.success(message);
};

// Function to initialize states based on URL parameters
export const initializeStateFromUrlParams = async (slider: WFSlider) => {
  const { campaignId, cancelId } = getUrlParams();
  initializeSidebarIndicators(); // Initialize sidebar indicators

  const loadingWall = new WFComponent(".loading_wall");
  const animationDuration = 500; // Duration in milliseconds matching the CSS transition time

  // Check if any relevant URL parameters are present
  if (campaignId || cancelId) {
    // Show the loading wall
    loadingWall.setStyle({ display: "flex" });

    try {
      // Handle cancellation if 'cancel' parameter is present
      if (cancelId) {
        // Create the DELETE request using apiClient
        const deleteDonation = apiClient.delete(
          `/donate/cancel_donation/${cancelId}`
        );

        // Set up listeners for the DELETE request
        await new Promise<void>((resolve, reject) => {
          deleteDonation.onData(() => {
            console.log(`Donation ${cancelId} canceled successfully`);

            // Optional: Remove 'cancel' parameter from the URL to prevent repeated cancellations
            const params = new URLSearchParams(window.location.search);
            params.delete("cancel");
            const newUrl = `${window.location.pathname}${
              params.toString() ? `?${params.toString()}` : ""
            }`;
            window.history.replaceState({}, document.title, newUrl);

            // Provide user feedback
            displaySuccessMessage(
              "Your donation has been successfully canceled."
            );

            resolve(); // Resolve the promise on successful deletion
          });

          deleteDonation.onError((error: any) => {
            console.error(`Failed to cancel donation ${cancelId}:`, error);
            // Provide user feedback
            displayErrorMessage(
              "Failed to cancel your donation. Please try again later."
            );
            reject(error); // Reject the promise on error
          });

          // Initiate the DELETE request
          deleteDonation.fetch();
        });
      }

      // Proceed with campaign initialization if 'campaignId' is present
      if (campaignId) {
        // Clear any previous donation state
        clearDonationState();

        // Initialize the campaign list
        const campaigns = await initializeCampaignList("#selectCampaignList");

        // Find and select the campaign based on the URL parameter
        const selectedCampaign = campaigns.find(
          (campaign) => campaign.id.toString() === campaignId
        );
        if (selectedCampaign) {
          saveSelectedCampaign({
            id: selectedCampaign.id.toString(),
            name: selectedCampaign.Name,
            imageUrl: selectedCampaign.Main_Image,
            description: selectedCampaign.Short_Description,
            subheading: selectedCampaign.Subheading,
          });
        
          markStepAsCompleted(1);
          setActiveStep(2);
        
          updateSelectedCampaignDisplay();
        
          const campaignComponent = document.querySelector(
            `input[value="${campaignId}"]`
          );
          if (campaignComponent) {
            (campaignComponent as HTMLInputElement).checked = true;
            campaignComponent.dispatchEvent(new Event("change"));
          }
        
          await initializeDynamicProductList("#selectProductList", campaignId);
          slider.goToIndex(1);
        } else {
          console.error(`Campaign with ID ${campaignId} not found`);
          displayErrorMessage(
            "Selected campaign not found. Please choose a valid campaign."
          );
          slider.goToIndex(0); // Navigate to the campaign selection slide
        }
      }
    } catch (error) {
      console.error("Error initializing state from URL parameters:", error);
      displayErrorMessage(
        "An error occurred while initializing. Please try again."
      );
      slider.goToIndex(0); // Navigate to the campaign selection slide on error
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
