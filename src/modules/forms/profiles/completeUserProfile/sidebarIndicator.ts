// sidebarIndicators.ts

import { WFComponent } from "@xatom/core";
import { userAuth } from "../../../../auth/authConfig";

// Initialize the sidebar indicators
export const initializeSidebarIndicators = () => {
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

// Set the active step
export const setActiveStep = (stepNumber: number) => {
  const stepId = getStepId(stepNumber);
  const stepComponent = new WFComponent(`#${stepId}`);
  stepComponent.addCssClass("is-active");
};

// Unset the active step
export const unsetActiveStep = (stepNumber: number) => {
  const stepId = getStepId(stepNumber);
  const stepComponent = new WFComponent(`#${stepId}`);
  stepComponent.removeCssClass("is-active");
};

// Mark step as completed
export const markStepAsCompleted = (stepNumber: number) => {
  const stepId = getStepId(stepNumber);
  const step = new WFComponent(`#${stepId}`);
  step.getElement().click(); // Programmatically trigger the click event to mark as complete
};

// Unmark step as completed (reverse the completed animation)
export const unmarkStepAsCompleted = (stepNumber: number) => {
  const stepId = getStepId(stepNumber);
  const step = new WFComponent(`#${stepId}`);
  step.getElement().click(); // Programmatically trigger the click event to unmark as complete
};

// Helper function to get the ID string for a step
const getStepId = (stepNumber: number): string => {
  const stepMap: Record<number, string> = {
    1: "sidebarStepOne",
    2: "sidebarStepTwo",
    3: "sidebarStepThree",
    4: "sidebarStepFour",
  };
  return stepMap[stepNumber] || `sidebarStep${stepNumber}`;
};
