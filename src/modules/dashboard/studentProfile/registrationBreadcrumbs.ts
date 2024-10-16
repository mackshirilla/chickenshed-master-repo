// src/modules/pages/studentProfile/registrationBreadcrumbs.ts

import { WFComponent } from "@xatom/core";

/**
 * Interface representing the structure of caregiver_breadcrumbs.
 */
interface CaregiverBreadcrumbs {
  student_id: number;
  student_name: string;
  workshop_name: string;
  workshop_id: string;
  program_name: string;
  program_id: string;
  subscription_id: number;
}

/**
 * Initializes the event listeners for registration links to set caregiver_breadcrumbs in localStorage.
 */
export const initializeRegistrationBreadcrumbs = () => {
  // Define the selector for registration links.
  // Update this selector based on the actual structure of your registration links.
  const registrationLinkSelector = ".registration-link";

  /**
   * Event handler for registration link clicks.
   * @param event - The click event.
   */
  const handleRegistrationClick = (event: Event) => {
    // Prevent the default action if necessary.
    // Uncomment the next line if you want to handle navigation manually.
    // event.preventDefault();

    const target = event.target as HTMLElement;

    // Traverse up the DOM to find the registration link element if the click is on a child element.
    const registrationLink = target.closest(
      registrationLinkSelector
    ) as HTMLElement | null;

    if (!registrationLink) {
      console.warn("Clicked element is not a registration link.");
      return;
    }

    // Extract data attributes from the registration link.
    const studentId = parseInt(
      registrationLink.getAttribute("data-student-id") || "0",
      10
    );
    const studentName =
      registrationLink.getAttribute("data-student-name") || "";
    const workshopName =
      registrationLink.getAttribute("data-workshop-name") || "";
    const workshopId = registrationLink.getAttribute("data-workshop-id") || "";
    const programName =
      registrationLink.getAttribute("data-program-name") || "";
    const programId = registrationLink.getAttribute("data-program-id") || "";
    const subscriptionId = parseInt(
      registrationLink.getAttribute("data-subscription-id") || "0",
      10
    );

    // Validate the extracted data.
    if (
      !studentId ||
      !studentName ||
      !programName ||
      !programId ||
      !subscriptionId
    ) {
      console.error(
        "Incomplete registration data. Cannot set caregiver_breadcrumbs."
      );
      return;
    }

    // Create the caregiver_breadcrumbs object.
    const caregiverBreadcrumbs: CaregiverBreadcrumbs = {
      student_id: studentId,
      student_name: studentName,
      workshop_name: workshopName,
      workshop_id: workshopId,
      program_name: programName,
      program_id: programId,
      subscription_id: subscriptionId,
    };

    // Store the object in localStorage.
    try {
      localStorage.setItem(
        "caregiver_breadcrumbs",
        JSON.stringify(caregiverBreadcrumbs)
      );
      console.log(
        "caregiver_breadcrumbs set in localStorage:",
        caregiverBreadcrumbs
      );
    } catch (error) {
      console.error(
        "Failed to set caregiver_breadcrumbs in localStorage:",
        error
      );
    }
  };

  /**
   * Attaches the event listener using event delegation.
   */
  const attachEventListener = () => {
    // Attach the event listener to a common ancestor.
    // Update the selector based on your DOM structure. Here, we use the document body.
    const commonAncestor = document.body;

    if (!commonAncestor) {
      console.error("Common ancestor for event delegation not found.");
      return;
    }

    commonAncestor.addEventListener("click", handleRegistrationClick);
    console.log("Event listener for registration links attached.");
  };

  // Initialize the event listeners.
  attachEventListener();
};
