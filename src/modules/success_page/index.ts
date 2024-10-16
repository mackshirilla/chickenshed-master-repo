// src/success_page/index.ts

import { handleRegistrationSuccess } from "./registration_success";
import { handleTicketSuccess } from "./ticket_success";
import { handleDonationSuccess } from "./donation_success";

// Utility function to check URL parameters
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    isRegistration: params.has("registration"),
    isTicketPurchase: params.has("ticket_purchase"),
    isDonationSuccessful: params.has("donation_successful"),
  };
};

// Function to clear localStorage except specified keys
const clearLocalStorageExcept = (exceptions: string[]) => {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !exceptions.includes(key)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });
};

// Main initializer function
export const initializeSuccessPage = () => {
  console.log("Initializing success page");

  // Clear localStorage except for auth_config, auth_role, auth_user
  clearLocalStorageExcept(["auth_config", "auth_role", "auth_user"]);

  // Extract URL parameters
  const { isRegistration, isTicketPurchase, isDonationSuccessful } =
    getUrlParams();

  // Trigger registration success if appropriate parameter is present
  if (isRegistration) {
    console.log("Handling registration success");
    handleRegistrationSuccess();
  }

  // Trigger ticket success if appropriate parameter is present
  if (isTicketPurchase) {
    console.log("Handling ticket success");
    handleTicketSuccess();
  }

  // Trigger donation success if appropriate parameter is present
  if (isDonationSuccessful) {
    console.log("Handling donation success");
    handleDonationSuccess();
  } else {
    console.warn(
      "Donation success parameters not found in the URL. Please check your link and try again."
    );
  }
};
