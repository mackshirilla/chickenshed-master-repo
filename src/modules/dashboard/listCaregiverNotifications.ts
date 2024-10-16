// src/modules/dashboard/listCaregiverNotifications.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { apiClient } from "../../api/apiConfig";

/**
 * Interface representing a single caregiver invite.
 */
interface CaregiverInvite {
  id: number;
  user_one_id: number;
  user_two_id: number;
  initiated_by: number;
  email_invited: string;
  status: string;
  created_at: number;
  updated_at: number | null;
  user_one_name: string;
}

/**
 * Interface representing the API response structure for caregiver invites.
 */
interface CaregiverInvitesResponse {
  caregivers: CaregiverInvite[];
}

/**
 * Interface representing the API response structure for accept/decline actions.
 */
interface ActionResponse {
  status: string;
  message?: string; // Made message optional to handle its absence
}

/**
 * Initializes the caregiver notifications dynamic list.
 * @param containerId - ID of the caregiver notifications container.
 */
export async function initializeCaregiverNotifications(containerId: string) {
  // Select the caregiver notifications container by ID
  const container = document.getElementById(containerId);
  if (!container) {
    console.error("Caregiver notifications container not found:", containerId);
    return;
  }

  // Initially hide the container
  container.style.display = "none";

  // Initialize a new WFDynamicList instance with ID selector for rows
  const list = new WFDynamicList<CaregiverInvite>(`#${containerId}`, {
    rowSelector: "#caregiverNotificationRow", // ID selector
    // No loaderSelector or emptySelector as per your requirement
  });

  /**
   * Array to hold the current caregiver invites.
   */
  let caregiverInvites: CaregiverInvite[] = [];

  /**
   * Customizes the rendering of each caregiver notification row.
   * @param rowData - Data for the current caregiver invite.
   * @param rowElement - The HTML element representing the notification row.
   * @returns The modified rowElement.
   */
  list.rowRenderer(({ rowData, rowElement }) => {
    const notificationCard = new WFComponent(rowElement);

    // Populate the caregiver's name
    const notificationName = notificationCard.getChildAsComponent(
      "#caregiverNotificationName" // ID selector
    );
    notificationName.setText(rowData.user_one_name);

    // Handle the Accept button
    const acceptButton =
      notificationCard.getChildAsComponent("#acceptCaregiver"); // ID selector
    acceptButton.on("click", async () => {
      try {
        console.log(`Accepting caregiver invite with ID: ${rowData.id}`);

        // Show loading animation on Accept button
        const loadingAnimation = notificationCard.getChildAsComponent(
          "#requestingAnimationAccept" // ID selector
        );
        if (loadingAnimation) {
          loadingAnimation.setStyle({ display: "block" });
        } else {
          console.warn(
            "Loading animation element not found: #requestingAnimationAccept"
          );
        }

        // Make API call to accept the invite
        const response = await apiClient
          .post<ActionResponse>(`/caregivers/invites/${rowData.id}/accept`)
          .fetch();

        console.log("API response:", response);

        if (response.status === "success") {
          console.log("Caregiver invite accepted successfully.");

          // Instead of updating the list locally, refresh the page
          console.log("Refreshing the page to reflect changes.");
          location.reload();
        } else {
          console.warn("API response unsuccessful:", response);
          alert(response.message || "Failed to accept caregiver invite.");
        }
      } catch (error) {
        console.error("Error accepting caregiver invite:", error);
        alert("An error occurred while accepting the invite.");
      } finally {
        // Hide loading animation
        const loadingAnimation = notificationCard.getChildAsComponent(
          "#requestingAnimationAccept" // ID selector
        );
        if (loadingAnimation) {
          loadingAnimation.setStyle({ display: "none" });
        } else {
          console.warn(
            "Loading animation element not found: #requestingAnimationAccept"
          );
        }
      }
    });

    // Handle the Decline button
    const declineButton =
      notificationCard.getChildAsComponent("#declineCaregiver"); // ID selector
    declineButton.on("click", async () => {
      try {
        console.log(`Declining caregiver invite with ID: ${rowData.id}`);

        // Show loading animation on Decline button
        const loadingAnimation = notificationCard.getChildAsComponent(
          "#requestingAnimationDecline" // ID selector
        );
        if (loadingAnimation) {
          loadingAnimation.setStyle({ display: "block" });
        } else {
          console.warn(
            "Loading animation element not found: #requestingAnimationDecline"
          );
        }

        // Make API call to decline the invite
        const response = await apiClient
          .post<ActionResponse>(`/caregivers/invites/${rowData.id}/decline`)
          .fetch();

        console.log("API response:", response);

        if (response.status === "success") {
          console.log("Caregiver invite declined successfully.");

          // Instead of updating the list locally, refresh the page
          console.log("Refreshing the page to reflect changes.");
          location.reload();
        } else {
          console.warn("API response unsuccessful:", response);
          alert(response.message || "Failed to decline caregiver invite.");
        }
      } catch (error) {
        console.error("Error declining caregiver invite:", error);
        alert("An error occurred while declining the invite.");
      } finally {
        // Hide loading animation
        const loadingAnimation = notificationCard.getChildAsComponent(
          "#requestingAnimationDecline" // ID selector
        );
        if (loadingAnimation) {
          loadingAnimation.setStyle({ display: "none" });
        } else {
          console.warn(
            "Loading animation element not found: #requestingAnimationDecline"
          );
        }
      }
    });

    return rowElement;
  });

  /**
   * Fetches caregiver invites from the API and populates the dynamic list.
   */
  async function loadCaregiverInvites() {
    try {
      console.log("Fetching caregiver invites...");
      const response = await apiClient
        .get<CaregiverInvitesResponse>("/caregivers/invites")
        .fetch();

      console.log("Fetched caregiver invites:", response);

      if (response.caregivers && Array.isArray(response.caregivers)) {
        // Sort caregivers by creation date (newest first)
        caregiverInvites = response.caregivers.sort(
          (a, b) => b.created_at - a.created_at
        );
        list.setData(caregiverInvites);

        // Update the container's display based on the fetched invites
        updateContainerDisplay();
      } else {
        console.error(
          "Invalid response structure for caregiver invites:",
          response
        );
        // Do not show anything if the list is empty
        caregiverInvites = [];
        list.setData(caregiverInvites);

        // Ensure the container is hidden
        container.style.display = "none";
      }
    } catch (error) {
      console.error("Error fetching caregiver invites:", error);
      // Do not show anything if the list is empty
      caregiverInvites = [];
      list.setData(caregiverInvites);

      // Ensure the container is hidden
      container.style.display = "none";
    }
  }

  /**
   * Updates the container's display property based on the current list.
   */
  function updateContainerDisplay() {
    if (caregiverInvites.length > 0) {
      container.style.display = "flex";
    } else {
      container.style.display = "none";
    }
  }

  // Load caregiver invites when initializing
  await loadCaregiverInvites();
}
