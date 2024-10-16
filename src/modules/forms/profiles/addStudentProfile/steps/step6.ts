// src/modules/forms/profiles/addStudentProfile/stepSix.ts

import { WFComponent, WFFormComponent } from "@xatom/core";
import {
  setupValidation,
  createValidationFunction,
  toggleError,
} from "../../../../../utils/formUtils";
import { validateNotEmpty } from "../../../../../utils/validationUtils";
import { WFSlider } from "@xatom/slider";
import { unmarkStepAsCompleted, unsetActiveStep } from "../sidebar";

export const initializeStepSix = (slider: WFSlider) => {
  console.log("Initialize Step Six Form - Dismissal Permissions");

  // Step 6 Form Initialization
  const formStepSix = new WFFormComponent<{
    dismissal_names: string;
    independent_travel: boolean;
  }>("#formStepSix");

  // Define fields with associated validation rules and error messages
  const fieldsStepSix = [
    {
      input: new WFComponent("#dismissalNamesInput"),
      error: new WFComponent("#dismissalNamesInputError"),
      validationFn: validateNotEmpty,
      message: "Dismissal names are required",
    },
  ];

  // Initialize validation for each field
  fieldsStepSix.forEach(({ input, error, validationFn, message }) => {
    setupValidation(
      input,
      error,
      createValidationFunction(input, validationFn, message),
      new WFComponent("#submitStepSixError")
    );
  });

  // Handle form submission for Step 6
  formStepSix.onFormSubmit(async (formData, event) => {
    event.preventDefault(); // Stop default form submission
    let isFormValid = true;

    // Validate all fields before proceeding
    fieldsStepSix.forEach(({ input, error, validationFn, message }) => {
      const errorMessage = createValidationFunction(
        input,
        validationFn,
        message
      )();
      if (errorMessage) {
        toggleError(error, errorMessage, true);
        isFormValid = false;
      } else {
        toggleError(error, "", false);
      }
    });

    if (!isFormValid) {
      console.log("Validation failed:", formData);
      toggleError(
        new WFComponent("#submitStepSixError"),
        "Please correct all errors above.",
        true
      );
      return;
    }

    // Proceed to the next step
    slider.goNext();
  });

  // Handle back button for Step 6
  const backStepButton = new WFComponent("#backStepSix");
  backStepButton.on("click", () => {
    slider.goPrevious();
    unsetActiveStep(6);
    unmarkStepAsCompleted(5);
    unmarkStepAsCompleted(6);
  });
};
