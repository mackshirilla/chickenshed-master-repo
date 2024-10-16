// src/modules/forms/profiles/addStudentProfile/stepThree.ts

import { WFComponent, WFFormComponent } from "@xatom/core";
import {
  setupValidation,
  createValidationFunction,
  toggleError,
} from "../../../../../utils/formUtils";
import { validateNotEmpty } from "../../../../../utils/validationUtils";
import { WFSlider } from "@xatom/slider";
import { unmarkStepAsCompleted, unsetActiveStep } from "../sidebar";

export const initializeStepThree = (slider: WFSlider) => {
  console.log("Initialize Step Three Form");

  // Step 3 Form Initialization
  const formStepThree = new WFFormComponent<{
    health: string;
  }>("#formStepThree");

  // Define the fields with associated validation rules and error messages
  const fieldsStepThree = [
    {
      input: new WFComponent("#healthInput"),
      error: new WFComponent("#healthInputError"),
      validationFn: validateNotEmpty,
      message: "Health information is required",
    },
  ];

  // Initialize validation for each field
  fieldsStepThree.forEach(({ input, error, validationFn, message }) => {
    setupValidation(
      input,
      error,
      createValidationFunction(input, validationFn, message),
      new WFComponent("#submitStepThreeError")
    );
  });

  // Handle form submission for Step 3
  formStepThree.onFormSubmit(async (formData, event) => {
    event.preventDefault(); // Stop default form submission
    let isFormValid = true;

    // Validate all fields before proceeding
    fieldsStepThree.forEach(({ input, error, validationFn, message }) => {
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
      toggleError(
        new WFComponent("#submitStepThreeError"),
        "Please correct all errors above.",
        true
      );
      return;
    }

    // Proceed to the next step
    slider.goNext();
  });

  // Handle back button for Step 3
  const backStepButton = new WFComponent("#backStepThree");
  backStepButton.on("click", () => {
    slider.goPrevious();
    unsetActiveStep(3);
    unmarkStepAsCompleted(2);
    unmarkStepAsCompleted(3);
  });
};
