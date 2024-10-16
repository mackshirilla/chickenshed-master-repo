// src/modules/tickets/components/userDetailsUI.ts
import { WFComponent } from "@xatom/core";
import { authManager } from "../../../auth/authConfig";
import { saveUserDetails } from "../state/ticketPurchaseState"; // Import the save function from state

export const initializeUserDetails = () => {
  const emailWrap = new WFComponent("#emailWrap");
  const firstNameInput = new WFComponent("#firstNameInput");
  const lastNameInput = new WFComponent("#lastNameInput");
  const emailInput = new WFComponent("#emailInput");

  // Check if the user is logged in
  const user = authManager.getUserAuth().getUser();

  if (user && user.email) {
    // User is logged in, hide the emailWrap and populate the state
    emailWrap.setStyle({ display: "none" });

    // Save the user details to the state
    saveUserDetails({
      firstName: user.profile?.first_name || "",
      lastName: user.profile?.last_name || "",
      email: user.email,
    });
  } else {
    // User is not logged in, show the emailWrap
    emailWrap.setStyle({ display: "grid" });

    // Set up event listeners to save user input to the state
    firstNameInput.on("input", () => {
      const firstName = (firstNameInput.getElement() as HTMLInputElement).value;
      saveUserDetails({ firstName });
    });

    lastNameInput.on("input", () => {
      const lastName = (lastNameInput.getElement() as HTMLInputElement).value;
      saveUserDetails({ lastName });
    });

    emailInput.on("input", () => {
      const email = (emailInput.getElement() as HTMLInputElement).value;
      saveUserDetails({ email });
    });
  }
};
