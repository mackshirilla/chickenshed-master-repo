import { WFComponent } from "@xatom/core";
import { userAuth } from "../../../auth/authConfig";

// Initialize the sidebar indicators for the ticket form
export const initializeTicketSidebarIndicators = () => {
  const steps = [
    { id: "sidebarStepOne", index: 1 },
    { id: "sidebarStepTwo", index: 2 },
    { id: "sidebarStepThree", index: 3 },
    { id: "sidebarStepFour", index: 4 },
  ];

  // Set sidebar first name from userAuth
  const firstNameText = new WFComponent("#firstNameText");
  const user = userAuth.getUser();

  if (user && user.profile && user.profile.first_name) {
    firstNameText.setText(user.profile.first_name);
  } else {
    firstNameText.setText("Friend");
  }

  steps.forEach((step) => {
    const stepComponent = new WFComponent(`#${step.id}`);
    let isCompleted = false; // Track the completed state

    stepComponent.on("click", () => {
      if (isCompleted) {
        isCompleted = false;
        // Trigger reverse animation here if needed
      } else {
        isCompleted = true;
        // Trigger completed animation here
      }
    });
  });
};

// Set the active step for the ticket form
export const setActiveTicketStep = (stepNumber: number) => {
  const stepId = getTicketStepId(stepNumber);
  const stepComponent = new WFComponent(`#${stepId}`);
  stepComponent.addCssClass("is-active");
};

// Unset the active step for the ticket form
export const unsetActiveTicketStep = (stepNumber: number) => {
  const stepId = getTicketStepId(stepNumber);
  const stepComponent = new WFComponent(`#${stepId}`);
  stepComponent.removeCssClass("is-active");
};

// Mark step as completed for the ticket form
export const markTicketStepAsCompleted = (stepNumber: number) => {
  const stepId = getTicketStepId(stepNumber);
  const step = new WFComponent(`#${stepId}`);
  step.getElement().click(); // Programmatically trigger the click event to mark as complete
};

// Unmark step as completed (reverse the completed animation) for the ticket form
export const unmarkTicketStepAsCompleted = (stepNumber: number) => {
  const stepId = getTicketStepId(stepNumber);
  const step = new WFComponent(`#${stepId}`);
  step.getElement().click(); // Programmatically trigger the click event to unmark as complete
};

// Helper function to get the ID string for a step in the ticket form
const getTicketStepId = (stepNumber: number): string => {
  const stepMap: Record<number, string> = {
    1: "sidebarStepOne",
    2: "sidebarStepTwo",
    3: "sidebarStepThree",
    4: "sidebarStepFour",
  };
  return stepMap[stepNumber] || `ticketSidebarStep${stepNumber}`;
};
