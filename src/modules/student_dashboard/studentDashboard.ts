// src/pages/dashboard.ts

import { WFComponent } from "@xatom/core";
import { initializeDynamicStudentDashboardFileList } from "./listStudentDashboardFiles"; // Adjust path if necessary
import { userAuth } from "../../auth/authConfig";

export const initializeStudentDashboard = async () => {
    const firstNameText = new WFComponent("#firstNameText");
    firstNameText.setText(userAuth.getUser().profile.first_name);

  try {
    // Initialize and render the dynamic file list
    await initializeDynamicStudentDashboardFileList("#filesList"); // Replace with your actual container selector

    // Trigger the success event if needed
    triggerSuccessEvent(".success_trigger");
  } catch (error) {
    console.error("Error initializing student dashboard:", error);
    // Optionally, display an error message to the user
    const requestError = new WFComponent("#requestError");
    requestError.setText("Failed to load dashboard files. Please try again later.");
    requestError.setStyle({ display: "block" });
  }
};

// Function to programmatically trigger a click event on a specified selector
const triggerSuccessEvent = (selector: string) => {
  const successTrigger = document.querySelector(selector);
  if (successTrigger instanceof HTMLElement) {
    successTrigger.click();
  } else {
    console.warn(`No element found for selector: ${selector}`);
  }
};
