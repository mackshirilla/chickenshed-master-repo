// components/registration/alertBoxEarly.ts

import { loadState } from "../state/registrationState";

/**
 * Initializes the early registration alert box.
 * Displays the alert if the selected pricing option is "Monthly" and early_registration is true.
 * Populates the startDate span with the formatted start_date from the checkout preview.
 */
export const initializeAlertBoxEarly = () => {
  const alertBoxEarly = document.querySelector("#alertBoxEarly") as HTMLElement;
  const startDateSpan = document.querySelector("#startDate") as HTMLElement;

  if (!alertBoxEarly || !startDateSpan) {
    console.error("Early Alert Box elements not found");
    return;
  }

  const state = loadState();
  const { selectedPricingOption, early_registration, checkoutPreview } = state;

  // Check if selectedPricingOption is "Monthly" and early_registration is true
  if (
    selectedPricingOption === "Monthly" &&
    early_registration &&
    checkoutPreview &&
    checkoutPreview.start_date
  ) {
    // Parse the start_date as UTC
    const startDate = new Date(checkoutPreview.start_date);

    // Format the date in UTC to avoid timezone shifts
    const formatter = new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC", // Ensure formatting is done in UTC
    });

    const formattedDate = formatter.format(startDate);

    // Update the startDate span
    startDateSpan.textContent = formattedDate;

    // Display the alert box
    alertBoxEarly.style.display = "flex";
    console.log("Early registration alert box displayed with start date:", formattedDate);
  } else {
    // Hide the alert box if conditions are not met
    alertBoxEarly.style.display = "none";
    console.log("Early registration alert box hidden");
  }
};
