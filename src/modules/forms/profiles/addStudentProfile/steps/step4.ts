// src/modules/forms/profiles/addStudentProfile/stepFour.ts

import { WFComponent } from "@xatom/core";
import { WFSlider } from "@xatom/slider";
import { initializeCaregiverDialog } from "../caregiverDialog";
import { unmarkStepAsCompleted, unsetActiveStep } from "../sidebar";

export const initializeStepFour = (slider: WFSlider) => {
  console.log("Initialize Step Four Form - Invite Caregiver");

  // Initialize Caregiver Dialog/Form
  initializeCaregiverDialog(slider);

  // Handle Step 4 submission (Continue to Step 5)
  const submitStepFour = new WFComponent("#submitStepFour");
  submitStepFour.on("click", () => {
    slider.goNext();
  });

  // Handle back button for Step 4
  const backStepButton = new WFComponent("#backStepFour");
  backStepButton.on("click", () => {
    slider.goPrevious();
    unsetActiveStep(4);
    unmarkStepAsCompleted(3);
    unmarkStepAsCompleted(4);
  });
};
