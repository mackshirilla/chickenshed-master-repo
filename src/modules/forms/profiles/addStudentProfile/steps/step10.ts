// src/modules/forms/profiles/addStudentProfile/steps/step10.ts

import { WFComponent } from "@xatom/core";
import { WFSlider } from "@xatom/slider";

export const initializeStepTen = (slider: WFSlider) => {
  // Initialize the back button for Step 10
  const backStepTen = new WFComponent("#backStepTen");

  // Event listener for going back to Step 9
  backStepTen.on("click", () => {
    slider.goPrevious();
  });
};
