// src/modules/forms/profiles/addStudentProfile/slider.ts

import { WFSlider } from "@xatom/slider";
import {
  setActiveStep,
  markStepAsCompleted,
  unmarkStepAsCompleted,
} from "./sidebar";

export const initializeSlider = (): WFSlider => {
  const slider = new WFSlider(".multi-step_form_slider");

  // Initialize the slider's slide change handler using imported functions
  slider.onSlideChange((activeIndex, prevIndex) => {
    console.log(`Slide changed from ${prevIndex} to ${activeIndex}`);

    // Set the active step in the sidebar
    setActiveStep(activeIndex + 1);

    if (prevIndex !== -1 && prevIndex < activeIndex) {
      // Moving forward: mark the previous step as completed
      markStepAsCompleted(prevIndex + 1);
    }

    if (prevIndex !== -1 && prevIndex > activeIndex) {
      // Moving backward: unmark steps beyond the current
      unmarkStepAsCompleted(prevIndex + 1);
    }
  });

  // Set the initial active sidebar step
  setActiveStep(slider.getActiveSlideIndex() + 1);

  return slider;
};
